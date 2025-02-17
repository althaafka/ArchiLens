import { abstractizeGraph } from "./abstractizeGraph";
import { Graph } from "../types";
import { nodesLabel } from "./constants";


export function setupGraph(graph: Graph) {
    let { nodes, edges } = graph;

    const isDetailedGraph=  nodes.some((node) => {
        const labels = node.data.labels || [node.data.label]
        return labels.some((label) => Object.values(nodesLabel).includes(label))
    });

    if (isDetailedGraph) {
        const {nodes: abstractNodes, edges: abstractEdges} = abstractizeGraph(nodes,edges)
        nodes = abstractNodes;
        edges = abstractEdges;
    }

    // Handle Contains relationship
    const containsMap = new Map<string, string>();
    edges = edges.filter((edge) => {
        if (edge.data.labels?.includes("contains") || edge.data.label === "contains") {
            containsMap.set(edge.data.target, edge.data.source);
            return false;
        }
        return true;
    });

    nodes = nodes.map((node) => ({
        ...node,
        data: {
            ...node.data,
            parent: containsMap.get(node.data.id) || node.data.parent, // Add parent if exists
        },
    }));

    // Handle node label and hide primitive node
    nodes.forEach((node) => {
        const nodeLabels = node.data.labels || [node.data.label];
        if (nodeLabels.includes("Primitive") || node.data.id.includes("java.lang.String")) {
            node.data.hidden = true;
        }

        const { name, shortname, simpleName } = node.data.properties || {};
        node.data.label = name || shortname || simpleName;
    });

    return {
        nodes: nodes,
        edges: edges,
    };
}