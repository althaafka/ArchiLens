import cytoscape from "cytoscape"
import { getNodesByLabel, getEdgesByLabel } from "../utils/graphUtils";
import { generateColorMap } from "../utils/colorUtils";

export default class AnalyticAspect {
  public dimension: any;
  public category: any;
  public metric: any;
  public composedDimension: any;
  public colorMap: any;

  constructor(){}

  collectAnalyticAspect(cy: cytoscape.Core) {
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
}