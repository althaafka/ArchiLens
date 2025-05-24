import cytoscape from "cytoscape";
import { edgeHasLabel } from "./edgeUtils";
import { nodeHasLabels } from "./nodeUtils";

export function getEdgesByLabel(edges: cytoscape.EdgeCollection, label: string): cytoscape.EdgeCollection {
    return edges.filter(edge => edgeHasLabel(edge, label));
}

export function getNodesByLabel(nodes: cytoscape.NodeCollection, label: string): cytoscape.NodeCollection {
    return nodes.filter(node => nodeHasLabels(node, [label]))
}