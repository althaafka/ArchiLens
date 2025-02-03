import { Graph } from "./types";

export function setupGraph(graph: Graph) {
  const { nodes, edges } = graph;

  const hiddenLabels = ["Variable", "Script", "Operation", "Constructor", "Primitive"];

  nodes.forEach((node) => {
    const nodeLabels = node.data.labels || [];
    if (nodeLabels.some((label) => hiddenLabels.includes(label)) || node.data.id.includes("java.lang.String")) {
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
