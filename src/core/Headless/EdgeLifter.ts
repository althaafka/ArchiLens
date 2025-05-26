import cytoscape from "cytoscape";
import { getEdgeLabel } from "../../utils/edgeUtils";

export class EdgeLifter {
  private cy: cytoscape.Core;

  constructor(cy: cytoscape.Core) {
    this.cy = cy;
  }

  public lift(): void {
    const edges = this.cy.edges();
    const nodes = this.cy.nodes();

    const newEdges = edges.filter(e =>
      e.source().data('labels')?.includes("Structure") &&
      e.target().data('labels')?.includes("Structure") &&
      e.target().parent() !== e.source().parent()
    ).reduce((acc, e: cytoscape.EdgeSingular) => {
      const srcParent = e.source().parent().first().id();
      const tgtParent = e.target().parent().first().id();
      const nodeSrc = nodes.filter(node => node.id() == srcParent);
      const nodeTgt = nodes.filter(node => node.id() == tgtParent);
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
}