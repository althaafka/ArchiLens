import fs from "fs";

//File paths

const newFile = './integration/result/jpacman-test.json'
const jhotFile = './integration/result/jpacman-dim-test.json';

const graphs = JSON.parse(fs.readFileSync(jhotFile, 'utf-8')).elements;

const nodes = graphs.nodes;
const edges = graphs.edges;

function getMethodCount(node) {
    const hasScriptEdges = edges.filter((edge) => edge.data.label=="hasScript" && edge.data.source == node.data.id)
    let methodCount = hasScriptEdges.length
    return methodCount
}


graphs.nodes.push({
    data: {
        id: 'Metric:MethodCount',
        labels: ["Metric"],
        properties: {
            simpleName: "MethodCount"
        }
    }
})


nodes.forEach((node) => {
    if (!node.data.labels.includes("Structure")) return;
    const count = getMethodCount(node)
    console.log("id:", node.data.id)
    console.log("method count: ", count)
    graphs.edges.push({
        data: {
            id: `${node.data.id}-measures-Metric:MethodCount`,
            label: "measures",
            source: node.data.id,
            target: "Metric:MethodCount",
            properties: {
                weight: 1,
                value: count
            }
        }
    })
})

// Save the modified graph
fs.writeFileSync(newFile, JSON.stringify({elements: graphs}, null, 2));
console.log("Graph with dimensions saved successfully!");