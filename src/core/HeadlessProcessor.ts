import cytoscape from "cytoscape";
import { DimensionEnricher, MetricEnricher, ComposedDimensionEnricher, DepthEnricher } from "./Headless/Enricher";
import { StructureHandler } from "./Headless/StructureHandler";
import { CleanUpProcessor } from "./Headless/CleanUpProcessor";
import AnalyticAspect from "./AnalyticAspect";

export default class HeadlessProcessor {
  private cy: cytoscape.Core;
  private showStructure: boolean;
  constructor(cy: cytoscape.Core) {
    this.cy = cy;
  }
  
  public process(showStructure: boolean, containerFocus: string): any {
    this.showStructure = showStructure;

    this.flattenParentChild();

    new DimensionEnricher(this.cy).enrich();
    new MetricEnricher(this.cy).enrich();
    new ComposedDimensionEnricher(this.cy, this.showStructure, "").enrich();
    
    const structureHandler = new StructureHandler(this.cy);
    let containsMap
    if (this.showStructure) {
      structureHandler.handleParentChild()
    } else {
      containsMap = structureHandler.hideStructure();
    }
    const depthData = new DepthEnricher(this.cy).enrich();

    if (showStructure && containerFocus != "") {
      structureHandler.handleContainerFocus(containerFocus, depthData)
    }
    
    const analyticAspect = new AnalyticAspect()
    analyticAspect.collectAnalyticAspect(this.cy, depthData, containsMap);

    new CleanUpProcessor(this.cy).clean();
    
    return analyticAspect;
  }

  // private filterAndLiftContainer(container: cytoscape.NodeSingular): void {
  //   const children = container.children();
  //   children.forEach(child => console.log(child.data()))

  //   const getAncestors = (node: cytoscape.NodeSingular): cytoscape.NodeSingular[] => {
  //     const ancestors: cytoscape.NodeSingular[] = [];
  //     let current = node;

  //     while (current.parent().nonempty()) {
  //       const parent = current.parent()[0];
  //       ancestors.push(parent);
  //       current = parent;
  //     }

  //     return ancestors;
  //   };

  //   const visibleNodes = new Set<string>([
  //     container.id(),
  //     ...children.map(n => n.id()),
  //     ...getAncestors(container).map(n => n.id()),
  //   ]);

  //   console.log("VISIBLE NODES:", visibleNodes)

  //   this.cy.nodes().forEach(node => {
  //     if (!visibleNodes.has(node.id())) {
  //       node.remove()
  //     }
  //   });
  // }

  private flattenParentChild(): void {
    console.log("FLATTEN PARENT-CHILD")
    this.cy.nodes().forEach(node => {
      if (node.parent().nonempty()) {
        node.move({ parent: null });
      }
    });
  }   
  
}