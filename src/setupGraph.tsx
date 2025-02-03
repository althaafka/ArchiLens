import { Graph } from "./types";

const abstractLabels = ["Operation", "Constructor", "Script", "Variable"]

export function setupGraph(graph: Graph) {
    let { nodes, edges } = graph;

    const isDetailedGraph=  nodes.some((node) => {
        const labels = node.data.labels || [node.data.label]
        return labels.some((label) => abstractLabels.includes(label))
    });

    if (isDetailedGraph) {
        const {nodes: abstractNodes, edges: abstractEdges} = createAbstractGraph(nodes,edges)
        nodes = abstractNodes;
        edges = abstractEdges;
    }

    // Handle Contains relationship
    const containsMap = new Map<string, string>();
    edges = edges.filter((edge) => {
        if (edge.data.labels?.includes("contains") || edge.data.label === "contains") {
            containsMap.set(edge.data.target, edge.data.source);
            return false;
        }
        return true;
    });

    nodes = nodes.map((node) => ({
        ...node,
        data: {
            ...node.data,
            parent: containsMap.get(node.data.id) || node.data.parent, // Add parent if exists
        },
    }));

    // Handle node label and hide primitive node
    nodes.forEach((node) => {
        const nodeLabels = node.data.labels || [node.data.label];
        if (nodeLabels.includes("Primitive") || node.data.id.includes("java.lang.String")) {
            node.data.hidden = true;
        }

        const { name, shortname, simpleName } = node.data.properties || {};
        node.data.label = name || shortname || simpleName;
    });

    return {
        nodes: nodes,
        edges: edges,
    };
}

export function createAbstractGraph(nodes, edges) {
    
    const abstractNodes = nodes.filter((node) => 
        (node.data.labels?.some(label => !abstractLabels.includes(label)) || 
        abstractLabels.includes(node.data.label))
    );

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


    function mergeEdges(edges1Map, edges2, newLabel) {
        let newEdges = []
        edges2.forEach((edge) => {
            const newTarget = edge.data.target
            const newSources = edges1Map.get(edge.data.source)
    
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


    // Handle detailed graph's relationship
    const constructs = mergeEdges(hasScriptMap, edgesMap.get("instantiates"), "constructs")
    const returns = mergeEdges(hasScriptMap, edgesMap.get("returnType"), "returns")
    const holds = mergeEdges(hasVariableMap, edgesMap.get("type"), "holds")

    let abstractEdges = [
		...(edgesMap.get("specializes") || []),
	    ...(constructs || []),
        ...(edgesMap.get("contains") || []),
        ...(returns || []),
        ...(holds || [])
    ]

    return { nodes: abstractNodes, edges: removeInvalidEdges(abstractNodes, abstractEdges) }
}

function removeInvalidEdges(nodes, edges) {
    const nodeIds = new Set(nodes.map((node) => node.data.id));
    return edges.filter(({ data: { source, target } }) => nodeIds.has(source) && nodeIds.has(target));
}
