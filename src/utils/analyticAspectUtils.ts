import cytoscape from 'cytoscape';

export function getNodeCategoryId(node: cytoscape.NodeSingular, dimId: string): string[] {
  return node.data('properties')?.dimension?.[dimId]
}

export function getNodeComposedCategory(node: cytoscape.NodeSingular, dimId: string): any {
  return node.data('properties')?.composedDimension?.[dimId]
}

export function getDimensionName(dimension) {
  return dimension.split("Dimension:")[1];
}

export function getCategoryName(category, dimension) {
  if (category == '-') return '-';
  return category.split(`${getDimensionName(dimension)}:`)[1]
}

export function getMaxCategory(counterObj: Record<string, number>): string | null {
  if (!counterObj) return null
  let maxKey: string | null = null;
  let maxVal = -Infinity;

  for (const [key, value] of Object.entries(counterObj)) {
    if (value > maxVal) {
      maxVal = value;
      maxKey = key;
    }
  }

  return maxKey;
}