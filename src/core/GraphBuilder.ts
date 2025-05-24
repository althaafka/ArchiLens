import { detailedNodesLabel } from "@/const/const";

export default class GraphBuilder {

  public static buildGraph(elements: any): cytoscape.ElementsDefinition {

    let newElements = elements
    if (this.isDetailedGraph(elements)){
      
    }

    GraphBuilder.mergeChainedPackages(elements);
    GraphBuilder.hidePrimitivesAndUpdateLabels(elements);

    return newElements
  }

  private static isDetailedGraph(elements: any): boolean {
    const isDetailed = elements.nodes.some((node: any) => {
      const labels = this.getNodeLabels(node);
      return labels.some((label) => Object.values(detailedNodesLabel).includes(label))
    })

    return isDetailed;
  }

  
  private static mergeChainedPackages(elements: any): void {
    const nodes = elements.nodes;
    const edges = elements.edges;
    
    const nodeIdMap = new Map(nodes.map((node: any) => [node.data.id, node]));
    
    const containsMap = new Map<string, string[]>();
    edges.forEach((edge: any) => {
      if (this.edgeHasLabel(edge, 'contains')) {
        const children = containsMap.get(edge.data.source) || [];
        children.push(edge.data.target);
        containsMap.set(edge.data.source, children);
      }
    })

    const removedNodeIds = new Set<string>();
    const removedEdgeIds = new Set<string>();

    nodes.forEach((node: any) => {
      if (!this.nodeHasLabels(node, ['Container'])) return;

      let chain = [node];
      let current = node;

      while (true) {
        const children = containsMap.get(current.data.id);
        if (!children || children.length != 1) break;

        const child = nodeIdMap.get(children[0]);
        if (!child || !this.nodeHasLabels(child, ['Container'])) break;

        chain.push(child);
        current = child
      }

      if (chain.length > 1) {
        const last = chain[chain.length-1];

        for (let i=0; i<chain.length-1; i++) {
          const parent = chain[i];
          removedNodeIds.add(parent.data.id);

          const child = chain[i+1];
          const edge = elements.edges.find((e:any) => {
            e.data.source === parent.data.id &&
            e.data.target === child.data.id &&
            this.edgeHasLabel(e, 'contains')
          })

          if (edge) removedEdgeIds.add(edge.data.id)

          if (last && !last.data.label) {
            last.data.label = last.data.properties?.qualifiedName || last.data.id;
          }
        }
      }
    })

    elements.nodes = elements.nodes.filter((node: any) => !removedNodeIds.has(node.data.id));
    elements.edges = elements.edges.filter((edge: any) => {
      const src = edge.data.source;
      const target = edge.data.target;
      //SUS
      return !removedEdgeIds.has(edge.data.id) && !removedNodeIds.has(src) && !removedNodeIds.has(target);
    })
  }

  private static hidePrimitivesAndUpdateLabels(elements: any) {
    elements.nodes.forEach((node: any) => {
      if (this.nodeHasLabels(node, ['Primitive']) || node.data.id.includes("java.lang.String")) {
          node.data.hidden = true;
      }

      if (!node.data.label) {
          const { name, shortname, simpleName } = node.data.properties || {};
          node.data.label = name || shortname || simpleName || node.data.id;
      }
  })
  }
  
  private static getNodeLabels(node: any): string[] {
    return node.data.labels || [node.data.label] || [];
  }

  private static nodeHasLabels(node: any, labels: string[]) {
      const nodeLabels = this.getNodeLabels(node);
      return labels.every(label => nodeLabels.includes(label))
  }

  private static getEdgeLabel(edge: any): string {
    return edge.data.label;
  }

  private static edgeHasLabel(edge:any, label: string): boolean {
    return this.getEdgeLabel(edge) === label;
  }
}