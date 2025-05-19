import cytoscape from "cytoscape";

export default class LevelManager {
    private cy: cytoscape.Core;

    constructor(cy: cytoscape.Core) {
        this.cy = cy;
    }

    public flattenParentChild(): void {
        console.log("flatten")
        this.cy.nodes().forEach((node) => {
            const isPackage = this.nodeHasLabel(node, 'Container');
            if (isPackage) {
                this.removeChildRelation(node);
                node.removeClass('package')
            }
        })
    }

    public buildParentChild(): void {
        const containsMap = new Map<string, string>();
      
        // Bangun peta: target → parent (source)
        this.cy.edges().forEach((edge) => {
          if (this.edgeHasLabel(edge, "contains")) {
            const sourceId = edge.data('source');
            const targetId = edge.data('target');
      
            // Abaikan jika loop
            if (sourceId !== targetId) {
              containsMap.set(targetId, sourceId);
            }
          }
        });
      
        // Tetapkan parent ke node jika memenuhi syarat
        this.cy.nodes().forEach((node) => {
            const isPackage = this.nodeHasLabel(node, 'Container') && !this.nodeHasLabel(node, 'Structure');
            if (isPackage) {
                node.addClass('package')
            }
          const nodeId = node.id();
          const candidateParentId = containsMap.get(nodeId);
          if (!candidateParentId) return;
      
          const candidateParent = this.cy.getElementById(candidateParentId);
      
          // Lewati jika parent adalah Structure
          if (this.nodeHasLabel(candidateParent, 'Structure')) return;
      
          // Tetapkan parent
          node.move({ parent: candidateParentId });
        });
      }
      

    public showContainerLevel(): void {
        console.log("container level")
        this.flattenParentChild();
        const structure = this.cy.nodes().filter(node => this.nodeHasLabel(node, 'Structure') && node.id() != "java.lang.String")
        structure.map(node => node.style('display', "none"))
    }

    public showStructureLevel(): void {
        console.log("structure level")
        const structure = this.cy.nodes().filter(node => this.nodeHasLabel(node, 'Structure') && node.id() != "java.lang.String")
        structure.map(node => node.style('display', "element"))
        this.buildParentChild()
    }

    private nodeHasLabel(node: cytoscape.NodeSingular, label: string): boolean {
        const labels = node.data().labels || [];
        return labels.includes(label)
    }

    private edgeHasLabel(edge: cytoscape.EdgeSingular, label: string): boolean {
        const labels = edge.data('label');
        return labels == label
    }

    private removeChildRelation(node: cytoscape.NodeSingular) {
        node.children().move({parent: null})
    }
    
}