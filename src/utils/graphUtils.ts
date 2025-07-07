import cytoscape from "cytoscape";
import { edgeHasLabel } from "./edgeUtils";
import { nodeHasLabels } from "./nodeUtils";

export function getEdgesByLabel(edges: cytoscape.EdgeCollection, label: string): cytoscape.EdgeCollection {
    return edges.filter(edge => edgeHasLabel(edge, label));
}

export function getNodesByLabel(nodes: cytoscape.NodeCollection, label: string): cytoscape.NodeCollection {
    return nodes.filter(node => nodeHasLabels(node, [label]))
}

export function getRoots(cy: cytoscape.Core): cytoscape.NodeSingular {
    const roots = cy.nodes().orphans().filter(root =>
      (nodeHasLabels(root, ['Container']) || nodeHasLabels(root, ['Structure'])) && root.id()!="java.lang.String"
    )
    return roots
}

export function isSemanticGridEl(el) {
    return el.data("type") == "semantic-grid-label" || el.data("type") == "semantic-grid-line"
}