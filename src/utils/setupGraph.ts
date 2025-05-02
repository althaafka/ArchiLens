import { abstractizeGraph } from "./abstractizeGraph";
import { Graph } from "../types";
import { detailedNodesLabel } from "../constants/constants";
import { handleDimension } from "./handleDimension.js";

export function setupGraph(graph: Graph) {
    let { nodes, edges } = graph;

    const isDetailedGraph = nodes.some((node) => {
        const labels = node.data.labels || [node.data.label]
        return labels.some((label) => Object.values(detailedNodesLabel).includes(label))
    });

    if (isDetailedGraph) {
        const {nodes: abstractNodes, edges: abstractEdges} = abstractizeGraph(nodes,edges)
        nodes = abstractNodes;
        edges = abstractEdges;
    }

    // Handle Contains
    const containsMap = new Map<string, string[]>();
    edges.map((edge) => {
        if ((edge.data.labels?.includes("contains") || edge.data.label === "contains")) {
            if (containsMap.get(edge.data.target)) {
                // console.log("edge target:", edge.data.target)
                containsMap.get(edge.data.target).push(edge.data.target)
                // console.log(containsMap.get(edge.data.target))
            } else {
                containsMap.set(edge.data.target, [edge.data.source]);
            }
        }
    });

    // Handle Features & Parent Relationship 
    const featuresMap = new Map<string, { members: string[] }>()
    const { features, filteredNodes, layers } = nodes.reduce(
        (acc, node) => {
            const nodeLabels = node.data.labels || [node.data.label];
            if (nodeLabels.includes("Feature")) {
                featuresMap.set(node.data.id, { members: [] });

                node.data.properties = node.data.properties || {};
                acc.features.push(node);
            } else {
                if (nodeLabels.includes("Grouping")) {
                    acc.layers.push(node);
                }

                let parent 
                if (containsMap.get(node.data.id)?.length > 1) {
                    containsMap.get(node.data.id)?.find((p) => {
                        parent = nodes.find((n) => n.data.id === p);
                        while (parent && parent.data.labels?.includes("Structure")) {
                            const nextParentId = containsMap.get(parent.data.id)?.[0];
                            parent = nodes.find((n) => n.data.id === nextParentId);
                        }
                        return parent && !parent.data.labels?.includes("Structure");
                    });
                
                }
                
                acc.filteredNodes.push({
                    ...node,
                    data: {
                        ...node.data,
                        parent: parent?.data?.id || containsMap.get(node.data.id)?.[0] || node.data.parent,
                    },
                });
            }
            return acc;
        },
        { features: [] as typeof nodes, filteredNodes: [] as typeof nodes, layers: [] as typeof nodes }
    );

    features.push({
        data: {
            id: "-",
            labels: ["Feature"],
            properties: {
                members: []
            }
        }
    });
    featuresMap.set("-", { members: [] });
    layers.push({
        data: {
            id: "-",
            labels: ["Layer"],
        }
    })

    filteredNodes.forEach((node) => {
        const hasFeature = edges.some(edge => 
            edge.data.label === "inFeature" && edge.data.source === node.data.id
        );
        if (!hasFeature && node.data.labels?.includes("Structure") && node.data.id !== "java.lang.String") {
            featuresMap.get("-")!.members.push(node.data.id);
        }
    });

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


    return {
        graph: { nodes: filteredNodes, edges },
        feature: features,
        layer: layers,
    };
}