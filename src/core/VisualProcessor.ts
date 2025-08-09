import cytoscape from "cytoscape";
import { addScratch } from "../utils/utils";
import { nodeHasLabels, isPureContainer } from "../utils/nodeUtils";
import { 
  DEFAULT_STRUCTURE_COLOR,
  DEFAULT_BORDER_COLOR
} from "../constants/colorConstants";
import AnalysisAspect from "./AnalyticAspect";
import { getNodeCategoryId, getNodeComposedCategory } from "../utils/analyticAspectUtils";
import { lightenHSL, lightenHSLArray, generateColorMetric, interpolateHexColor } from "../utils/colorUtils";

export default class VisualProcessor {
  constructor(
    private cy: cytoscape.Core,
    private data: AnalysisAspect,
    private showStructure: boolean
  ) {
    this.cy = cy;
    this.data = data;
    this.showStructure = showStructure
  }

  public process(): void {
    this.cy.startBatch();
    this.setDefaultNodeStyle();
    this.setDimensionNodeStyle();
    this.setMetricNodeStyle();
    this.cy.endBatch();
  }
  
  private setDefaultNodeStyle(): void {
    const nodes = this.cy.nodes();
    
    const structures = nodes.filter(node => 
      nodeHasLabels(node, ["Structure"]) && node.id() !== 'java.lang.String'
    )
    
    structures.forEach(n => addScratch(n, 'style_none', {
      'background-color': DEFAULT_STRUCTURE_COLOR,
      'background-fill': 'solid'
    }));
    
    const containers = this.cy.nodes().filter(node =>
      isPureContainer(node) &&
      node.data('id') !== 'java.lang.String'
    ) as cytoscape.NodeCollection;
    
    let maxDepth = 0;
    containers.forEach((node) => {
      let depth = 0;
      let current = node;
      while (current.parent().length > 0) {
        depth++;
        current = current.parent().first();
      }
      maxDepth = Math.max(maxDepth, depth);
    });
    const minColor = '#f5f5f4';
    const maxColor = '#d6d3d1';

    containers.forEach((node) => {
      let depth = 0;
      let current = node;
      while (current.parent().length > 0) {
        depth++;
        current = current.parent().first();
      }
    
      const ratio = maxDepth === 0 ? 0 : depth / maxDepth;
      const adjustedColor = interpolateHexColor(maxColor, minColor, ratio);
    
      addScratch(node, 'style_none', {
        'background-color': adjustedColor,
        'border-color': DEFAULT_BORDER_COLOR,
        'background-fill': 'solid'
      });
    });
  }
  
  private setDimensionNodeStyle(): void {
    const nodes = this.cy.nodes();
    this.data.dimension.forEach(dim => {
      nodes.forEach(node => {
        const composedCategories = getNodeComposedCategory(node, dim.id);
        if (composedCategories) {
          
          const totalWeight  = Object.keys(composedCategories).reduce((acc, cat) => acc + (Number(composedCategories[cat]) || 0), 0);
          const colors = dim.categories.filter(cat => 
            Object.keys(composedCategories).includes(cat)).flatMap((cat) => [this.data.colorMap[dim.id][cat], this.data.colorMap[dim.id][cat]]
          )
          
          let cumulativePercentage = 0;
          const positions = dim.categories
          .filter(cat => Object.keys(composedCategories).includes(cat))
          .flatMap((cat) => {
            const weight = Number(composedCategories?.[cat]) || 0;
            const percentage = (weight / totalWeight) * 100;
            const startPercentage = cumulativePercentage;
            cumulativePercentage += percentage;
            if (cumulativePercentage > 100) cumulativePercentage = 100;
            if (100 - cumulativePercentage < 0.00001) cumulativePercentage = 100;
            const endPercentage = cumulativePercentage;
            return [`${startPercentage}%`, `${endPercentage}%`];
          });
          // console.log("positions1:", positions, dim.id, node.id())
          // console.log("colors1:", colors, dim.id, node.id())
          
          const isPureContainerNode = isPureContainer(node)
          const style = Object.keys(composedCategories).length === 1 ? {
            'background-color': isPureContainerNode && this.showStructure? lightenHSL(colors[0], 15) :colors[0],
            'border-color': DEFAULT_BORDER_COLOR,
            'background-fill': 'solid'
          } : {
            'background-fill': 'linear-gradient',
            'background-gradient-direction': isPureContainerNode && this.showStructure ? 'to-bottom-right' : 'to-right',
            'background-gradient-stop-colors': isPureContainerNode && this.showStructure? lightenHSLArray(colors) : colors,
            'background-gradient-stop-positions': positions,
            'border-color': DEFAULT_BORDER_COLOR,
          };
          
          addScratch(node, `style_${dim.id}`, style);
        } else {
  const categoryIdsRaw = getNodeCategoryId(node, dim.id);
  if (!categoryIdsRaw || categoryIdsRaw.length === 0) return;

  // Urutkan sesuai dim.categories supaya konsisten
  // console.log(dim.categories)
  const orderedIds = dim.categories.filter(id => categoryIdsRaw.includes(id));
  const n = orderedIds.length;
  // console.log("orderedIds", orderedIds)

  const isPureContainerNode = isPureContainer(node);

  // Single color: solid
  if (n === 1) {
    const base = this.data.colorMap[dim.id]?.[orderedIds[0]] || DEFAULT_STRUCTURE_COLOR;
    const color = isPureContainerNode && this.showStructure? lightenHSL(base, 15) : base;
    addScratch(node, `style_${dim.id}`, {
      'background-color': color,
      'border-color': DEFAULT_BORDER_COLOR,
      'background-fill': 'solid',
    });
    return;
  }

  const colors = orderedIds.flatMap(id => {
    const base = this.data.colorMap[dim.id]?.[id] || DEFAULT_STRUCTURE_COLOR;
    const color = isPureContainerNode && this.showStructure ? lightenHSL(base, 15) : base;
    return [color, color];
  });

  const step = 100 / n;
  let acc = 0;
  const positions: string[] = [];
  for (let i = 0; i < n; i++) {
    const start = acc;
    acc += step;
    if (acc > 100) acc = 100;
    if (100 - acc < 0.00001) acc = 100;
    positions.push(`${start}%`, `${acc}%`);
  }



  addScratch(node, `style_${dim.id}`, {
    'background-fill': 'linear-gradient',
    'background-gradient-direction': 'to-right',
    'background-gradient-stop-colors': isPureContainerNode && this.showStructure? lightenHSLArray(colors) : colors,
    'background-gradient-stop-positions': positions,
    'border-color': DEFAULT_BORDER_COLOR,
  });
}

        // } else {
        //     let categoryIds = getNodeCategoryId(node, dim.id);
        //     if (!categoryIds || categoryIds.length === 0) return;
        //     const colors = categoryIds?.map(id =>
        //       this.data.colorMap[dim.id]?.[id] || DEFAULT_STRUCTURE_COLOR
        //     );

        //     const n = categoryIds.length;
        //       let cumulative = 0;
        //       const step = 100 / n;
        //       const positions: string[] = [];
        //       for (let i = 0; i < n; i++) {
        //         const start = cumulative;
        //         cumulative += step;
        //         if (cumulative > 100) cumulative = 100;
        //         if (100 - cumulative < 0.00001) cumulative = 100;
              
        //         positions.push(`${start}%`, `${cumulative}%`);
        //       }

        //     // const positions = colors.map((_, index) => `${(index / (colors.length - 1)) * 100}%`);
        //     console.log("colors", colors, dim.id, node.id())
        //     console.log("positions", positions, dim.id, node.id())
  
        //     const style = categoryIds.length === 1 ? {
        //       'background-color': colors[0],
        //       'border-color': DEFAULT_BORDER_COLOR,
        //       'background-fill': 'solid',
        //     } : {
        //       'background-fill': 'linear-gradient',
        //       'background-gradient-direction': 'to-right',
        //       'background-gradient-stop-colors': colors,
        //       'background-gradient-stop-positions': positions,
        //       'border-color': DEFAULT_BORDER_COLOR,
        //     };
  
        //     addScratch(node, `style_${dim.id}`, style);
        //   }
        });
    })
  }

  private setMetricNodeStyle(): void {
    this.data.metric?.forEach(metric => {
      metric.properties.members.forEach(([nodeId, value]: [string, number]) => {
        if (nodeId === 'java.lang.String') return;
        const node = this.cy.getElementById(nodeId);
        if (!node.nonempty()) return;

        const color = generateColorMetric(
          metric.properties.minValue,
          metric.properties.maxValue,
          value
        );

        addScratch(node, `style_${metric.id}`, {
          'background-color': color,
          'border-color': DEFAULT_BORDER_COLOR,
          'background-fill': 'solid',
        });
      });
    });
  }
}
