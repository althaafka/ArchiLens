import cytoscape from "cytoscape";

export function getNodeName(node: cytoscape.NodeSingular): string {
  const { name, shortname, simpleName } = node.data('properties') || {};
  return name || shortname || simpleName || node.id();
}

export function getNodeLabels(node: cytoscape.NodeSingular): string[] {
  return node?.data('labels') || [node?.data('label')] || [];
}

export function nodeHasLabels(node: cytoscape.NodeSingular, labels: string[]): boolean {
  const nodeLabels = getNodeLabels(node);
  return labels.every(label => nodeLabels.includes(label))
}

export function isPureContainer(node: cytoscape.NodeSingular): boolean {
  return nodeHasLabels(node, ['Container']) && !nodeHasLabels(node, ['Structure'])
}

export function  removeChildRelation(node: cytoscape.NodeSingular) {
  const children = node.children().filter(child => !child.removed());
  if (children.length === 0) return;

  try {
    children.forEach(child => {
      child.move({ parent: null });
    });
  } catch (err) {
    console.log("Failed to remove child relation", {
      nodeId: node.id(),
      err,
    });
  }
 }

export function addChildRelation(parent: cytoscape.NodeSingular, child: cytoscape.NodeSingular) {
  if (!parent || !child) return;

  const parentValid = parent.cy() && !parent.removed();
  const childValid = child.cy() && !child.removed();

  if (!parentValid || !childValid) return;

  if (child && parent.id()) {
    try {
      child.forEach(child => {
        child.move({ parent: null });
      });
      child.move({ parent: parent.id() });
    } catch (err) {
      console.log("Failed to move child", { parentId: parent.id(), childId: child.id(), err });
    }
  }
}

export function getNodeParent(node: cytoscape.NodeSingular): cytoscape.NodeSingular {
  return node.parent()[0]
}