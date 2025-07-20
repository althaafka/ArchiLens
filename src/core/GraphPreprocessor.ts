import { getNodeLabels, nodeHasLabels, edgeHasLabel } from "../utils/rawGraphUtils";
import { detailedNodesLabel } from "../constants/constants";
import GraphAbstractor from "../core/GraphAbstractor"

export default class GraphPreProcessor {

  // Preprocess the graph
  public static initialize(elements: any): any {
    let processedElements = elements;

    // Abstractize if the graph is detailed
    if (GraphPreProcessor.isDetailedGraph(processedElements)) {
      processedElements = GraphAbstractor.transform(processedElements);
    }

    // Merge chained container, hide primitives, change node name
    processedElements = GraphPreProcessor.mergeChainedPackages(processedElements);
    processedElements = GraphPreProcessor.hidePrimitivesAndUpdateLabels(processedElements);
    processedElements = GraphPreProcessor.mergeDuplicateEdgesByWeight(processedElements);

    const edges = processedElements.edges.filter(e => 
      e.data.label === "calls" &&
      (e.data.source === "nl.tudelft.jpacman.Launcher" || e.data.target === "nl.tudelft.jpacman.Launcher")
    );
    console.log("launcher edges 2", edges);

    return processedElements;
  }

  // Determine whether the graph is detailed
  private static isDetailedGraph(elements: any): boolean {
    const nodes = elements.nodes
    const isDetailed = nodes.some((node) => {
      const labels = getNodeLabels(node);
      return labels.some((label) => (Object.values(detailedNodesLabel) as string[]).includes(label))
    })
    return isDetailed;
  }

  // Hide nodes with Primitive type and update node labels for display
  private static hidePrimitivesAndUpdateLabels(elements: any): any {
    elements.nodes.forEach((node) => {
      if (nodeHasLabels(node, ['Primitive']) || node.data.id.includes("java.lang.String")) {
        node.data.hidden = true;
      }

      if (!node.data.label) {
        const { name, shortname, simpleName } = node.data.properties || {};
        node.data.label = name || shortname || simpleName || node.data.id;
      }
    })
    return elements
  }

  // Merge container
  private static mergeChainedPackages(elements: any): any {
    const idToNode = new Map(elements.nodes.map(n => [n.data.id, n]));
    const containsMap = new Map<string, string[]>();
      
    elements.edges.forEach(edge => {
      if (edgeHasLabel(edge, 'contains')) {
        const children = containsMap.get(edge.data.source) || [];
        children.push(edge.data.target);
        containsMap.set(edge.data.source, children);
      }
    });
    
    const toRemoveNodeIds = new Set<string>();
    const toRemoveEdgeIds = new Set<string>();
    
    elements.nodes.forEach(node => {
      if (!nodeHasLabels(node, ['Container'])) return;
    
      let chain = [node];
      let current = node;
    
      while (true) {
        const children = containsMap.get(current.data.id);
        if (!children || children.length !== 1) break;
    
        const child = idToNode.get(children[0]);
        if (!child || !nodeHasLabels(child, ['Container'])) break;
    
        chain.push(child);
        current = child;
      }

      if (chain.length > 1) {
        const last = chain[chain.length - 1];
    
        for (let i = 0; i < chain.length - 1; i++) {
          const parent = chain[i];
          toRemoveNodeIds.add(parent.data.id);
    
          const child = chain[i + 1];
          const edge = elements.edges.find(e =>
            e.data.source === parent.data.id &&
            e.data.target === child.data.id &&
            edgeHasLabel(e, 'contains')
          );
          
          if (edge) toRemoveEdgeIds.add(edge.data.id);
        }
    
        if (last && !last.data.label) {
          last.data.label = last.data.properties?.qualifiedName || last.data.id;
        }
      }
    });
      
    elements.nodes = elements.nodes.filter(n => !toRemoveNodeIds.has(n.data.id));
    elements.edges = elements.edges.filter(e => {
      const src = e.data.source;
      const tgt = e.data.target;
      return !toRemoveEdgeIds.has(e.data.id) && !toRemoveNodeIds.has(src) && !toRemoveNodeIds.has(tgt);
    });

    // const edges = elements.edges.filter(e => 
    //   e.data.label === "calls" &&
    //   (e.data.source === "nl.tudelft.jpacman.Launcher" || e.data.target === "nl.tudelft.jpacman.Launcher")
    // );
    // console.log("launcher edges", edges);

    
    return elements
  }   

  private static mergeDuplicateEdgesByWeight(elements: any): any {
  const edgeMap = new Map<string, any>();

  for (const edge of elements.edges) {
    const { source, target, label } = edge.data;
    const key = `${source}||${target}||${label}`;

    
    if (!edgeMap.has(key)) {
      edge.data.properties.weight = edge.data.properties.weight || 1;
      edgeMap.set(key, edge);
    } else {
      // Tambahkan weight ke edge yang sudah ada
      const existing = edgeMap.get(key);
      existing.data.properties.weight += edge.data.properties.weight || 1;
      if (edge.data.target == "nl.tudelft.jpacman.Launcher" || edge.data.source == "nl.tudelft.jpacman.Launcher") {
        console.log("nambah")
      }

    }
  }

  // Replace edge list dengan yang sudah digabung
  elements.edges = Array.from(edgeMap.values());

  return elements;
}

}