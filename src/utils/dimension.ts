import { getGraph } from './graphManagement';

export default class Dimension {
    private dimension;

    constructor(dimension) {
        this.dimension = dimension
    }

    getDimensionById(dimId: string) {
        return this.dimension.dimension.find((dim) => dim.id === dimId) || null;
      }

    getDimensionName(dimension) {
        return dimension.split("Dimension:")[1];
    }

    getCategoryName(category, dimension) {
        return category.split(`${this.getDimensionName(dimension)}:`)[1]
    }

    getCategoriesOrder(dimension: string): string[] {
        if (dimension == 'Dimension:Container') return null;
        const rawCat = this.getDimensionById(dimension).categories
        const catOrder = rawCat.map((cat) => {
            return this.dimension.category.find((c) => c.id === cat)?.properties?.simpleName || "-"
        })
        return catOrder;
    }

    getNodeCategory(node, dimension: string): string{
        if (!node.data().labels.includes("Structure")) return null;
        if (dimension == 'Dimension:Container') {
            const graph = getGraph();
            const container = graph.getNodeContainer(node);
            return container? container.data().properties.simpleName || container.id() : null;
        }

        const composed = node?.data().properties?.dimension?.[dimension];
        return composed ? this.getCategoryName(composed[0], dimension) : "-";
    }

}