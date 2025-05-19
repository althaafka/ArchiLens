import { generateColorMap, addScratch, lightenHSLArray, lightenHSL, generateColorMetric } from '../utils/utils';
import cytoscape from 'cytoscape';

export default class VisualProcessor {
  private cy: cytoscape.Core;
  private dimension: any;

  constructor(cy: cytoscape.Core, dimension: any) {
    this.cy = cy;
    this.dimension = dimension;
  }

  public process(): void {
    this.cy.startBatch();
    this.initNodeColors();
    this.setNodeStyles();
    this.cy.endBatch();
  }

  private initNodeColors(): void {
    this.dimension.colorMap = {};
    this.dimension.dimension.forEach((dim: any) => {
      this.dimension.colorMap[dim.id] = generateColorMap(dim.categories);
    });
  }

  private setNodeStyles(): void {
    this.setDefaultNodeStyle();
    this.setMetricStyles();
    this.setDimensionStyles();
  }

  private setDefaultNodeStyle(): void {
    const nodes = this.cy.nodes().filter(node =>
      node.data('labels')?.includes('Structure') && node.data('id') !== 'java.lang.String'
    );
    nodes.forEach((node) => {
      addScratch(node, 'style_none', {
        'background-color': 'hsl(0, 0%, 95%)',
        'display': 'element',
        'background-fill': 'solid'
      });
    });

    const containers = this.cy.nodes().filter(node =>
      node.data('labels')?.includes('Container') &&
      !node.data('labels')?.includes('Structure') &&
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

    const minLightness = 80;
    const maxLightness = 92;
    containers.forEach((node) => {
      let depth = 0;
      let current = node;
      while (current.parent().length > 0) {
        depth++;
        current = current.parent().first();
      }
      const lightness = minLightness + ((maxLightness - minLightness) / maxDepth) * depth;
      const adjustedColor = `hsl(0, 0%, ${lightness}%)`;
      addScratch(node, 'style_none', {
        'background-color': adjustedColor,
        'border-color': 'hsl(0, 0%, 35%)',
        'display': 'element',
        'background-fill': 'solid'
      });
    });
  }

  private setMetricStyles(): void {
    this.dimension.metric?.forEach((m: any) => {
      m.properties.members.forEach(([nodeId, value]: [string, number]) => {
        if (nodeId === 'java.lang.String') return;
        const node = this.cy.getElementById(nodeId);
        const color = generateColorMetric(m.properties.minValue, m.properties.maxValue, value);

        addScratch(node, `style_${m.id}`, {
          'background-color': color,
          'border-color': '#5E5E5E',
          'background-fill': 'solid',
          'display': 'element'
        });
      });
    });
  }

  private setDimensionStyles(): void {
    this.dimension.dimension?.forEach((dim: any) => {
      if (!this.dimension.composedDimension.includes(dim.id)) {
        // Simple dimension
        const nodes = this.cy.nodes().filter(n => n.hasClass('layers') && n.data('id') !== 'java.lang.String');
        nodes.forEach((node) => {
            if (node.id() == "nl.tudelft.jpacman.PacmanConfigurationException") {
                console.log(dim.id)
                console.log("sdf")
            }
          const categoryIds = node.data('properties')?.dimension;
          if (categoryIds && categoryIds[dim.id]) {
            if (node.id() == "nl.tudelft.jpacman.PacmanConfigurationException") {
                console.log(dim.id)
                console.log("sdf2")
            }
            const colors = categoryIds[dim.id].map((id: string) =>
              this.dimension.colorMap[dim.id][id] || '#f2f2f2'
            );
            const positions = colors.map((_, index) => `${(index / (colors.length - 1)) * 100}%`);

            const style = categoryIds[dim.id].length === 1
              ? {
                  'background-color': colors[0],
                  'border-color': '#5E5E5E',
                  'background-fill': 'solid',
                  'display': 'element'
                }
              : {
                  'background-fill': 'linear-gradient',
                  'background-gradient-direction': 'to-right',
                  'background-gradient-stop-colors': colors,
                  'background-gradient-stop-positions': positions,
                  'border-color': '#5E5E5E',
                  'display': 'element'
                };

            addScratch(node, `style_${dim.id}`, style);
          } else if (node.data('properties').composedDimension[dim.id]){
            if (node.id() == "nl.tudelft.jpacman.PacmanConfigurationException") {
                console.log(dim.id)
                console.log("sdf3")
            }
                const categoriesId = node.data('properties').composedDimension;
                if (categoriesId && categoriesId[dim.id]){
                    if (Object.keys(categoriesId[dim.id]).length == 0) return;

                    const composedDimension = node.data('properties').composedDimension[dim.id];
                    const totalWeight  = Object.keys(composedDimension).reduce((acc, cat) => acc + (Number(categoriesId[dim.id][cat]) || 0), 0);
                    const colors =  dim.categories.filter(cat => Object.keys(composedDimension).includes(cat)).flatMap((cat) => [this.dimension.colorMap[dim.id][cat], this.dimension.colorMap[dim.id][cat]]);

                    let cumulativePercentage = 0;
                    const positions = dim.categories
                        .filter(cat => Object.keys(composedDimension).includes(cat))
                        .flatMap((cat) => {
                            const weight = Number(categoriesId[dim.id]?.[cat]) || 0;
                            const percentage = (weight / totalWeight) * 100;
                            const startPercentage = cumulativePercentage;
                            cumulativePercentage += percentage;
                            if (cumulativePercentage > 100) cumulativePercentage = 100;
                            if (100 - cumulativePercentage < 0.00001) cumulativePercentage = 100;
                            const endPercentage = cumulativePercentage;
                            return [`${startPercentage}%`, `${endPercentage}%`];
                        });


                    const isPureContainer = node.data('labels').includes("Container") && !node.data('labels').includes("Structure")

                    return addScratch(node, `style_${dim.id}`, Object.keys(categoriesId[dim.id]).length == 1
                        ? {
                            'background-color': isPureContainer? lightenHSL(colors[0], 15) :colors[0],
                            'border-color': '#5E5E5E',
                            'display': 'element',
                            "background-fill": 'solid'
                        }
                        : {
                            "background-fill": "linear-gradient",
                            "background-gradient-direction": isPureContainer? 'to-bottom-right': "to-right",
                            "background-gradient-stop-colors": isPureContainer? lightenHSLArray(colors) : colors,
                            "background-gradient-stop-positions": positions,
                            "border-color": '#5E5E5E',
                            'display': 'element',
                        })
                }
          } else {
            addScratch(node, `style_${dim.id}`, {
                'display': 'element',
            });
          }
        });
      } else {
                   const container = this.cy.nodes().filter(node => node.data('labels').includes("Container") && !node.data('labels').includes("Structure"));
                    container.forEach((node) => {
                        addScratch(node, `style_${dim.id}`, {
                            'background-color': 'hsl(0, 0%, 85%)',
                            'display': 'element',
                            'background-fill': 'solid',
                        })
                    })     
                    const nodes = this.cy.nodes().filter(n => n.hasClass('layers') && n.data('id') !== "java.lang.String")
                    nodes.forEach((node) => {
                        const categoriesId = node.data('properties').composedDimension;
                        if (categoriesId && categoriesId[dim.id]){
                            if (Object.keys(categoriesId[dim.id]).length == 0) return;
        
                            const composedDimension = node.data('properties').composedDimension[dim.id];
                            const totalWeight  = Object.keys(composedDimension).reduce((acc, cat) => acc + (Number(categoriesId[dim.id][cat]) || 0), 0);
                            const colors =  dim.categories.filter(cat => Object.keys(composedDimension).includes(cat)).flatMap((cat) => [this.dimension.colorMap[dim.id][cat], this.dimension.colorMap[dim.id][cat]]);
        
                            let cumulativePercentage = 0;
                            const positions = dim.categories
                                .filter(cat => Object.keys(composedDimension).includes(cat))
                                .flatMap((cat) => {
                                    const weight = Number(categoriesId[dim.id]?.[cat]) || 0;
                                    const percentage = (weight / totalWeight) * 100;
                                    const startPercentage = cumulativePercentage;
                                    cumulativePercentage += percentage;
                                    if (cumulativePercentage > 100) cumulativePercentage = 100;
                                    if (100 - cumulativePercentage < 0.00001) cumulativePercentage = 100;
                                    const endPercentage = cumulativePercentage;
                                    return [`${startPercentage}%`, `${endPercentage}%`];
                                });
        
        
                            const isPureContainer = node.data('labels').includes("Container") && !node.data('labels').includes("Structure")
        
                            return addScratch(node, `style_${dim.id}`, Object.keys(categoriesId[dim.id]).length == 1
                                ? {
                                    'background-color': isPureContainer? lightenHSL(colors[0], 15) :colors[0],
                                    'border-color': '#5E5E5E',
                                    'display': 'element',
                                    "background-fill": 'solid'
                                }
                                : {
                                    "background-fill": "linear-gradient",
                                    "background-gradient-direction": isPureContainer? 'to-bottom-right': "to-right",
                                    "background-gradient-stop-colors": isPureContainer? lightenHSLArray(colors) : colors,
                                    "background-gradient-stop-positions": positions,
                                    "border-color": '#5E5E5E',
                                    'display': 'element',
                                })
                        }
                    })
      }
    });
  }
}
