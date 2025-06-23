import cytoscape from "cytoscape";
import { edgeHasLabel, getEdgeLabel } from "../../utils/edgeUtils";
import { isSemanticGridEl } from "../../utils/graphUtils";

export class EdgeLifter {
  private cy: cytoscape.Core;

  constructor(cy: cytoscape.Core) {
    this.cy = cy;
  }

  // public lift(): void {
  //   const edges = this.cy.edges();
  //   const nodes = this.cy.nodes();

  //   const newEdges = edges.filter(e =>
  //     e.source().data('labels')?.includes("Structure") &&
  //     e.target().data('labels')?.includes("Structure") &&
  //     e.target().parent() !== e.source().parent()
  //   ).reduce((acc, e: cytoscape.EdgeSingular) => {
  //     const srcParent = e.source().parent().first().id();
  //     const tgtParent = e.target().parent().first().id();
  //     const nodeSrc = nodes.filter(node => node.id() == srcParent);
  //     const nodeTgt = nodes.filter(node => node.id() == tgtParent);
  //     if (!srcParent || !tgtParent) return acc;
  //     if (nodeSrc.parent().first().id() == nodeTgt.id() || nodeSrc.id() == nodeTgt.parent().first().id()) return acc;

  //     const key = `${srcParent}-${e.data('label')}-${tgtParent}`;
  //     if (!acc[key]) {
  //       acc[key] = {
  //         group: "edges",
  //         data: {
  //           source: srcParent,
  //           target: tgtParent,
  //           label: getEdgeLabel(e),
  //           interaction: getEdgeLabel(e),
  //           properties: { ...e.data('properties'), weight: 0, metaSrc: "lifting" }
  //         }
  //       };
  //     }
  //     acc[key].data.properties.weight += 1;
  //     return acc;
  //   }, {})
  
  //   this.cy.add(Object.values(newEdges));
  //   this.cy.edges().filter(e => e.source().data('labels').includes("Structure") && e.target().data('labels').includes("Structure") && e.target().parent() !== e.source().parent()).remove();
  // }

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
  
  private getParentWithDepth(depth, node){
    let parent = node
    while (parent.data('properties').depth > depth) {
      parent = parent.parent();
    }
    if (parent.data('properties').depth < depth) return null
    return parent
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
    console.log("LIFT EDGES..", level)
    // console.log("Edge semantic grid sebelum");
    // this.cy.edges().forEach(e => {
    //   if (isSemanticGridEl(e)) {
    //     console.log(e.data());
    //   }
    // });

    const nodes = this.cy.nodes().filter(node => node.data('properties')?.depth == level)
    
    const edges = nodes.connectedEdges()
    // console.log("Edge semantic grid tengah2");
    // edges.forEach(e => {
    //   if (isSemanticGridEl(e)) {
    //     console.log(e.data());
    //   }
    // });

    
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
    // console.log("Edge semantic grid setelah");
    // edges.forEach(e => {
    //   if (isSemanticGridEl(e)) {
    //     console.log(e.data());
    //   }
    // });
     edges.filter(e => getEdgeLabel(e) !== "contains").remove();

    // console.log("Edge semantic grid sgt sgt setelah");
    // this.cy.edges().forEach(e => {
    //   if (isSemanticGridEl(e)) {
    //     console.log(e.data());
    //   }
    // });
  }
}