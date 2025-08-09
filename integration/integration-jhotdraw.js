import fs from "fs";


// Dimention: stereotypes, role stereotypes, layer, dependencyProfile

// Load file JSON
const graphs = JSON.parse(fs.readFileSync("./integration/data/k9mail.json", "utf-8")).elements;

// Clean implements and Grouping
graphs.edges = graphs.edges.filter(edge => edge.data.label != "implements");
graphs.nodes = graphs.nodes.filter(node => !node.data.labels.includes("Grouping"))

//stereotype, layer, visibility
let stereotypesOrder = [
]
let layerOrder = [
]
let visibilityOrder = [

]
graphs.nodes.forEach(node => {
    if (node.data.properties.stereotype && !stereotypesOrder.includes(node.data.properties.stereotype)){
        stereotypesOrder.push(node.data.properties.stereotype)
    }
    if (node.data.properties.layer && !layerOrder.includes(node.data.properties.layer) && typeof node.data.properties.layer === "string"){
      layerOrder.push(node.data.properties.layer)
    }
    if (node.data.properties.visibility && !visibilityOrder.includes(node.data.properties.visibility)){
      visibilityOrder.push(node.data.properties.visibility)
    }
})

const stereotypeDimensionId = "Dimension:Stereotypes";
const layerDimensionId = "Dimension:ArchitecturalLayer";
const visibilityDimensionId = "Dimension:Visibility";


// Create Node Dimension
graphs.nodes.push({
    data:{
        id: stereotypeDimensionId,
        labels: ["Dimension"],
        properties: {
            simpleName: "Stereotypes"
        }
    }
})

graphs.nodes.push({
    data:{
        id: visibilityDimensionId,
        labels: ["Dimension"],
        properties: {
            simpleName: "Visibility"
        }
    }
})

graphs.nodes.push({
    data:{
        id: layerDimensionId,
        labels: ["Dimension"],
        properties: {
            simpleName: "ArchitecturalLayer"
        }
    }
})

function createCategory(dimName, catOrder, dimId) {
    catOrder.forEach((cat) => {
        const catId = `${dimName}:${cat}`;
        graphs.nodes.push({data:{
            id: catId,
            labels: ["Category"],
            properties: {
                simpleName: cat
            }
        }})

        graphs.edges.push({data:{
            id: `${dimName}:${cat}-composes`,
            label: "composes",
            source: dimId,
            target: catId,
            properties: {
                weight: 1
            }
        }})
    })
}

createCategory("Stereotypes", stereotypesOrder, stereotypeDimensionId);
createCategory("ArchitecturalLayer", layerOrder, layerDimensionId);
createCategory("Visibility", visibilityOrder, visibilityDimensionId)


// Create edges 'suceeds'
function createSuceedEdges(dimName, catOrder) {
    for (let i=0; i< catOrder.length-1; i++ ) {
        const source =`${dimName}:${catOrder[i]}`;
        const target = `${dimName}:${catOrder[i+1]}`;
        graphs.edges.push({data:{
            id: `${dimName}:${catOrder[i]}-succeeds`,
            label: "succeeds",
            source,
            target,
            properties: {
                weight: 1
            }
        }})
    }
}

createSuceedEdges("Stereotypes", stereotypesOrder);
createSuceedEdges("ArchitecturalLayer", layerOrder);
createSuceedEdges("Visibility", visibilityOrder);

function createImplementEdges(dimName, catOrder, properties) {
    graphs.nodes.forEach((node) => {
        const cat = node.data?.properties[properties];
        if (cat && catOrder.includes(cat)) {
            graphs.edges.push({data:{
                id: `${node.data.id}-implements-${dimName}:${cat}`,
                label: "implements",
                source: node.data.id,
                target: `${dimName}:${cat}`,
                properties: {
                    weight: 1
                }
            }})
            delete node.data.properties[properties];
        }

    })
}

createImplementEdges("Stereotypes", stereotypesOrder, "stereotype");
createImplementEdges("ArchitecturalLayer", layerOrder, "layer");
createImplementEdges("Visibility", visibilityOrder, "visibility");

console.log(stereotypesOrder);
console.log(layerOrder)
console.log(visibilityOrder)

// Save the modified graph
fs.writeFileSync("./integration/result/k9mail-test.json", JSON.stringify({elements: graphs}, null, 2));
console.log("Graph with dimensions saved successfully!");