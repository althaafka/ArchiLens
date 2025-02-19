import { abstractizeGraph } from "./abstractizeGraph";
import { Graph } from "../types";
import { detailedNodesLabel } from "./constants";


export function setupGraph(graph: Graph) {
    let { nodes, edges } = graph;

    const isDetailedGraph=  nodes.some((node) => {
        const labels = node.data.labels || [node.data.label]
        return labels.some((label) => Object.values(detailedNodesLabel).includes(label))
    });

    if (isDetailedGraph) {
        const {nodes: abstractNodes, edges: abstractEdges} = abstractizeGraph(nodes,edges)
        nodes = abstractNodes;
        edges = abstractEdges;
    }

    // Handle Contains and Features
    const containsMap = new Map<string, string>();
    edges = edges.filter((edge) => {
        if (edge.data.labels?.includes("contains") || edge.data.label === "contains") {
            containsMap.set(edge.data.target, edge.data.source);
            return false;
        }
        return true;
    });

    const { features, filteredNodes } = nodes.reduce(
        (acc, node) => {
            const nodeLabels = node.data.labels || [node.data.label];
            if (nodeLabels.includes("Feature")) {
                acc.features.push(node);
            } else {
                acc.filteredNodes.push({
                    ...node,
                    data: {
                        ...node.data,
                        parent: containsMap.get(node.data.id) || node.data.parent,
                    },
                });
            }
            return acc;
        },
        { features: [] as typeof nodes, filteredNodes: [] as typeof nodes }
    );


    // Handle node label and hide primitive node
    filteredNodes.forEach((node) => {
        const nodeLabels = node.data.labels || [node.data.label];
        if (nodeLabels.includes("Primitive") || node.data.id.includes("java.lang.String")) {
            node.data.hidden = true;
        }

        const { name, shortname, simpleName } = node.data.properties || {};
        node.data.label = name || shortname || simpleName;
    });

    edges.forEach((edge) => {
        edge.data.label = edge.data.label || (Array.isArray(edge.data.labels) ? edge.data.labels.join() : edge.data.labels);
    });

    return {
        graph: {nodes: filteredNodes, edges: edges},
        feature: features
    };
}