import cytoscape from "cytoscape";
import { DimensionEnricher, MetricEnricher, ComposedDimensionEnricher } from "./Headless/Enricher";
import { StructureHandler } from "./Headless/StructureHandler";
import { EdgeLifter } from "./Headless/EdgeLifter";
import { CleanUpProcessor } from "./Headless/CleanUpProcessor";
import AnalyticAspect from "./AnalyticAspect";

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

    const analyticAspect = new AnalyticAspect()
    analyticAspect.collectAnalyticAspect(this.cy);

    const structureHandler = new StructureHandler(this.cy);
    this.showStructure ? structureHandler.handleParentChild() : structureHandler.hideStructure();

    new EdgeLifter(this.cy).lift();
    new CleanUpProcessor(this.cy).clean();
    
    return analyticAspect.getAnalyticAspectTemp();
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