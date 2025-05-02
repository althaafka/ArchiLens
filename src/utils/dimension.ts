import { getGraph } from './graphManagement';

export default class Dimension {
    private dimension;

    constructor(dimension) {
        this.dimension = dimension
    }

    getDimensionName(dimension) {
        return dimension.split("Dimension:")[1];
    }

    getCategoryName(category, dimension) {
        return category.split(`${this.getDimensionName(dimension)}:`)[1]
    }

    getNodeCategory(node, dimension: string): string{
        if (dimension == 'Dimension:Container') {
            const graph = getGraph();
            const container = graph.getNodeContainer(node);
            return container? container.data().properties.name || container.id() : null;
        }

        const composed = node?.data().properties?.dimension?.[dimension];
        return composed ? this.getCategoryName(composed[0], dimension) : null;
    }

}