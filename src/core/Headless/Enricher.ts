import cytoscape from "cytoscape";
import { getEdgesByLabel, getNodesByLabel, getRoots } from "../../utils/graphUtils";
import { edgeHasLabel } from "../../utils/edgeUtils";
import { nodeHasLabels, getNodeName } from "../../utils/nodeUtils";

export class DimensionEnricher {
  public static enrich(cy: cytoscape.Core): void {
    const edges = cy.edges();
    const nodes = cy.nodes();

    const composesEdges = getEdgesByLabel(edges, 'composes');
    const implementsEdges = getEdgesByLabel(edges, 'implements');
    const succeedsEdges = getEdgesByLabel(edges, 'succeeds');
    const refinesEdges = getEdgesByLabel(edges, 'refines');

    const dimensions = getNodesByLabel(nodes, 'Dimension');
    const categories = getNodesByLabel(nodes, 'Category');

    // Succeeds di-subset per kumpulan node untuk akurasi "incoming roots"
    function sortBySucceeds(cats: string[], allSucceeds: cytoscape.EdgeCollection): string[] {
      const catSet = new Set(cats);

      // batasi succeeds ke dalam subset cats
      const localSucceeds = allSucceeds.filter(e =>
        catSet.has(e.data('source')) && catSet.has(e.data('target'))
      );

      const incoming = new Set(localSucceeds.map(e => e.data('target')));
      const roots = cats.filter(id => !incoming.has(id));

      const ordered: string[] = [];
      const visited = new Set<string>();

      roots.forEach(root => {
        let current: string | undefined = root;
        while (current && !visited.has(current)) {
          ordered.push(current);
          visited.add(current);

          // cari edge succeeds berikutnya yang masih di subset
          const nextEdge = localSucceeds.filter(e => e.data('source') === current);
          current = nextEdge?.data('target');
          if (visited.has(current)) break;
        }
      });

      // kalau ada node belum terkunjungi (misal chain terputus), append di akhir
      const remaining = cats.filter(id => !visited.has(id));
      ordered.push(...remaining);
      return ordered;
    }

    // DFS `refines` dengan urutan anak diurutkan oleh succeeds
    function traverseRefines(current: string,
                             allRefines: cytoscape.EdgeCollection,
                             allSucceeds: cytoscape.EdgeCollection,
                             scopeSet: Set<string>,
                             ordered: string[],
                             seen: Set<string>) {
      if (seen.has(current)) return; // cegah siklus
      console.log("------current-----",current)
      seen.add(current);
      ordered.push(current);

      // anak = node yang menjadi target refines dari current, dibatasi scope
      const children = allRefines
        .filter(e => e.data('source') === current &&
                     scopeSet.has(e.data('target')))
        .map(e => e.data('target'));
      console.log("children:", children)
      const sortedChildren = sortBySucceeds(children, allSucceeds);
      console.log("sortedChildren:",sortedChildren)
      sortedChildren.forEach(child => traverseRefines(child, allRefines, allSucceeds, scopeSet, ordered, seen));
    }

    // dimensions?.forEach(dim => {
    //   // Semua kategori yang “terhubung” ke dimensi ini (level apa pun)
    //   const dimCategories = composesEdges
    //     .filter(e => e.data('source') === dim.id())
    //     .map(e => e.data('target'));

    //   console.log("dimCategories:", dimCategories)

    //   const dimCatSet = new Set(dimCategories);

    //   // Batasi edge ke dalam ruang kategori-dim ini
    //   const localRefines = refinesEdges.filter(e =>
    //     dimCatSet.has(e.data('source')) && dimCatSet.has(e.data('target'))
    //   );
    //   const localSucceeds = succeedsEdges.filter(e =>
    //     dimCatSet.has(e.data('source')) && dimCatSet.has(e.data('target'))
    //   );

    //   console.log("localrefines,", localRefines)
    //   console.log("localsucceds", localSucceeds)

    //   // Top-level = tidak pernah menjadi target di refines *maupun* succeeds
    //   const hasIncomingRefines = new Set(localRefines.map(e => e.data('target')));
    //   const hasIncomingSucceeds = new Set(localSucceeds.map(e => e.data('target')));
    //   const topLevel = dimCategories.filter(id =>
    //     !hasIncomingRefines.has(id) && !hasIncomingSucceeds.has(id)
    //   );
    //   console.log("topLevel", topLevel)

    //   // Urutkan top-level sibling dulu pakai succeeds
    //   const sortedTopLevel = sortBySucceeds(topLevel, localSucceeds);
    //   console.log("sorted toplevel", sortedTopLevel)

    //   // Lalu DFS refines per top-level dengan ordering anak mengikuti succeeds
    //   const orderedCategories: string[] = [];
    //   const seen = new Set<string>();
    //   sortedTopLevel.forEach(catId => {
    //     traverseRefines(catId, localRefines, localSucceeds, dimCatSet, orderedCategories, seen);
    //   });
    //   console.log("orderedCategories:",orderedCategories)

    //   // Tambahkan '-' sebagai pemisah akhir seperti sebelumnya
    //   orderedCategories.push('-');
    //   dim.data('categories', orderedCategories);
    // });

    dimensions?.forEach(dim => {
  // Semua kategori yang “terhubung” ke dimensi ini (level apa pun)
  const dimCategories = composesEdges
    .filter(e => e.data('source') === dim.id())
    .map(e => e.data('target'));

  const dimCatSet = new Set(dimCategories);

  // Batasi edge ke ruang dimensi ini
  const localRefines = refinesEdges.filter(e =>
    dimCatSet.has(e.data('source')) && dimCatSet.has(e.data('target'))
  );
  const localSucceeds = succeedsEdges.filter(e =>
    dimCatSet.has(e.data('source')) && dimCatSet.has(e.data('target'))
  );

  // ✅ Top-level = tidak menjadi target refines (abaikan succeeds)
  const hasIncomingRefines = new Set(localRefines.map(e => e.data('target')));
  const topLevel = dimCategories.filter(id => !hasIncomingRefines.has(id));

  // Urutkan top-level antar-sibling by succeeds
  const sortedTopLevel = sortBySucceeds(topLevel, localSucceeds);

  // DFS refines, urutan anak by succeeds
  const orderedCategories: string[] = [];
  const seen = new Set<string>();
  sortedTopLevel.forEach(catId => {
    traverseRefines(catId, localRefines, localSucceeds, dimCatSet, orderedCategories, seen);
  });

  orderedCategories.push('-');
  dim.data('categories', orderedCategories);
});


    // ---- sisanya tetap sama ----

    categories?.forEach(cat => {
      const categoriesMember = implementsEdges
        .filter(edge => edge.data('target') === cat.id())
        .map(edge => edge.data('source'));
      cat.data('members', categoriesMember);
    });

    implementsEdges?.forEach(edge => {
      const node = cy.getElementById(edge.data('source'));
      if (!node.data('properties').dimension) {
        node.data('properties').dimension = {};
      }

      // ambil dimId dari composes (kategori -> dim yang sama)
      const dimId = composesEdges
        .filter(cEdge => edge.data('target') === cEdge.data('target'))[0]
        ?.data('source');

      if (!node.data('properties').dimension[dimId]) {
        node.data('properties').dimension[dimId] = [];
      }

      node.data('properties').dimension[dimId].push(edge.data('target'));
    });

    const allNodes = cy.nodes().filter(node => {
      const id = node.id();
      const isExcluded = id === 'java.lang.String';
      const labels = node.data('labels') || [];
      return !isExcluded && !labels.includes('Container') && labels.includes('Structure');
    });

    dimensions?.forEach(dim => {
      const dimId = dim.id();
      let isOnlyComposed = true;

      allNodes.forEach(node => {
        if (!node.data('properties').dimension) {
          node.data('properties').dimension = {};
        }
        const hasCategory = node?.data('properties')?.dimension[dimId];
        if (hasCategory) isOnlyComposed = false;
      });

      allNodes.forEach(node => {
        if (isOnlyComposed) {
          node.data('properties').dimension[dimId] = [];
          return;
        }

        const hasCategory = node.data('properties').dimension[dimId];
        if (!hasCategory || hasCategory.length === 0) {
          node.data('properties').dimension[dimId] = ['-'];
        }
      });
    });
  }
}

// export class DimensionEnricher {
  

//   public static enrich(cy: cytoscape.Core): void {
//     const edges = cy.edges();
//     const nodes = cy.nodes();

//     const composesEdges = getEdgesByLabel(edges, 'composes');
//     const implementsEdges = getEdgesByLabel(edges, 'implements');
//     const succeedsEdges = getEdgesByLabel(edges, 'succeeds');
//     const refinesEdges = getEdgesByLabel(edges, 'refines');
    
//     const dimensions = getNodesByLabel(nodes, 'Dimension');
//     const categories = getNodesByLabel(nodes, 'Category');

//     // function traverseRefines(current: string, ordered: string[]) {
//     //   ordered.push(current);

//     //   const children = refinesEdges
//     //     .filter(edge => edge.data('source') === current)
//     //     .map(edge => edge.data('target'));

//     //   const sortedChildren = sortBySucceeds(children, succeedsEdges);

//     //   sortedChildren.forEach(child => {
//     //     traverseRefines(child, ordered);
//     //   });
//     // }

//         function traverseRefines(current: string,
//                              allRefines: cytoscape.EdgeCollection,
//                              allSucceeds: cytoscape.EdgeCollection,
//                              scopeSet: Set<string>,
//                              ordered: string[],
//                              seen: Set<string>) {
//       if (seen.has(current)) return; // cegah siklus
//       seen.add(current);
//       ordered.push(current);

//       // anak = node yang menjadi target refines dari current, dibatasi scope
//       const children = allRefines
//         .filter(e => e.data('source') === current &&
//                      scopeSet.has(e.data('target')))
//         .map(e => e.data('target'));

//       const sortedChildren = sortBySucceeds(children, allSucceeds);
//       sortedChildren.forEach(child => traverseRefines(child, allRefines, allSucceeds, scopeSet, ordered, seen));
//     }

//         // Succeeds di-subset per kumpulan node untuk akurasi "incoming roots"
//     function sortBySucceeds(cats: string[], allSucceeds: cytoscape.EdgeCollection): string[] {
//       const catSet = new Set(cats);

//       // batasi succeeds ke dalam subset cats
//       const localSucceeds = allSucceeds.filter(e =>
//         catSet.has(e.data('source')) && catSet.has(e.data('target'))
//       );

//       const incoming = new Set(localSucceeds.map(e => e.data('target')));
//       const roots = cats.filter(id => !incoming.has(id));

//       const ordered: string[] = [];
//       const visited = new Set<string>();

//       roots.forEach(root => {
//         let current: string | undefined = root;
//         while (current && !visited.has(current)) {
//           ordered.push(current);
//           visited.add(current);

//           // cari edge succeeds berikutnya yang masih di subset
//           const nextEdge = localSucceeds.filter(e => e.data('source') === current);
//           current = nextEdge?.data('target');
//           if (visited.has(current)) break;
//         }
//       });

//       // kalau ada node belum terkunjungi (misal chain terputus), append di akhir
//       const remaining = cats.filter(id => !visited.has(id));
//       ordered.push(...remaining);
//       return ordered;
//     }
//     // function sortBySucceeds(categories: string[], succeedsEdges: cytoscape.EdgeCollection): string[] {
//     //   const incoming = new Set(succeedsEdges.map(e => e.data('target')));
//     //   const roots = categories.filter(id => !incoming.has(id));
//     //   const ordered: string[] = [];

//     //   const visited = new Set<string>();
//     //   roots.forEach(root => {
//     //     let current = root;
//     //     while (current && !visited.has(current)) {
//     //       ordered.push(current);
//     //       visited.add(current);
//     //       const nextEdge = succeedsEdges.filter(e => e.data('source') === current && categories.includes(e.data('target')));
//     //       current = nextEdge?.data('target');
//     //     }
//     //   });

//     // const remaining = categories.filter(id => !visited.has(id));
//     // ordered.push(...remaining);

//     // return ordered;
//     // }

//     dimensions?.forEach(dim => {
//       const composesCategories = composesEdges
//         .filter(edge => edge.data('source') === dim.id())
//         .map(edge => edge.data('target'));

//       const orderedCategories: string[] = [];

//       const sortedTopLevel = sortBySucceeds(composesCategories, succeedsEdges);
//       console.log("sorted top level", sortedTopLevel);
//       sortedTopLevel.forEach(catId => {
//         traverseRefines(catId, orderedCategories);
//       });

//       orderedCategories.push('-');
//       dim.data('categories', orderedCategories);

//       console.log("categories ll:", orderedCategories)
//       // let orderedCategories = []
//       // const startCategories = composesCategories.filter(catId => {
//       //   return succeedsEdges.every(edge => edge.data('target') != catId);
//       // })

//       // startCategories.forEach(startCat => {
//       //   const subChain = [startCat];
//       //   let current = startCat

//       //   while(true) {
//       //     const next = succeedsEdges.filter(edge => edge.data('source') == current)
//       //     if (next.length == 0) break;
//       //     current = next.data('target');
//       //     subChain.push(current)
//       //   }
//       //   orderedCategories.push(...subChain)
//       // })
      
//       // orderedCategories.push('-');
//       // dim.data('categories', orderedCategories);
//     })
//     // console.log("orderedCategories")

//     categories?.forEach(cat => {
//       const categoriesMember = implementsEdges
//           .filter(edge => edge.data('target') === cat.id())
//           .map(edge => edge.data('source'));
//       cat.data('members', categoriesMember);
//     });

//     implementsEdges?.forEach(edge => {
//       const node = cy.getElementById(edge.data('source'));
//       if (!node.data('properties').dimension) {
//         node.data('properties').dimension = {};
//       }

//       console.log(composesEdges)
//       console.log(edge.data('target'))
//       console.log(composesEdges.filter(cEdge => edge.data('target') == cEdge.data('target'))[0])
//       const dimId = composesEdges.filter(cEdge => edge.data('target') === cEdge.data('target'))[0]?.data('source');
//       console.log("--", dimId)

//       if (!node.data('properties').dimension[dimId]) {
//         node.data('properties').dimension[dimId] = [];
//       }

//       node.data('properties').dimension[dimId].push(edge.data('target'));
//     });

//     const allNodes = cy.nodes().filter(node => {
//       const id = node.id();
//       const isExcluded = id === 'java.lang.String';
//       const labels = node.data('labels') || [];
//       return !isExcluded && !labels.includes('Container') && labels.includes('Structure');
//     });
    
//     dimensions?.forEach(dim => {
//       const dimId = dim.id();
//       let isOnlyComposed = true
//       allNodes.forEach(node => {
//         if (!node.data('properties').dimension) {
//           node.data('properties').dimension = {};
//         }
//         const hasCategory = node?.data('properties')?.dimension[dimId];
//         if (hasCategory) {
//           isOnlyComposed = false
//         }
//       })

//       allNodes.forEach(node => {
//         if (isOnlyComposed) {
//           node.data('properties').dimension[dimId] = []
//           return;
//         }
        
//         const hasCategory = node.data('properties').dimension[dimId];
    
//         if (!hasCategory || hasCategory.length === 0) {
//           node.data('properties').dimension[dimId] = ["-"];
//         }
//       });
//     });
//   }
// }

export class MetricEnricher {
  public static enrich(cy: cytoscape.Core): void {
    const edges = cy.edges();
    const nodes = cy.nodes();

    const measuresEdges = getEdgesByLabel(edges, 'measures');
    const metrics = getNodesByLabel(nodes, 'Metric');

    metrics?.forEach(metric => {
      const measuredNode = measuresEdges
          .filter(edge => edge.data('target') === metric.id())
          .map(edge => [edge.data('source'), edge.data('properties').value]);

      metric.data("properties").members = measuredNode;

      let maxVal = -Infinity;
      let minVal = Infinity;
      measuredNode.forEach(([nodeId, value]) => {
          const node = cy.getElementById(nodeId)
          if (maxVal < value) maxVal = value
          if (minVal > value) minVal = value

          
          if (!node.data('properties').metric) {
              node.data('properties').metric = {};
              
              const metricId = metric.id();
              
              if (!node.data('properties').metric[metricId]) {
                  node.data('properties').metric[metricId] = value;
              }
              node.data('properties').metric[metricId] = value
          }
      })
      metrics.data('properties').maxValue = maxVal;
      metrics.data('properties').minValue = minVal;
    })
  }
}

export class ComposedDimensionEnricher {

  public static enrich(cy: cytoscape.Core, showStructure: boolean, containerFocus: string): void {
    const edges = cy.edges();
    const nodes = cy.nodes();

    const structures = getNodesByLabel(nodes, 'Structure');
    const hasScripts = getEdgesByLabel(edges, 'hasScript');
    const composesEdges = getEdgesByLabel(edges, 'composes');
    const implementsEdges = getEdgesByLabel(edges, 'implements');

    const composedDimIds = [
      ...new Set(
        composesEdges
          .filter(cEdge => {
            const categoryId = cEdge.data('target');
            const relatedImpls = edges.filter(edge =>
              edgeHasLabel(edge, 'implements') && edge.data('target') === categoryId
            );
            return relatedImpls.some(iEdge => {
              const sourceNode = cy.getElementById(iEdge.data('source'));
              return nodeHasLabels(sourceNode, ['Scripts']) || nodeHasLabels(sourceNode, ['Operation']);
            });
          })
          .map(cEdge => cEdge.data('source'))
      )
    ];


    const simpleDimIds = getNodesByLabel(nodes, 'Dimension').map(node => node.id());
    const dimensionIds = Array.from(new Set([...composedDimIds, ...simpleDimIds]));

    structures.forEach(structure => {
      if (structure.id() === 'java.lang.String') return;
      const scriptEdges = hasScripts.filter(edge => edge.data('source') === structure.id());
      const scripts = scriptEdges.map(edge => cy.getElementById(edge.data('target')));
  
      const composedDimension: Record<string, string[]> = {};
  
      scripts.forEach(script => {
        composedDimIds.forEach(dimensionId => {
          const matchedImpl = implementsEdges.filter(edge =>
            edge.data('source') === script.id() && edge.data('target').split(':')[0] === dimensionId.split(':')[1]
          );
          if (!composedDimension[dimensionId]) composedDimension[dimensionId] = [];
          if (matchedImpl.length > 0) {
            composedDimension[dimensionId].push(matchedImpl[0].data('target'));
          } else {
            composedDimension[dimensionId].push('-');
          }
        });
      });
  
      composedDimIds.forEach(dimensionId => {
        if (!structure.data('properties').composedDimension) {
          structure.data('properties').composedDimension = {};
        }
  
        if (!composedDimension[dimensionId] || composedDimension[dimensionId].length === 0) {
          composedDimension[dimensionId] = [];
        }
  
        structure.data('properties').composedDimension[dimensionId] = this.counter(composedDimension[dimensionId]);
      });

      structure.addClass('layers');
    });

    const containers = nodes.filter(
      node => node.data('labels')?.includes('Container') && !node.data('labels')?.includes('Structure')
    );

    const sortedContainers = this.sortContainersByDepth(containers)

    sortedContainers.forEach(container => {
      const contains = container.outgoers().filter(e => e.isEdge() && e.data('label') === 'contains');
      const classes = contains.targets().filter(t => t.data('labels')?.includes('Structure'));
      const subContainers = contains.targets().filter(t => t.data('labels')?.includes('Container'));
  
      const composedDimension: Record<string, any[]> = {};
  
      dimensionIds.forEach(dimensionId => {
        if (!container.data('properties').composedDimension) {
          container.data('properties').composedDimension = {};
        }
        if (!composedDimension[dimensionId]) composedDimension[dimensionId] = [];
  
        const layerCounters = classes.map(c => {
          const fromComposed = c.data('properties')?.composedDimension?.[dimensionId];
          if (fromComposed) {
            // return this.counterToPercentage(fromComposed);
            return fromComposed;
          }
          const fromSimple = c.data('properties')?.dimension?.[dimensionId] || [];
          // return this.counterToPercentage(this.counter(fromSimple));
          return this.counter(fromSimple);
        });
  
        composedDimension[dimensionId].push(...layerCounters);
  
        subContainers.forEach(subContainer => {
          const subData = subContainer.data('properties')?.composedDimension?.[dimensionId];
          if (subData) {
            // composedDimension[dimensionId].push(this.counterToPercentage(subData));
            composedDimension[dimensionId].push(subData);
          }
        });
      });
  
      dimensionIds.forEach(dimensionId => {
        container.data('properties').composedDimension[dimensionId] = this.mergeCounters(composedDimension[dimensionId]);
      });
  
      container.addClass('layers');
      if (showStructure && containerFocus == ""){
        container.addClass('package')
      }
    });   
  }

  private static counter = (arr) => arr.reduce((acc, val) => {
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});

  // private static counterToPercentage(counter: Record<string, number>) {
  //     const total = Object.values(counter).reduce((sum, count) => sum + count, 0);
  //     const result: Record<string, number> = {};
  //     for (const key in counter) {
  //         result[key] = total ? counter[key] / total : 0;
  //     }
  //     return result;
  // }

  private static mergeCounters = (counters) => {
    return counters.reduce((acc, counter) => {
      Object.entries(counter).forEach(([key, val]) => {
        acc[key] = (acc[key] || 0) + val;
      });
      return acc;
    }, {});
  };

  private static sortContainersByDepth(containers) {
    const depths = new Map<String, number>();

    const getDepth = (node) => {
      if (depths.has(node.id())) return depths.get(node.id())!;

      const incomingContainers = node.incomers('edge[label = "contains"]').sources()
        .filter(n => n.data('labels')?.includes('Container') && !n.data('labels')?.includes('Structure'));

      const parentDepths = incomingContainers.map(parent => getDepth(parent));
      const depth = parentDepths.length > 0 ? Math.max(...parentDepths) + 1 : 0;

      depths.set(node.id(), depth);
      return depth;
    };

    containers.forEach(container => getDepth(container));

    return containers.sort((a, b) => depths.get(b.id())! - depths.get(a.id())!).toArray();
  }
}

export class DepthEnricher {
  public static enrich(cy: cytoscape.Core): {
    depthData: { id: string; depth: number; labels: string[] }[];
    containerOrder: string[];
    maxDepth: number;
    containerIds: string[];
  } {
    const roots = getRoots(cy)

    const visited = new Set<string>();
    const depthData: { id: string; depth: number; labels: string[] }[] = [];
    const containerOrder: string[] = [];
    const containerIds: string[]=[];
    let maxDepth = 0;

    const assignDepth = (node: cytoscape.NodeSingular, depth: number) => {
      if (
        !node ||
        visited.has(node.id()) ||
        !(nodeHasLabels(node, ['Structure']) || nodeHasLabels(node, ['Container']))
      ) return;

      visited.add(node.id());

      const properties = node.data('properties') || {};
      properties.depth = depth;
      node.data('properties', properties);

      const labels = node.data('labels') || [];
      depthData.push({ id: node.id(), depth, labels });

      if (depth > maxDepth) maxDepth = depth

      const isPureContainer = labels.includes("Container") && !labels.includes("Structure");
      if (isPureContainer) {
        containerOrder.push(getNodeName(node));
        containerIds.push(node.id())
      }

      node.children().forEach(child => assignDepth(child, depth + 1));
    };

    roots.forEach(root => assignDepth(root, 1));

    return { depthData, containerOrder, maxDepth, containerIds };
  }
}