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

            const { name, shortname, simpleName } = node.data.properties || {};
            node.data.label = name || shortname || simpleName;
        })
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