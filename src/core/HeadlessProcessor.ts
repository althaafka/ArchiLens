import cytoscape from "cytoscape";
import { DimensionEnricher, MetricEnricher, ComposedDimensionEnricher, DepthEnricher } from "./Headless/Enricher";
import { StructureHandler } from "./Headless/StructureHandler";
import { EdgeLifter } from "./Headless/EdgeLifter";
import { CleanUpProcessor } from "./Headless/CleanUpProcessor";
import AnalyticAspect from "./AnalyticAspect";
import {getRoot} from "../utils/graphUtils"

export default class HeadlessProcessor {
  private cy: cytoscape.Core;
  private showStructure: boolean;
  constructor(cy: cytoscape.Core) {
    this.cy = cy;
  }
  
  public process(showStructure: boolean): any {
    this.showStructure = showStructure;

    this.flattenParentChild();

    new DimensionEnricher(this.cy).enrich();
    new MetricEnricher(this.cy).enrich();
    new ComposedDimensionEnricher(this.cy, this.showStructure).enrich();
    
    
    const structureHandler = new StructureHandler(this.cy);
    this.showStructure ? structureHandler.handleParentChild() : structureHandler.hideStructure();
    const depthData = new DepthEnricher(this.cy, this.showStructure).enrich();
    
    const analyticAspect = new AnalyticAspect()
    analyticAspect.collectAnalyticAspect(this.cy, depthData);

    // const edgelifter = new EdgeLifter(this.cy)
    // edgelifter.lift(3);
    // edgelifter.unlift(3)
    
    new CleanUpProcessor(this.cy).clean();
    
    return analyticAspect;
  }

  private filterAndLiftContainer(container: cytoscape.NodeSingular): void {
    const children = container.children();
    console.log("CHILD")
    children.forEach(child => console.log(child.data()))

    const childIds = new Set(children.map(n => n.id()));

    // 2. Hide all nodes that are not children of the container
    this.cy.nodes().forEach(node => {
      if (!childIds.has(node.id()) && node.id() != container.id()) {
        node.remove();
      }
    });

    // buat supaya edges naik ke anak container semua dengan yang memiliki label sama maka weight nya akan ditambah

  }

  private flattenParentChild(): void {
    console.log("FLATTEN PARENT-CHILD")
    this.cy.nodes().forEach(node => {
      if (node.parent().nonempty()) {
        node.move({ parent: null });
      }
    });
  }   
  
}