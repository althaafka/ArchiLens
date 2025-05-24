import cytoscape from "cytoscape";

export function getEdgeLabel(edge: cytoscape.EdgeSingular): string {
  return edge?.data('label') || edge?.data('labels')[0] || ""
}

export function edgeHasLabel(edge: cytoscape.EdgeSingular, label: string): boolean {
  return getEdgeLabel(edge) === label;
}