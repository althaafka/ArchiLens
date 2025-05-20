import cytoscape from 'cytoscape';

class Graph {
  private cy: cytoscape.Core;
  private node: Node;
  private edge: Edge;

  constructor(cyInstance: cytoscape.Core) {
    this.cy = cyInstance;
    this.node = new Node()
    this.edge = new Edge()
  }

  // ----------GENERAL-------------
  getElementById(id: string) {
    return this.cy.getElementById(id);
  }

  // -----------NODES--------------

  // Get all nodes with optional filter condition
  getAllNodes(condition?: (node: cytoscape.NodeSingular) => boolean): cytoscape.NodeCollection {
    const allNodes = this.cy.nodes();

    if (typeof condition === 'function') {
      return allNodes.filter(condition);
    }

    return allNodes;
  }

  getPureContainers() {
    return this.getAllNodes(node => this.node.isPureContainer(node))
  }

  getNodeContainer(node): cytoscape.NodeSingular {
    return this.node.getContainer(node)[0]
  }

  //------------EDGES--------------
  getContainsMap(): Map<string, Set<string>> {
    const map = new Map<string, Set<string>>();
    this.cy.edges().forEach((edge) => {
      if (!this.edge.hasLabel(edge, "contains")) return;

      if (!map.has(edge.data().source)){
        map.set(edge.data().source, new Set())
      }
      map.get(edge.data().source)?.add(edge.data().target)
    })
    return map
  }


  //-----------ETC-----------------

  hidePackage() {
    this.cy.nodes().forEach((node) => {
      const isPackage = this.node.isPureContainer(node);
      if (isPackage) {
        this.node.removeChildRelation(node)
        node.style('display', 'none');
      }
    })
  }

  unhidePackage() {
    const containsMap = this.getContainsMap();
    this.cy.nodes().forEach((node) => {
      if (this.node.isPureContainer(node)) {
        node.style('display', 'element');
  
        const children = containsMap.get(node.id());
  
        if (children) {
          children?.forEach((childId) => {
            const childNode = this.getElementById(childId);
            if (childNode && childNode.length > 0) {
              this.node.addChildRelation(node, childNode);
            }
          });
        }
      }
    })
  }

}

class Node {
  
  hasLabel(node: cytoscape.NodeSingular, label: string): boolean {
    const labels = node.data().labels || [];
    return labels.includes(label)
  }

  getContainer(node: cytoscape.NodeSingular): cytoscape.NodeCollection {
    return node.parent()
  }
  
  isPureContainer(node: cytoscape.NodeSingular): boolean {
    return this.hasLabel(node, "Container") && !this.hasLabel(node, "Structure")
  }

  removeChildRelation(node: cytoscape.NodeSingular) {
    node.children().move({parent: null})
  }

  addChildRelation(parent: cytoscape.NodeSingular, child: cytoscape.NodeSingular) {
    if (!parent || !parent.id || !child || !child.move) {
      // console.warn("Invalid parent or child in addChildRelation", { parent, child });
      return;
    }
  
    if (!parent.length || !child.length) {
      // console.warn("Node not found in cytoscape instance", { parent, child });
      return;
    }
  
    child.move({ parent: parent.id() });
  }
}

class Edge {
  hasLabel(edge: cytoscape.EdgeSingular, label: string): boolean {
    return label ==  edge.data().label
  }
  
}

// Singleton pattern
let graphInstance: Graph | null = null;

export function initGraph(cy: cytoscape.Core): Graph {
  if (!graphInstance) {
    graphInstance = new Graph(cy);
  }
  return graphInstance;
}

export function getGraph(): Graph {
  if (!graphInstance) {
    throw new Error('Graph not initialized');
  }
  return graphInstance;
}

export function resetGraph() {
  graphInstance = null;
}