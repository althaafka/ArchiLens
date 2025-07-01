import cytoscape from "cytoscape"
import { getNodesByLabel, getEdgesByLabel } from "../utils/graphUtils";
import { generateColorMap } from "../utils/colorUtils";
import { getCategoryName, getMaxCategory } from "../utils/analyticAspectUtils";
import { getNodeParent, getNodeName } from "../utils/nodeUtils";

export default class AnalyticAspect {
  public dimension: any;
  public category: any;
  public metric: any;
  public composedDimension: any;
  public colorMap: any;
  public depth: any;

  constructor(){}

  collectAnalyticAspect(cy: cytoscape.Core, depthData) {
    const nodes = cy.nodes()
    const edges = cy.edges()
    const dimension = getNodesByLabel(nodes, 'Dimension')
    const category = getNodesByLabel(nodes, 'Category')
    const metric = getNodesByLabel(nodes, 'Metric')

    this.dimension =  dimension.map(node => node.data()), 
    this.category = category.map(node => node.data()),
    this.metric = metric.map(node => node.data()),
    this.composedDimension = Array.from(
        new Set(
            getEdgesByLabel(edges, 'composes')
                .filter(cEdge => {
                    const categoryId = cEdge.data('target');
                    const implementsEdges = edges.filter(edge => edge.data('label') === "implements" && edge.data('target') === categoryId);
                    return implementsEdges.some(iEdge => {
                        const sourceNode = cy.getElementById(iEdge.data('source'));
                        return sourceNode.data('labels').includes("Scripts") || sourceNode.data('labels').includes("Operation");
                    });
                })
            .map(cEdge => cEdge.data('source'))
        )
    )
    this.depth = depthData;

    cy.remove(dimension);
    cy.remove(category);
    cy.remove(metric);
    cy.edges().filter(edge =>
        ["composes", "implements", "succeeds", "measures"].includes(edge.data('label'))
    ).remove();

    this.generateColorMapDimensions();
  }

  public getAnalyticAspectTemp(){
    return {
      "dimension": this.dimension,
      "category": this.category,
      "metric": this.metric,
      "composedDimension": this.composedDimension,
      "colorMap": this.colorMap
    }
  }

  private generateColorMapDimensions(): void {
    this.colorMap = {};
    this.dimension.forEach((dim: any) => {
      console.log("dim", dim)
      this.colorMap[dim.id] = generateColorMap(dim.categories);
    });
  }

  public isComposedDimension(dimId) {
    return this.composedDimension.includes(dimId);
  }

  public isMetric(metricId) {
    return this.metric.find((m) => m.id == metricId)? true: false
  }

  public getNodeCategory(node, dimension: string, showStructure = true): string{
      if (!node.data().labels.includes("Structure") && showStructure) {
        if (node.data().labels.includes("Container")) {
          const hasVisibleChild = node.children().some(child => child.style('display') !== 'none');
          if (!hasVisibleChild) {
            const composed = node.data('properties').composedDimension?.[dimension];
            if (!composed) return null;
            const categoryName = getCategoryName(getMaxCategory(composed), dimension)
            return categoryName
          }
        }
        return null;
      }
      if (!node.data().labels.includes("Structure")) {
          const composed = node.data('properties').composedDimension?.[dimension];
          if (!composed) return null;
          const categoryName = getCategoryName(getMaxCategory(composed), dimension)
          return categoryName
      }
      if (dimension == 'Dimension:Container') {
          const container = getNodeParent(node);
          return container? container.data().properties.simpleName || container.id() : null;
      }
      if (this.isMetric(dimension)) {
          return node?.data().properties?.metric?.[dimension]
      }
      const simpleDim = node?.data().properties?.dimension?.[dimension];
      if (!simpleDim || simpleDim.length == 0) {
        const composed = node.data('properties').composedDimension?.[dimension];
        if (!composed) return "-"
        const categoryName = getCategoryName(getMaxCategory(composed), dimension)
        return categoryName
      }
      return getCategoryName(simpleDim[0], dimension) || "-";
  }

  private getDimensionById(dimId: string) {
    return this.dimension.find((dim) => dim.id === dimId) || null;
  }

  public getContainerOrder(): string[] {
    return this.depth.containerOrder;
  }

  public getCategoriesOrder(dimension: string): string[] {
    if (dimension == 'Dimension:Container') return null;
    const rawCat = this.getDimensionById(dimension).categories
    const catOrder = rawCat.map((cat) => {
        return this.category.find((c) => c.id === cat)?.properties?.simpleName || "-"
    })
    return catOrder;
  }
}