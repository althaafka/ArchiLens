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

    getMaxCategory(counterObj: Record<string, number>): string | null {
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
      

    getNodeCategory(node, dimension: string, showStructure = true): string{
        if (!node.data().labels.includes("Structure") && showStructure) return null;
        if (!node.data().labels.includes("Structure")) {
            const composed = node.data('properties').composedDimension?.[dimension];
            if (!composed) return null;
            const categoryName = this.getCategoryName(this.getMaxCategory(composed), dimension)
            return categoryName
        }
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

    isComposedDimension(dimId) {
        return this.analysisData.composedDimension.includes(dimId);
    }

}

export class Metric {
    
}