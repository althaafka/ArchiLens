import cytoscape from "cytoscape";
import { isPureContainer, removeChildRelation, addChildRelation } from "../utils/nodeUtils";
import { edgeHasLabel } from "../utils/edgeUtils";


export default class GraphManager {
  private static instance: GraphManager;

  private analyticAspect: any = null;

  private constructor() {}

  public static getInstance(): GraphManager {
    if (!GraphManager.instance) {
      GraphManager.instance = new GraphManager();
    }
    return GraphManager.instance;
  }

  public setAnalyticAspect(analyticAspect: any): void {
    this.analyticAspect = analyticAspect;
  }

  public getAnalyticAspect(): any {
    return this.analyticAspect;
  }

  public reset(): void {
    this.analyticAspect = null;
  }

  public hidePackage(cy: cytoscape.Core) {
    cy.nodes().forEach((node) => {
      const isPackage = isPureContainer(node);
      if (isPackage) {
        removeChildRelation(node)
        node.style('display', 'none');
      }
    })
  }

  public unhidePackage(cy: cytoscape.Core) {
    const containsMap = new Map<string, Set<string>>();
    cy.edges().forEach((edge) => {
      if (!edgeHasLabel(edge, "contains")) return;

      if (!containsMap.has(edge.data().source)){
        containsMap.set(edge.data().source, new Set())
      }
      containsMap.get(edge.data().source)?.add(edge.data().target)
    })

    cy.nodes().forEach((node) => {
      if (isPureContainer(node)) {
        node.style('display', 'element');
  
        const children = containsMap.get(node.id());
  
        if (children) {
          children?.forEach((childId) => {
            const childNode = cy.getElementById(childId);
            if (childNode && childNode.length > 0) {
              addChildRelation(node, childNode);
            }
          });
        }
      }
    })
  }
}