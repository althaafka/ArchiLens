import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Load JSON file
const graphPath = "./integration/result/jpacman-test.json";
const rawData = fs.readFileSync(graphPath, "utf-8");
const graph = JSON.parse(rawData);

const nodes = graph.elements?.nodes || [];
const edges = graph.elements?.edges || [];

// 1. Hitung jumlah node bertipe "structurer"
const structurerNodes = nodes.filter(node =>
  (node.data.labels || []).includes("Structure")
);
console.log(`Jumlah node dengan label 'Structurer': ${structurerNodes.length}`);

// 2. Temukan container dan anak-anaknya berdasarkan edge bertipe "contains"
const containsEdges = edges.filter(edge => edge.data.label === "contains");

// Buat map: parentId → [childId1, childId2, ...]
const containerMap = new Map();
for (const edge of containsEdges) {
  const { source, target } = edge.data;
  if (!containerMap.has(source)) {
    containerMap.set(source, []);
  }
  containerMap.get(source).push(target);
}

// Ambil informasi container dari node
const containerNodes = nodes.filter(node => containerMap.has(node.data.id));

// Tampilkan info container dan anak-anaknya
console.log("\nContainer dan anak-anaknya:");
for (const container of containerNodes) {
  const children = containerMap.get(container.data.id) || [];
  console.log(`- ${container.data.label || container.data.id}: ${children.length} anak`);
  for (const childId of children) {
    const child = nodes.find(n => n.data.id === childId);
    console.log(`    • ${child?.data.label || child?.data.id}`);
  }
}
