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

// Cari node dengan simpleName tertentu
const spriteSimpleNames = [
  "PacManSprites",
  "SpriteStore",
  "ImageSprite",
  "AnimatedSprite",
  "Sprite",
  "Empty Sprite"
];

const spriteNodes = nodes.filter(node =>
  spriteSimpleNames.includes(node.data.properties?.simpleName)
);

console.log("=== Sprite Nodes ===");
spriteNodes.forEach(n => console.log(`- ${n.data.properties.simpleName} [${n.data.id}]`));
printDivider();

// Buat peta dari semua node kategori di dimensi DependencyLayer
const categoryNodes = nodes.filter(node =>
  (node.data.labels || []).includes("Category") &&
  node.data.id.includes("DependencyProfile:")
);

// Cari edge `implements` dari node sprite ke kategori
const implementsEdges = edges.filter(edge => edge.data.label === "implements");

console.log("=== Dependency Layer Categories for Sprite Nodes ===");
for (const spriteNode of spriteNodes) {
  const relatedEdge = implementsEdges.find(edge => edge.data.source === spriteNode.data.id && edge.data.target.includes("DependencyProfile:"));
  if (!relatedEdge) {
    console.log(`- ${spriteNode.data.properties.simpleName}: Tidak ada kategori (tidak ditemukan edge 'implements')`);
    continue;
  }

  const categoryNode = categoryNodes.find(n => n.data.id === relatedEdge.data.target);
  if (!categoryNode) {
    console.log(`- ${spriteNode.data.properties.simpleName}: Kategori tidak ditemukan (id: ${relatedEdge.data.target})`);
  } else {
    console.log(`- ${spriteNode.data.properties.simpleName}: ${categoryNode.data.properties?.name || categoryNode.data.id}`);
  }
}
printDivider();


console.log("=== Sprite Nodes ===");
spriteNodes.forEach(n => console.log(`- ${n.data.properties.simpleName} [${n.data.id}]`));
printDivider();

// Buat peta dari semua node kategori di dimensi Archi
const categoryNodes2 = nodes.filter(node =>
  (node.data.labels || []).includes("Category") &&
  node.data.id.includes("ArchitecturalLayer:")
);

// Cari edge `implements` dari node sprite ke kategori
const implementsEdges2 = edges.filter(edge => edge.data.label === "implements");

console.log("--- Architectural Layer Categories for Sprite Nodes ---");
for (const spriteNode of spriteNodes) {
  const relatedEdge = implementsEdges2.find(edge => edge.data.source === spriteNode.data.id && edge.data.target.includes("ArchitecturalLayer:"));
  if (!relatedEdge) {
    console.log(`- ${spriteNode.data.properties.simpleName}: Tidak ada kategori (tidak ditemukan edge 'implements')`);
    continue;
  }

  const categoryNode = categoryNodes2.find(n => n.data.id === relatedEdge.data.target);
  if (!categoryNode) {
    console.log(`- ${spriteNode.data.properties.simpleName}: Kategori tidak ditemukan (id: ${relatedEdge.data.target})`);
  } else {
    console.log(`- ${spriteNode.data.properties.simpleName}: ${categoryNode.data.properties?.name || categoryNode.data.id}`);
  }
}
printDivider();


function getArchitecturalLayer(){
  console.log("=== Composed Architectural Layer from hasScript ===");

for (const spriteNode of spriteNodes) {
  // 1. Ambil edge hasScript dari node utama
  const hasScriptEdges = edges.filter(edge =>
    edge.data.label === "hasScript" && edge.data.source === spriteNode.data.id
  );

  if (hasScriptEdges.length === 0) {
    console.log(`- ${spriteNode.data.properties.simpleName}: Tidak memiliki hasScript`);
    continue;
  }

  // 2. Ambil semua target dari hasScript (script nodes)
  const scriptNodeIds = hasScriptEdges.map(edge => edge.data.target);

  // 3. Temukan implements -> ArchitecturalLayer dari setiap script
  const implementsArchiEdges = edges.filter(edge =>
    edge.data.label === "implements" &&
    scriptNodeIds.includes(edge.data.source) &&
    edge.data.target.includes("ArchitecturalLayer:")
  );

  if (implementsArchiEdges.length === 0) {
    console.log(`- ${spriteNode.data.properties.simpleName}: Script tidak memiliki kategori Architectural Layer`);
    continue;
  }

  // 4. Hitung jumlah kategori
  const categoryCount = {};
  for (const implEdge of implementsArchiEdges) {
    const categoryId = implEdge.data.target;
    const categoryNode = nodes.find(n => n.data.id === categoryId);
    const name = categoryNode?.data.properties?.name || categoryId;
    categoryCount[name] = (categoryCount[name] || 0) + 1;
  }

  console.log(`- ${spriteNode.data.properties.simpleName}:`);
  for (const [category, count] of Object.entries(categoryCount)) {
    console.log(`    • ${category}: ${count}`);
  }
}
printDivider();
}

getArchitecturalLayer()

function countHasScriptForSpriteNodes() {
  const spriteSimpleNames = [
    "PacManSprites",
    "SpriteStore",
    "ImageSprite",
    "AnimatedSprite",
    "Sprite",
    "Empty Sprite"
  ];

  const spriteNodes = nodes.filter(node =>
    spriteSimpleNames.includes(node.data.properties?.simpleName)
  );

  console.log("=== Jumlah hasScript untuk Setiap Sprite Node ===");
  spriteNodes.forEach(sprite => {
    const count = edges.filter(e =>
      e.data.label === "hasScript" && e.data.source === sprite.data.id
    ).length;

    console.log(`- ${sprite.data.properties.simpleName} [${sprite.data.id}]: ${count} hasScript`);
  });

  console.log("----------------------------------------------\n");
}

countHasScriptForSpriteNodes()

function getArchitecturalCategoryForSpriteNodes() {
  const spriteSimpleNames = [
    "PacManSprites",
    "SpriteStore",
    "ImageSprite",
    "AnimatedSprite",
    "Sprite",
    "Empty Sprite"
  ];

  const spriteNodes = nodes.filter(node =>
    spriteSimpleNames.includes(node.data.properties?.simpleName)
  );

  const categoryNodes = nodes.filter(node =>
    (node.data.labels || []).includes("Category") &&
    node.data.id.startsWith("ArchitecturalLayer:")
  );

  const implementsEdges = edges.filter(edge => edge.data.label === "implements");

  console.log("=== Final Architectural Category for Each Sprite Node ===");

  for (const spriteNode of spriteNodes) {
    // Step 1: Check simple dimension (direct 'implements')
    const implEdge = implementsEdges.find(edge =>
      edge.data.source === spriteNode.data.id &&
      edge.data.target.startsWith("ArchitecturalLayer:")
    );

    if (implEdge) {
      const categoryNode = categoryNodes.find(n => n.data.id === implEdge.data.target);
      const categoryName = categoryNode?.data.properties?.name || implEdge.data.target;
      console.log(`- ${spriteNode.data.properties.simpleName}: ${categoryName} (simple)`);
      continue;
    }

    // Step 2: Fallback to composed dimension
    const hasScriptEdges = edges.filter(e =>
      e.data.label === "hasScript" && e.data.source === spriteNode.data.id
    );
    const scriptIds = hasScriptEdges.map(e => e.data.target);

    const composedImplEdges = implementsEdges.filter(e =>
      scriptIds.includes(e.data.source) &&
      e.data.target.startsWith("ArchitecturalLayer:")
    );

    if (composedImplEdges.length === 0) {
      console.log(`- ${spriteNode.data.properties.simpleName}: - (no category found)`);
      continue;
    }

    // Count categories to find the most frequent (max)
    const counter = {};
    composedImplEdges.forEach(e => {
      const categoryId = e.data.target;
      counter[categoryId] = (counter[categoryId] || 0) + 1;
    });

    const maxCategoryId = Object.entries(counter).sort((a, b) => b[1] - a[1])[0][0];
    const categoryNode = categoryNodes.find(n => n.data.id === maxCategoryId);
    const categoryName = categoryNode?.data.properties?.name || maxCategoryId;

    console.log(`- ${spriteNode.data.properties.simpleName}: ${categoryName} (composed)`);
  }

  console.log("----------------------------------------------\n");
}

getArchitecturalCategoryForSpriteNodes()

function getSimpleArchitecturalLayerForSpriteNodes() {
  const spriteSimpleNames = [
    "PacManSprites",
    "SpriteStore",
    "ImageSprite",
    "AnimatedSprite",
    "Sprite",
    "Empty Sprite"
  ];

  const spriteNodes = nodes.filter(node =>
    spriteSimpleNames.includes(node.data.properties?.simpleName)
  );

  const categoryNodes = nodes.filter(node =>
    (node.data.labels || []).includes("Category") &&
    node.data.id.startsWith("ArchitecturalLayer:")
  );

  const implementsEdges = edges.filter(edge => edge.data.label === "implements");

  console.log("=== Simple ArchitecturalLayer (direct implements) for Sprite Nodes ===");

  for (const spriteNode of spriteNodes) {
    const implEdge = implementsEdges.find(edge =>
      edge.data.source === spriteNode.data.id &&
      edge.data.target.startsWith("ArchitecturalLayer:")
    );

    if (implEdge) {
      const categoryNode = categoryNodes.find(n => n.data.id === implEdge.data.target);
      const categoryName = categoryNode?.data.properties?.name || implEdge.data.target;
      console.log(`- ${spriteNode.data.properties.simpleName}: ${categoryName}`);
    } else {
      console.log(`- ${spriteNode.data.properties.simpleName}: -`);
    }
  }

  console.log("----------------------------------------------\n");
}

getSimpleArchitecturalLayerForSpriteNodes();

function getSimpleDPForSpriteNodes() {
  const spriteSimpleNames = [
    "PacManSprites",
    "SpriteStore",
    "ImageSprite",
    "AnimatedSprite",
    "Sprite",
    "Empty Sprite"
  ];

  const spriteNodes = nodes.filter(node =>
    spriteSimpleNames.includes(node.data.properties?.simpleName)
  );

  const categoryNodes = nodes.filter(node =>
    (node.data.labels || []).includes("Category") &&
    node.data.id.startsWith("DependencyProfile:")
  );

  const implementsEdges = edges.filter(edge => edge.data.label === "implements");

  console.log("=== Simple DependencyProfile (direct implements) for Sprite Nodes ===");

  for (const spriteNode of spriteNodes) {
    const implEdge = implementsEdges.find(edge =>
      edge.data.source === spriteNode.data.id &&
      edge.data.target.startsWith("DependencyProfile:")
    );

    if (implEdge) {
      const categoryNode = categoryNodes.find(n => n.data.id === implEdge.data.target);
      const categoryName = categoryNode?.data.properties?.name || implEdge.data.target;
      console.log(`- ${spriteNode.data.properties.simpleName}: ${categoryName}`);
    } else {
      console.log(`- ${spriteNode.data.properties.simpleName}: -`);
    }
  }

  console.log("----------------------------------------------\n");
}

getSimpleDPForSpriteNodes();