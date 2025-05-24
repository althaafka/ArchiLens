import cytoscape from "cytoscape";

export class GraphManager {
  private cy: cytoscape.Core;

  constructor(container: HTMLElement, elements: cytoscape.ElementsDefinition, style: cytoscape.StylesheetJson) {
    this.cy = cytoscape({
      container,
      elements,
      style,
      layout: { name: 'grid' }
    });
  }

  public getInstance(): cytoscape.Core {
    return this.cy;
  }

  public resetGraph(elements: cytoscape.ElementsDefinition) {
    this.cy.elements().remove();
    this.cy.add(elements);
    this.cy.layout({ name: 'grid' }).run();
  }

  public destroy() {
    this.cy.destroy();
  }
}