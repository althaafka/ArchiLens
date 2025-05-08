// import { detailedNodesLabel } from "../constants/constants";

export function abstractizeGraph(nodes, edges) {
    
    // const abstractNodes = nodes.filter((node) => 
    //     (node.data.labels?.some(label => !Object.values(detailedNodesLabel).includes(label)) || 
    //     Object.values(detailedNodesLabel).includes(node.data.label))
    // );

    const edgesMap = new Map<string, Set<any>>();
    edges.forEach((edge) => {
        const label = edge.data.labels?.join() || edge.data.label;
        if (!edgesMap.has(label)) {
            edgesMap.set(label, new Set());
        }
        edgesMap.get(label)?.add(edge);
    });

    const hasScriptMap = new Map<string, Set<string>>()
    edgesMap.get("hasScript")?.forEach((edge) => {
        if (!hasScriptMap.has(edge.data.target)) {
            hasScriptMap.set(edge.data.target, new Set())
        }
        hasScriptMap.get(edge.data.target)?.add(edge.data.source)
    })

    const hasVariableMap = new Map<string, Set<string>>()
    edgesMap.get("hasVariable")?.forEach((edge) => {
        if (!hasVariableMap.has(edge.data.target)) {
            hasVariableMap.set(edge.data.target, new Set())
        }
        hasVariableMap.get(edge.data.target)?.add(edge.data.source)
    })

    const typeMap = new Map<string, Set<string>>(); // <source, targets[]>
    edgesMap.get("type")?.forEach((edge) => {
        if (!typeMap.has(edge.data.source)) {
            typeMap.set(edge.data.source, new Set());
          }
          typeMap.get(edge.data.source)?.add(edge.data.target);
    })

    function mergeEdges(edgesMap1, edges2, newLabel) {
        let newEdges = []
        edges2?.forEach((edge) => {
            let newTarget = edge.data.target
            const newSources = edgesMap1.get(edge.data.source)
    
            if (!newSources) return;

            newSources.forEach((newSource) => {
                if (newSource == newTarget) return
                newEdges.push({
                    data: {
                    id: `${newSource}-${newTarget}-${newLabel}`,
                    source: newSource,
                    target: newTarget,
                    labels: [`${newLabel}`],
                    },
                });
            })

        })

        return newEdges
    }

    function mergeEdgesType2(edgesMap1, edges2, newLabel, edgesMap2= undefined) {
        let newEdges = []
        edges2?.forEach((edge) => {
            const newSources = edgesMap1.get(edge.data.source)
    
            if (!newSources) return;

            newSources.forEach((newSource) => {
                const newTargets = edgesMap2?.get(edge.data.target) ?? edgesMap1.get(edge.data.target);
                newTargets?.forEach((newTarget) => {
                  if (newSource == newTarget) return;
                  newEdges.push({
                    data: {
                      id: `${newSource}-${newTarget}-${newLabel}`,
                      source: newSource,
                      target: newTarget,
                      labels: newLabel,
                    },
                  });
                })
            })
        })

        return newEdges
    }


    // Handle detailed graph's relationship
    const constructs = mergeEdges(hasScriptMap, edgesMap.get("instantiates"), "constructs")
    const returns = mergeEdges(hasScriptMap, edgesMap.get("returnType"), "returns")
    const holds = mergeEdges(hasVariableMap, edgesMap.get("type"), "holds")
    const calls = mergeEdgesType2(hasScriptMap, edgesMap.get("invokes"), "calls")
    const accepts = mergeEdgesType2(hasScriptMap, edgesMap.get("hasParameter"), "accepts", typeMap)


    let abstractEdges = [
        ...(edgesMap.get("specializes") || []),
        ...(constructs || []),
        ...(edgesMap.get("contains") || []),
        ...(returns || []),
        ...(holds || []),
        ...(calls || []),
        ...(accepts || []),
        ...(edgesMap.get("hasScript") || []),
        ...(edgesMap.get("implements") || []),
        ...(edgesMap.get("succeeds") || []),
        ...(edgesMap.get("composes") || []),
        ...(edgesMap.get("measures") || [])
    ]

    return { nodes: nodes, edges: abstractEdges }
}
