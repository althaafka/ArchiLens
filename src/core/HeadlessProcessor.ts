import cytoscape from "cytoscape";
import { DimensionEnricher, MetricEnricher, ComposedDimensionEnricher, DepthEnricher } from "./Headless/Enricher";
import { StructureHandler } from "./Headless/StructureHandler";
import { CleanUpProcessor } from "./Headless/CleanUpProcessor";
import AnalyticAspect from "./AnalyticAspect";

export default class HeadlessProcessor {

  public static process(cy: cytoscape.Core, showStructure: boolean, containerFocus: string): any {

    DimensionEnricher.enrich(cy);
    MetricEnricher.enrich(cy);
    ComposedDimensionEnricher.enrich(cy, showStructure, "");
    
    const structureHandler = new StructureHandler(cy);
    let containsMap
    if (showStructure) {
      structureHandler.handleParentChild()
    } else {
      containsMap = structureHandler.hideStructure();
    }
    const depthData = DepthEnricher.enrich(cy);

    if (showStructure && containerFocus != "") {
      structureHandler.handleContainerFocus(containerFocus, depthData)
    }
    
    const analyticAspect = new AnalyticAspect()
    analyticAspect.collectAnalyticAspect(cy, depthData, containsMap);

    new CleanUpProcessor(cy).clean();

    
    return analyticAspect;
  }
}