import { getGraph } from './graphManagement';

export default class AnalysisAspect {
    private analysisData;

    constructor(analysisData) {
        this.analysisData = analysisData
    }

    getDimensionById(dimId: string) {
        return this.analysisData.dimension.find((dim) => dim.id === dimId) || null;
      }

    getDimensionName(dimension) {
        return dimension.split("Dimension:")[1];
    }

    getCategoryName(category, dimension) {
        if (category == '-') return '-';
        return category.split(`${this.getDimensionName(dimension)}:`)[1]
    }

    getCategoriesOrder(dimension: string): string[] {
        if (dimension == 'Dimension:Container') return null;
        const rawCat = this.getDimensionById(dimension).categories
        const catOrder = rawCat.map((cat) => {
            return this.analysisData.category.find((c) => c.id === cat)?.properties?.simpleName || "-"
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
        if (this.isMetric(dimension)) {
            return node?.data().properties?.metric?.[dimension]
        }

        const composed = node?.data().properties?.dimension?.[dimension];
        return composed ? this.getCategoryName(composed[0], dimension) : "-";
    }

    isMetric(metricId) {
        return this.analysisData.metric.find((m) => m.id == metricId)? true: false;
    }

}

export class Metric {
    
}