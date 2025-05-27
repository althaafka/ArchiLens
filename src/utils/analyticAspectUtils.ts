import cytoscape from 'cytoscape';

export function getNodeCategoryId(node: cytoscape.NodeSingular, dimId: string): string[] {
  return node.data('properties')?.dimension?.[dimId]
}

export function getNodeComposedCategory(node: cytoscape.NodeSingular, dimId: string): any {
  return node.data('properties')?.composedDimension?.[dimId]
}