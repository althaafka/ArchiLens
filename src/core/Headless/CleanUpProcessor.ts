import cytoscape from "cytoscape";
import { detailedNodesLabel } from "../../constants/constants";

export class CleanUpProcessor {
  private cy: cytoscape.Core;

  constructor(cy: cytoscape.Core) {
    this.cy = cy;
  }

  public clean(): void {
    const edges = this.cy.edges();
    const nodes = this.cy.nodes();
    nodes.filter((node) => 
        !(node.data().labels?.some(label => !Object.values(detailedNodesLabel).includes(label))
    )).remove();

    const nodeIds = new Set();
    nodes.forEach(node => { nodeIds.add(node.data('id')); });
    edges.filter(edge => {
        const source = edge.data('source');
        const target = edge.data('target');
        return !(nodeIds.has(source) && nodeIds.has(target));
    }).remove();
  }
}
