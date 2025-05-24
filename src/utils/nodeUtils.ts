import cytoscape from "cytoscape";

export function getNodeLabels(node: cytoscape.NodeSingular): string[] {
  return node?.data('labels') || [node?.data('label')] || [];
}

export function nodeHasLabels(node: cytoscape.NodeSingular, labels: string[]): boolean {
  const nodeLabels = getNodeLabels(node);
  return labels.every(label => nodeLabels.includes(label))
}