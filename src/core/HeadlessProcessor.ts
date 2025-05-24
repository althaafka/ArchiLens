import cytoscape from "cytoscape";
import { getEdgeLabel, edgeHasLabel } from "@/utils/edgeUtils";
import { getNodeLabels, nodeHasLabels } from "@/utils/nodeUtils";
import { detailedNodesLabel } from "@/const/const";

export default class HeadlessProcessor {
  private cy: cytoscape.Core;

  constructor(cy: cytoscape.Core) {
    this.cy = cy;
    // this.edges = this.cy.edges();
    // this.nodes = this.cy.nodes();

  }

  public process(): any {
    // this.processDimension();
    // this.processMetric();
    // this.groupLayers();
    // const analyticAspect = this.collectAnalyticAspect()
    this.handleParentChild();
    this.liftEdges();
    this.cleanUp();
    // return analyticAspect;
  }

  private processDimension(): void {

  }

  private processMetric(): void {

  }

  private groupLayers(): void {

  }

  private handleParentChild(): void {
      const containsMap = new Map<string, string[]>();
    
      // Bangun peta: target → list of parent candidates
      this.cy.edges().forEach(edge => {
        if (edgeHasLabel(edge, "contains")) {
          const sourceId = edge.data('source');
          const targetId = edge.data('target');
    
          if (containsMap.has(targetId)) {
            containsMap.get(targetId)?.push(sourceId);
          } else {
            containsMap.set(targetId, [sourceId]);
          }
        }
      });
    
      this.cy.nodes().forEach(node => {
        if (JSON.stringify(getNodeLabels(node)) === JSON.stringify(["Container"])) {
          node.addClass('package');
        }

        const nodeId = node.id();
        const parentCandidates = containsMap.get(nodeId) || [];

        let parentNode = null;
    
        for (let candidateId of parentCandidates) {
          let candidate = this.cy.getElementById(candidateId);
    
          while (candidate && nodeHasLabels(candidate, ["Structure"])) {
            const nextParentId = containsMap.get(candidate.id())?.[0];
            if (!nextParentId) break;
            candidate = this.cy.getElementById(nextParentId);
          }
    
          if (candidate.nonempty() && !nodeHasLabels(candidate,["Structure"])) {
            parentNode = candidate;
            break;
          }
        }
    
        if (parentNode) {
          node.move({ parent: parentNode.id() });
        }
      });
    
  }

  private liftEdges(): void {
    const newEdges = this.cy.edges().filter( (edge: cytoscape.EdgeSingular) => {
      const source = edge.source();
      const target = edge.target();
      return (nodeHasLabels(source, ["Structure"]) &&
        nodeHasLabels(target, ["Structure"]) &&
        target.parent() != source.parent())
    }).reduce((acc: any, e: cytoscape.EdgeSingular) => {
      const srcParent = e.source().parent().first().id();
      const tgtParent = e.target().parent().first().id();
      const nodeSrc = this.cy.nodes().filter(node => node.id() == srcParent);
      const nodeTgt = this.cy.nodes().filter(node => node.id() == tgtParent);

      if (!srcParent || !tgtParent) return acc;
      if (nodeSrc.parent().first().id() == nodeTgt.id() || nodeSrc.id() == nodeTgt.parent().first().id()) return acc;

      const key = `${srcParent}-${e.data('label')}-${tgtParent}`;
      if (!acc[key]) {
          acc[key] = {
              group: "edges",
              data: {
                  source: srcParent,
                  target: tgtParent,
                  label: getEdgeLabel(e),
                  interaction: getEdgeLabel(e),
                  properties: { ...e.data('properties'), weight: 0, metaSrc: "lifting" }
              }
          };
      }
      acc[key].data.properties.weight += 1;
      return acc;
    }, {})

    this.cy.add(Object.values(newEdges));
    this.cy.edges().filter(e => e.source().data('labels').includes("Structure") && e.target().data('labels').includes("Structure") && e.target().parent() !== e.source().parent()).remove();
  }

  private cleanUp(): void {
    this.cy.nodes().filter((node) => 
      !(getNodeLabels(node).some(label => !Object.values(detailedNodesLabel).includes(label)))
    ).remove();

    const nodeIds = new Set<string>();
    this.cy.nodes().forEach(node => {nodeIds.add(node.id())});
    this.cy.edges().filter(edge => {
      const source = edge.data('source');
      const target = edge.data('target');
      return !(nodeIds.has(source) && nodeIds.has(target));
    }).remove();
  }

}