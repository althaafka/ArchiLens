import Abstractor from "./Abstractor";

const detailedNodesLabel = {
    OPERATION: "Operation", 
    CONSTRUCTOR: "Constructor", 
    SCRIPT: "Script",
    VARIABLE: "Variable"
}

export default class GraphSetup {
    private elements: any;
    
    constructor (elements: any) {
        this.elements = elements;
    }

    public initialize(): any {

        if (this.isDetailedGraph()) {
          this.elements = new Abstractor(this.elements).transform();
        }
    
        this.mergeChainedPackages();
        this.handleParentChild();
        this.hidePrimitivesAndUpdateLabels();
    
        return this.elements;
    }

    private isDetailedGraph(): boolean {
        const nodes = this.elements.nodes
        const isDetailed = nodes.some((node) => {
            const labels = this.getNodeLabels(node);
            return labels.some((label) => Object.values(detailedNodesLabel).includes(label))
        })
        return isDetailed;
    }

    private handleParentChild() {
        const containsMap = new Map<string, string[]>();
        this.elements.edges.map((edge) => {
            if (this.edgeHasLabel(edge, "contains")) {
                if (containsMap.get(edge.data.target)) {
                    containsMap.get(edge.data.target).push(edge.data.target)
                } else {
                    containsMap.set(edge.data.target, [edge.data.source]);
                }
            }
        });

        const updatedNodes = this.elements.nodes.map((node) => {
            let parentNode = undefined;
            const parentCandidates = containsMap.get(node.data.id) || [];
            for (const candidateId of parentCandidates) {
                let candidate = this.elements.nodes.find((n) => n.data.id === candidateId);
                
                while (candidate && this.getNodeLabels(candidate).includes('Structure')) {
                    const nextParentId = containsMap.get(candidate.data.id)?.[0];
                    candidate = this.elements.nodes.find((n) => n.data.id === nextParentId);
                }

                if (candidate && !this.getNodeLabels(candidate).includes('Structure')) {
                    parentNode = candidate;
                    break;
                }
            }
            return {
                ...node,
                data: {
                  ...node.data,
                  parent: parentNode?.data?.id || parentCandidates[0] || node.data.parent
                }
            };
        });

        this.elements.nodes = updatedNodes;
    }

    private hidePrimitivesAndUpdateLabels() {
        this.elements.nodes.forEach((node) => {
            if (this.nodeHasLabel(node, 'Primitive') || node.data.id.includes("java.lang.string")) {
                node.data.hidden = true;
            }

            if (!node.data.label) {
                const { name, shortname, simpleName } = node.data.properties || {};
                node.data.label = name || shortname || simpleName || node.data.id;
            }
        })
    }


    private mergeChainedPackages() {
        const idToNode = new Map(this.elements.nodes.map(n => [n.data.id, n]));
        const containsMap = new Map<string, string[]>();
      
        this.elements.edges.forEach(edge => {
          if (this.edgeHasLabel(edge, 'contains')) {
            const children = containsMap.get(edge.data.source) || [];
            children.push(edge.data.target);
            containsMap.set(edge.data.source, children);
          }
        });
      
        const toRemoveNodeIds = new Set<string>();
        const toRemoveEdgeIds = new Set<string>();
      
        this.elements.nodes.forEach(node => {
          if (!this.nodeHasLabel(node, 'Container')) return;
      
          // Mencari chain package
          let chain = [node];
          let current = node;
      
          while (true) {
            const children = containsMap.get(current.data.id);
            if (!children || children.length !== 1) break;
      
            const child = idToNode.get(children[0]);
            if (!child || !this.nodeHasLabel(child, 'Container')) break;
      
            chain.push(child);
            current = child;
          }
      
          // Kalau chain lebih dari 1, maka hapus semua kecuali ujung terakhir
          if (chain.length > 1) {
            const last = chain[chain.length - 1];
      
            for (let i = 0; i < chain.length - 1; i++) {
              const parent = chain[i];
              toRemoveNodeIds.add(parent.data.id);
      
              // Cari edge contains dari parent ke child dan tandai untuk dihapus
              const child = chain[i + 1];
              const edge = this.elements.edges.find(e =>
                e.data.source === parent.data.id &&
                e.data.target === child.data.id &&
                this.edgeHasLabel(e, 'contains')
              );
              if (edge) toRemoveEdgeIds.add(edge.data.id);
            }
      
            // Set label node terakhir jika perlu
            if (last && !last.data.label) {
              last.data.label = last.data.properties?.qualifiedName || last.data.id;
            }
          }
        });
      
        // Filter elemen
        this.elements.nodes = this.elements.nodes.filter(n => !toRemoveNodeIds.has(n.data.id));
        this.elements.edges = this.elements.edges.filter(e => {
            const src = e.data.source;
            const tgt = e.data.target;
            return !toRemoveEdgeIds.has(e.data.id) && !toRemoveNodeIds.has(src) && !toRemoveNodeIds.has(tgt);
          });
          
    }
      
      
    // Khusus NODE & EDGE
    private getNodeLabels(node): string[] {
        return node.data.labels || [node.data.label]
    }

    private edgeHasLabel(edge, label): boolean {
        return (edge.data.labels?.includes(label) || edge.data.label === label)
    }

    private nodeHasLabel(node, label): boolean {
        return this.getNodeLabels(node).includes(label);
    }
}