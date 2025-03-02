import { abstractizeGraph } from "./abstractizeGraph";
import { Graph } from "../types";
import { detailedNodesLabel } from "../constants/constants";

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

    // Handle Contains
    const containsMap = new Map<string, string>();
    edges = edges.filter((edge) => {
        if (edge.data.labels?.includes("contains") || edge.data.label === "contains") {
            containsMap.set(edge.data.target, edge.data.source);
            return false;
        }
        return true;
    });

    // Handle Features & Parent Relationship 
    const featuresMap = new Map<string, { members: string[] }>();
    const { features, filteredNodes } = nodes.reduce(
        (acc, node) => {
            const nodeLabels = node.data.labels || [node.data.label];
            if (nodeLabels.includes("Feature")) {
                featuresMap.set(node.data.id, { members: [] });

                node.data.properties = node.data.properties || {};
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

    edges = edges.filter((edge) => {
        if (edge.data.label === "inFeature" && featuresMap.has(edge.data.target)) {
            featuresMap.get(edge.data.target)!.members.push(edge.data.source);
            return false;
        }
        return true;
    });

    features.forEach((feature) => {
        feature.data.properties.members = featuresMap.get(feature.data.id)?.members || [];
    });

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

    console.log(features)

    return {
        graph: { nodes: filteredNodes, edges },
        feature: features, // Kembalikan features langsung
        layer: [],
    };
}
