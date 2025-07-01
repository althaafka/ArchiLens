import cytoscape from "cytoscape";

export class NodeVisibilityManager {
  private cy: cytoscape.Core;
  private analyticAspect: any;
  private coloring: string;
  private categoryVisibility: any;
  private checkedNodes: any;
  private selectedContainer: string;

  constructor(cy, analyticAspect) {
    this.cy;
    this.analyticAspect;

    this.coloring = 'none';
    this.categoryVisibility = {};
    this.selectedContainer = "";
    this.checkedNodes = {}
  }


}