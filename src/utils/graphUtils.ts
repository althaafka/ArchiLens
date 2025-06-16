import cytoscape from "cytoscape";
import { edgeHasLabel } from "./edgeUtils";
import { nodeHasLabels } from "./nodeUtils";

export function getEdgesByLabel(edges: cytoscape.EdgeCollection, label: string): cytoscape.EdgeCollection {
    return edges.filter(edge => edgeHasLabel(edge, label));
}

export function getNodesByLabel(nodes: cytoscape.NodeCollection, label: string): cytoscape.NodeCollection {
    return nodes.filter(node => nodeHasLabels(node, [label]))
}

export function getRoot(cy: cytoscape.Core): cytoscape.NodeSingular {
    const root = cy.nodes().orphans().filter(root =>
      (nodeHasLabels(root, ['Container']) || nodeHasLabels(root, ['Structure'])) && root.id()!="java.lang.String"
    )[0]
    return root
}

export function isSemanticGridEl(el) {
    return el.data("type") == "semantic-grid-label" || el.data("type") == "semantic-grid-line"
}