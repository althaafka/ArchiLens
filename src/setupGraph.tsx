import { Graph } from "./types";

export function setupGraph(graph: Graph) {
    let { nodes, edges } = graph;

    const hiddenLabels = ["Variable", "Script", "Operation", "Constructor", "Primitive"];

    // Handle Contains relationship
    const containsMap = new Map<string, string>();
    edges = edges.reduce((acc, edge) => {
        if (edge.data.labels?.includes("contains") || edge.data.label == "contains") {
            containsMap.set(edge.data.target, edge.data.source);
        } else {
            acc.push(edge); 
        }
        return acc;
    }, []);

    nodes = nodes.map((node) => {
        const parentId = containsMap.get(node.data.id);
        if (parentId) {
          return {
            ...node,
            data: {
              ...node.data,
              parent: parentId,
            },
          };
        }
        return node;
    });

    // Handle node label
    nodes.forEach((node) => {
        const nodeLabels = node.data.labels || [];
        if (nodeLabels.some((label) => hiddenLabels.includes(label)) || node.data.id.includes("java.lang.String")) {
            node.data.hidden = true;
        }

        const { name, shortname, simpleName } = node.data.properties || {};
        node.data.label = name || shortname || simpleName;
    });

    console.log("node length:",nodes.length)
    console.log("edges length:", edges.length)

    return {
        nodes: nodes,
        edges: edges,
    };
}
