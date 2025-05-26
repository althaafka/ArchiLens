import cytoscape from "cytoscape";
import { edgeHasLabel, getEdgeLabel } from "../../utils/edgeUtils";
import { nodeHasLabels } from "../../utils/nodeUtils";
import { getNodesByLabel } from "../../utils/graphUtils";

export class StructureHandler {
  private cy: cytoscape.Core;

  constructor(cy: cytoscape.Core) {
    this.cy = cy;
  }

  public handleParentChild() {
    console.log("HANDLE PARENT-CHILD")
    const containsMap = new Map<string, string[]>();
  
    this.cy.edges().forEach(edge => {
      if (edgeHasLabel(edge, "contains")) {
        const sourceId = edge.data('source');
        const targetId = edge.data('target');
  
        if (containsMap.has(targetId)) {
          containsMap.get(targetId).push(sourceId);
        } else {
          containsMap.set(targetId, [sourceId]);
        }
      }
    });
  
    this.cy.nodes().forEach(node => {
      const nodeId = node.id();
      const parentCandidates = containsMap.get(nodeId) || [];
  
      let parentNode = null;
  
      for (let candidateId of parentCandidates) {
        let candidate = this.cy.getElementById(candidateId);
  
        while (candidate && nodeHasLabels(candidate, ["Structure"])) {
          const nextParentId = containsMap.get(candidate.id())?.[0];
          if (!nextParentId) {
            candidate = null;
            break;
          }
          candidate = this.cy.getElementById(nextParentId);
        }
  
        if (candidate && !nodeHasLabels(candidate, ["Structure"])) {
          parentNode = candidate;
          break;
        }
      }

      if (parentNode) {
        node.move({ parent: parentNode.id() });
      }
    });
  }

  public hideStructure(): void {
    console.log("HIDE STRUCTURE");
  
    const structureNodes = getNodesByLabel(this.cy.nodes(), "Structure");
  
    const connectedEdges = structureNodes.connectedEdges();
    const containsMap = this.buildContainsMap();
    const redirectedEdges: Record<string, any> = {};
    connectedEdges.forEach(edge => {
        const sourceNode = edge.source();
        const targetNode = edge.target();
        if (!nodeHasLabels(sourceNode, ["Structure"]) && !nodeHasLabels(targetNode, ["Structure"])) {
            return;
        }
        const sourceContainer = this.getContainerFromContainsMap(containsMap, sourceNode.id());
        const targetContainer = this.getContainerFromContainsMap(containsMap, targetNode.id());
        // Jika salah satu tidak ditemukan, skip
        console.log("----------")
        console.log(edge.data())
        console.log(sourceNode.id(), sourceContainer);
        console.log(targetNode.id(), targetContainer)
        if (!sourceContainer || !targetContainer || sourceContainer === targetContainer) return;
        const label = getEdgeLabel(edge)
        const key = `${sourceContainer}-${label}-${targetContainer}`;
        console.log("LABEL", label)
        if (!redirectedEdges[key]) {
            redirectedEdges[key] = {
              group: "edges",
              data: {
                id: key,
                source: sourceContainer,
                target: targetContainer,
                label: label,
                properties: {
                  ...edge.data("properties"),
                  weight: 1,
                }
              }
            };
        } else {
            redirectedEdges[key].data.properties.weight += 1;
        }
    })
    // console.log("EDGES MAP:", edgesMap)
    console.log("CONTAINS MAP:", containsMap)
  
    // this.cy.remove(connectedEdges);
    this.cy.remove(structureNodes);
    this.cy.add(Object.values(redirectedEdges));
    console.log("REDIRECTED EDGE:", redirectedEdges)
  }

  private buildContainsMap(): Map<string, Set<string>> {
    const map = new Map<string, Set<string>>();
    this.cy.edges().forEach(edge => {
      if (edge.data('label') !== 'contains') return;
  
      const source = edge.data('source');
      const target = edge.data('target');
  
      if (!map.has(target)) map.set(target, new Set());
      map.get(target)?.add(source);
    });
    return map;
  }
  
  private getContainerFromContainsMap(containsMap: Map<string, Set<string>>, structureId: string): string | null {
    const candidates = containsMap.get(structureId);
    if (!candidates) return null;
  
    for (const id of candidates) {
      const node = this.cy.getElementById(id);
      if (nodeHasLabels(node, ["Container"]) && !nodeHasLabels(node, ["Structure"])) {
        return id;
      }
    }
    return null;
  }
}