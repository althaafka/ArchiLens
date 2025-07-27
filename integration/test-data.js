import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const printDivider = () => {console.log("----------------------------------------------\n")}

// Load JSON file
const graphPath = "./integration/result/jpacman-test.json";
const rawData = fs.readFileSync(graphPath, "utf-8");
const graph = JSON.parse(rawData);

const nodes = graph.elements?.nodes || [];
const edges = graph.elements?.edges || [];

// 1. Hitung jumlah node bertipe "structurer"
const structurerNodes = nodes.filter(node =>
  (node.data.labels || []).includes("Structure") && node.data.id!="java.lang.String"
);
console.log(`Jumlah node dengan label 'Structurer': ${structurerNodes.length}`);
printDivider();

// 2. Temukan container dan anak-anaknya berdasarkan edge bertipe "contains"
const containsEdges = edges.filter(edge => edge.data.label === "contains");

const containerMap = new Map();
for (const edge of containsEdges) {
  const { source, target } = edge.data;
  if (!containerMap.has(source)) {
    containerMap.set(source, []);
  }
  containerMap.get(source).push(target);
}

const containerNodes = nodes.filter(node => containerMap.has(node.data.id));

console.log("Container dan anak-anaknya:");
for (const container of containerNodes) {
  if (container.data.labels.includes("Structure")) continue;
  const children = containerMap.get(container.data.id) || [];
  console.log(`- ${container.data.label || container.data.id}: ${children.length} anak`);
  for (const childId of children) {
    const child = nodes.find(n => n.data.id === childId);
    console.log(`    • ${child?.data.label || child?.data.id}`);
  }
}
printDivider();

console.log("Ketebalan Edge");

const test2 = "nl.tudelft.jpacman.level.LevelFactory$RandomGhost"
const edges4 = edges.filter(edge => ((edge.data.source == test2 || edge.data.target == test2) && edge.data.label == "contains"));
console.log("Edge \"CONTAINS\" of LevelFactory:")
edges4.forEach(edge => console.log(` - w:`, edge.data.properties.weight,"=>", edge.data.target, "=>", edge.data.source))

const test = "nl.tudelft.jpacman.level.MapParser"
const edgesHasScript = edges.filter(edge => ((edge.data.source == test || edge.data.target == test) && edge.data.label == "hasScript"));
console.log("Edge \"CONSTRUCTS\" of MapParser:")
console.log(" HASSCRIPT")
edgesHasScript.forEach(edge => console.log(`  - w:`, edge.data.properties.weight,"=>", edge.data.target))
const testScriptIds = edgesHasScript.map(e => e.data.target);
const edgesInstantiates = edges.filter(edge =>
  (testScriptIds.includes(edge.data.source) || testScriptIds.includes(edge.data.target)) &&
  edge.data.label == "instantiates"
);
console.log("INSTANTIATES:");
edgesInstantiates.forEach(edge => {
  console.log(`  - w: ${edge.data.properties?.weight} => ${edge.data.target} => ${edge.data.source}`);
});

const test03 = "nl.tudelft.jpacman.npc.ghost.Pinky";
let hascript = edges.filter(edge => ((edge.data.source == test03 || edge.data.target == test03) && edge.data.label == "hasScript"));
console.log("Edge \"CALLS\" of Pinky:")
console.log(" HASSCRIPT")
hascript.forEach(edge => console.log(`  - w:`, edge.data.properties.weight,"=>", edge.data.target))
let script = hascript.map(e => e.data.target);
let invokes = edges.filter(edge => (script.includes(edge.data.source) && edge.data.label == "invokes"));
console.log(" INVOKES")
invokes.forEach(edge => console.log(`  - w:`, edge.data.properties.weight,"=>", edge.data.source, "=>", edge.data.target))
let operation = invokes.map(e => e.data.target);
let hascript2 = edges.filter(e => operation.includes(e.data.target) && e.data.label == "hasScript")
console.log(" HASSCRIPT 2")
hascript2.forEach(edge => console.log(`  - w:`, edge.data.properties.weight,"=>", edge.data.source))

