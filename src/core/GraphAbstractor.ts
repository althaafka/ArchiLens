export default class GraphAbstractor {
  
    public static transform(elements: any): { nodes: any[]; edges: any[] } {
        const nodes = elements.nodes;
        const edges = elements.edges;
        
        const edgesMap = this.groupEdgesByLabel(edges);
        const hasScriptMap = this.buildEdgeMap(edgesMap.get("hasScript"));
        const hasVariableMap = this.buildEdgeMap(edgesMap.get("hasVariable"));
        const typeMap = this.builtEdgeMapReverse(edgesMap.get("type"));
        
        const constructs = this.mergeEdges(hasScriptMap, edgesMap.get("instantiates"), "constructs");
        const returns = this.mergeEdges(hasScriptMap, edgesMap.get("returnType"), "returns");
        const holds = this.mergeEdges(hasVariableMap, edgesMap.get("type"), "holds");
        const calls = this.mergeEdgesType2(hasScriptMap, edgesMap.get("invokes"), "calls");
        const accepts = this.mergeEdgesType2(hasScriptMap, edgesMap.get("hasParameter"), "accepts", typeMap);
  
        const abstractEdges = [
            ...(edgesMap.get("specializes") || []),
            ...(constructs || []),
            ...(edgesMap.get("contains") || []),
            ...(returns || []),
            ...(holds || []),
            ...(calls || []),
            ...(accepts || []),
            ...(edgesMap.get("accesses") || []),
            ...(edgesMap.get("hasScript") || []),
            ...(edgesMap.get("implements") || []),
            ...(edgesMap.get("succeeds") || []),
            ...(edgesMap.get("composes") || []),
            ...(edgesMap.get("measures") || [])
        ];
  
        return { nodes: nodes, edges: abstractEdges };
    }

    private static getEdgesLabel(edge: any): string {
        return edge.data.labels?.join() || edge.data.label
    }
  
    private static groupEdgesByLabel(edges: any): Map<string, Set<any>> {
        const edgesMap = new Map<string, Set<any>>();
        edges.forEach(edge => {
            const label = this.getEdgesLabel(edge);
            if (!edgesMap.has(label)) {
                edgesMap.set(label, new Set());
            }
            edgesMap.get(label)?.add(edge);
        });
        return edgesMap;
  }
  
    private static buildEdgeMap(edges: Set<any> | undefined): Map<string, Set<string>> {
        const map = new Map<string, Set<string>>();
        edges?.forEach(edge => {
            if (!map.has(edge.data.target)) {
                map.set(edge.data.target, new Set());
            }
            map.get(edge.data.target)?.add(edge.data.source);
        });
        return map;
    }
  
    private static builtEdgeMapReverse(edges: Set<any> | undefined): Map<string, Set<string>> {
        const map = new Map<string, Set<string>>();
        edges?.forEach(edge => {
            if (!map.has(edge.data.source)) {
                map.set(edge.data.source, new Set());
            }
            map.get(edge.data.source)?.add(edge.data.target);
        });
        return map;
    }
  
    private static  mergeEdges(
        map: Map<string, Set<string>>, 
        edges: Set<any> | undefined, 
        newLabel: string
    ): any[] {
        const newEdges = [];
        edges?.forEach(edge => {
            const targets = map.get(edge.data.source);
            if (!targets) return;
  
            targets.forEach(source => {
                if (source === edge.data.target) return;
                newEdges.push({
                    data: {
                        id: `${source}-${edge.data.target}-${newLabel}`,
                        source: source,
                        target: edge.data.target,
                        label: newLabel,
                        properties: {
                            weight: edge.data.properties.weight
                        }
                    }
                });
            });
        });
        return newEdges;
    }
  
    private static mergeEdgesType2(
        map1: Map<string, Set<string>>,
        edges: Set<any> | undefined,
        newLabel: string,
        map2?: Map<string, Set<string>>
    ): any[] {
        const newEdges = [];
        edges?.forEach(edge => {
            const sources = map1.get(edge.data.source);
            if (!sources) return;
            
            sources.forEach(source => {
                const targets = map2?.get(edge.data.target) ?? map1.get(edge.data.target);
                targets?.forEach(target => {
                    if (source === target) return;
                    newEdges.push({
                        data: {
                            id: `${source}-${target}-${newLabel}`,
                            source: source,
                            target: target,
                            label: newLabel,
                            properties: {
                              weight: edge.data.properties.weight
                            }
                        }
                    });
                });
            });
        });
        return newEdges;
    }

}