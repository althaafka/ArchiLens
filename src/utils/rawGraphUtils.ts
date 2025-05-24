export function getNodeLabels(node: any): string[] {
  return node.data.labels || [node.data.label] || [];
}

export function nodeHasLabels(node: any, labels: string[]): boolean {
  const nodeLabels = getNodeLabels(node);
  return labels.every(label => nodeLabels.includes(label))
}

export function getEdgeLabel(edge: any): string {
  return edge.data.label || edge.data.labels[0] || ""
}

export function edgeHasLabel(edge: any, label: string): boolean {
  return getEdgeLabel(edge) === label;
}