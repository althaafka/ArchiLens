import fs from "fs";


// Dimention: stereotypes, role stereotypes, layer, dependencyProfile

// Load file JSON
const graphs = JSON.parse(fs.readFileSync("./integration/data/jpacman-v3.json", "utf-8")).elements;

// Clean implements and Grouping
graphs.edges = graphs.edges.filter(edge => edge.data.label != "implements");
graphs.nodes = graphs.nodes.filter(node => !node.data.labels.includes("Grouping"))

// Cat order
let stereotypesOrder = [
]

let rsOrder = [
    "User Interfacer",
    "Coordinator",
    "Controller",
    "Service Provider",
    "Structurer",
    "Information Holder"
]

let layerOrder = [
    'UI',
    'Presentation Layer',
    'Application Layer',
    'Domain',
    'Logic',
    'Data',
]
let dpOrder = [
    "outbound",
    "transit",
    "inbound",
    "hidden"
]

graphs.nodes.forEach(node => {
    if (node.data.properties.stereotype && !stereotypesOrder.includes(node.data.properties.stereotype)){
        stereotypesOrder.push(node.data.properties.stereotype)
    }
    // if (node.data.properties.roleStereotype && !rsOrder.includes(node.data.properties.roleStereotype)){
    //     rsOrder.push(node.data.properties.roleStereotype)
    // }
    // if (node.data.properties.layer && !layerOrder.includes(node.data.properties.layer)){
    //     layerOrder.push(node.data.properties.layer)
    // }    
    // if (node.data.properties.dependencyProfile && !dpOrder.includes(node.data.properties.dependencyProfile)){
    //     dpOrder.push(node.data.properties.dependencyProfile)
    // }
})

const stereotypeDimensionId = "Dimension:Stereotypes";
const layerDimensionId = "Dimension:ArchitecturalLayer";
const dpDimensionId = "Dimension:DependencyProfile";
const rsDimensionId = "Dimension:RoleStereotypes"

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
        id: rsDimensionId,
        labels: ["Dimension"],
        properties: {
            simpleName: "RoleStereotypes"
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

graphs.nodes.push({
    data:{
        id: dpDimensionId,
        labels: ["Dimension"],
        properties: {
            simpleName: "DependencyProfile"
        }
    }
})

// Create Node Category and Edge 'composes
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
createCategory("RoleStereotypes", rsOrder, rsDimensionId);
createCategory("ArchitecturalLayer", layerOrder, layerDimensionId);
createCategory("DependencyProfile", dpOrder, dpDimensionId)

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
createSuceedEdges("RoleStereotypes", rsOrder);
createSuceedEdges("ArchitecturalLayer", layerOrder);
createSuceedEdges("DependencyProfile", dpOrder);

// Create Edges "implement"
function createImplementEdges(dimName, catOrder, properties) {
    graphs.nodes.forEach((node) => {
        const cat = node.data?.properties[properties];
        if (cat) {
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
createImplementEdges("RoleStereotypes", rsOrder, "roleStereotype");
createImplementEdges("ArchitecturalLayer", layerOrder, "layer");
createImplementEdges("DependencyProfile", dpOrder, "dependencyProfile");

console.log(stereotypesOrder);
console.log(rsOrder)
console.log(layerOrder)
console.log(dpOrder)

// Save the modified graph
fs.writeFileSync("./integration/result/jpacman-dim-test.json", JSON.stringify({elements: graphs}, null, 2));
console.log("Graph with dimensions saved successfully!");