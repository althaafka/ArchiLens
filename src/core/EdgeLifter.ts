import cytoscape from "cytoscape";
import { getEdgeLabel } from "../utils/edgeUtils";

export class EdgeLifter {
  private cy: cytoscape.Core;

  constructor(cy: cytoscape.Core) {
    this.cy = cy;
  }

  private groupEdgesByLabel(edges): Map<string, Set<any>> {
      const edgesMap = new Map<string, Set<any>>();
      edges.forEach(edge => {
          const label = getEdgeLabel(edge);
          if (!edgesMap.has(label)) {
              edgesMap.set(label, new Set());
          }
          edgesMap.get(label)?.add(edge);
      });
      return edgesMap;
  }
  
  public unlift(maxDepth) {
    for (let d = 2; d <= maxDepth; d++) {
      this.unliftEdges(d);
    }
  }

  public unliftEdges(level) {
    console.log("UNLIFTEDGES",level)
    const liftedEdges = this.cy.edges().filter(edge => 
      edge.data('properties')?.metaSrc === "lifting" &&
      edge.data('properties')?.level === level
    )


    liftedEdges.forEach(lifted => {
      const bundle = lifted.data('properties')?.bundle;
      if (Array.isArray(bundle)) {
        bundle.forEach(oriData => {
          oriData.restore()
        })
      }
    })

    liftedEdges.remove();
  }

  public lift(maxDepth, level) {
    for (let d = maxDepth; d >= level; d--) {
      this.liftEdges(d);
    }
  }

  public liftEdges(level) {

    const nodes = this.cy.nodes().filter(node => node.data('properties')?.depth == level)
    
    const edges = nodes.connectedEdges()
    
    const edgesMap = this.groupEdgesByLabel(edges)
    console.log("MAP:", edgesMap)

    const newEdges = {}

    edgesMap.forEach((edges, label) => {
      if (label == "contains") return
      edges.forEach(edge => {

        let src = edge.source()
        let tgt = edge.target()

        if (src.parent() != tgt.parent()){
          while(src.data('properties')?.depth >= level) {
            src = src.parent()
          }
          while(tgt.data('properties')?.depth >= level) {
            tgt = tgt.parent()
          }
        }

        const key = `${src.id()}-${label}-${tgt.id()}`;

        if (!newEdges[key]) {
          newEdges[key] = {
					  group: "edges", 
            data: {
						  source: src.id(),
						  target: tgt.id(),
						  label: getEdgeLabel(edge),
						  properties: {
							  ...edge.data('properties'),
							  weight: 0,
							  bundle: [],
							  metaSrc: "lifting",
                level: level
						  }
					  }
				  };
        }
        newEdges[key].data.properties["weight"] += edge.data('properties')?.weight
        newEdges[key].data.properties["bundle"].push(edge);
      })
    })

    this.cy.add(Object.values(newEdges));

     edges.filter(e => getEdgeLabel(e) !== "contains").remove();
  }
}