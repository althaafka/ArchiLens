import cytoscape from "cytoscape";
import { counter, counterToPercentage, mergeCounters } from "../utils/utils";
import { detailedNodesLabel } from "../constants/constants";
import { getNodeLabels, nodeHasLabels } from "../utils/nodeUtils"
import { getEdgeLabel, edgeHasLabel } from "../utils/edgeUtils"
import { getEdgesByLabel, getNodesByLabel } from "../utils/graphUtils";

export default class HeadlessProcessor {
    private cy: cytoscape.Core;
    private showStructure: boolean;

    constructor(cy: cytoscape.Core) {
        this.cy = cy;
    }
    
    public process(showStructure): any {
        this.showStructure = showStructure;
    
        this.flattenParentChild();
        this.processDimension();
        this.processMetric();
        this.groupLayers();
        const analyticAspect = this.collectAnalyticAspect()
        // console.log("ANALYTIC ASPECT:", analyticAspect)
        if (this.showStructure) {
            this.handleParentChild();
        } else {
            this.hideStructure();
        }
        this.liftEdges();
        this.cleanUp();
        return analyticAspect;
    }

    private collectAnalyticAspect(): any {
        let deletedElements
        const nodes = this.cy.nodes()
        const edges = this.cy.edges()

        const dimension = getNodesByLabel(nodes, 'Dimension')
        const category = getNodesByLabel(nodes, 'Category')
        const metric = getNodesByLabel(nodes, 'Metric')
    
        deletedElements = {
            dimension: dimension.map(node => node.data()), 
            category: category.map(node => node.data()),
            metric: metric.map(node => node.data()),
            composedDimension: Array.from(
                new Set(
                    getEdgesByLabel(edges, 'composes')
                        .filter(cEdge => {
                            const categoryId = cEdge.data('target');
                            const implementsEdges = edges.filter(edge => edge.data('label') === "implements" && edge.data('target') === categoryId);
                            return implementsEdges.some(iEdge => {
                                const sourceNode = this.cy.getElementById(iEdge.data('source'));
                                return sourceNode.data('labels').includes("Scripts") || sourceNode.data('labels').includes("Operation");
                            });
                        })
                    .map(cEdge => cEdge.data('source'))
                )
            )
        };
    
        this.cy.remove(dimension);
        this.cy.remove(category);
        this.cy.remove(metric);
        this.cy.edges().filter(edge =>
            ["composes", "implements", "succeeds", "measures"].includes(edge.data('label'))
        ).remove();
    
    
        return deletedElements;
    }

    private flattenParentChild(): void {
        console.log("FLATTEN PARENT-CHILD")
        this.cy.nodes().forEach(node => {
          if (node.parent().nonempty()) {
            node.move({ parent: null });
          }
        });
    }      

    private processDimension(): void {
      const edges = this.cy.edges();
      const nodes = this.cy.nodes();

      const composesEdges = getEdgesByLabel(edges, 'composes');
      const implementsEdges = getEdgesByLabel(edges, 'implements');
      const succeedsEdges = getEdgesByLabel(edges, 'succeeds');
      
      const dimensions = getNodesByLabel(nodes, 'Dimension');
      const categories = getNodesByLabel(nodes, 'Category');


        dimensions?.forEach( dim => {
            const composedCategories = composesEdges
                .filter(edge => edge.data('source') === dim.id())
                .map(edge => edge.data('target'));

            let orderedCategories = [];
            let startCategory
            composedCategories.forEach(cat => {
                const succeeds = succeedsEdges.filter(edge => edge.data('target') == cat);
                if (succeeds.length == 0) {
                    startCategory = cat;
                }
            });

            let nextCategory = succeedsEdges.filter(edge => edge.data('source') == startCategory);
            while (nextCategory.length > 0) {
                const nextCat = nextCategory[0].data('target');
                orderedCategories.push(nextCat);
                nextCategory = succeedsEdges.filter(edge => edge.data('source') == nextCat);
            }
            orderedCategories.unshift(startCategory);
            orderedCategories.push("-");
    
            dim.data('categories', orderedCategories);
        })

        categories.forEach(cat => {
            const categoriesMember = implementsEdges
                .filter(edge => edge.data('target') === cat.id())
                .map(edge => edge.data('source'));
            cat.data('members', categoriesMember);
        });

        implementsEdges.forEach(edge => {
            const node = this.cy.getElementById(edge.data('source'));
            if (!node.data('properties').dimension) {
                node.data('properties').dimension = {};
            }
    
            const dimId = composesEdges.filter(cEdge => edge.data('target') === cEdge.data('target'))[0].data('source');
    
            if (!node.data('properties').dimension[dimId]) {
                node.data('properties').dimension[dimId] = [];
            }
            node.data('properties').dimension[dimId].push(edge.data('target'));
        });

        const allNodes = this.cy.nodes().filter(n => {
            const id = n.id();
            const isExcluded = id === 'java.lang.String';
            const labels = n.data('labels') || [];
            return !isExcluded && !labels.includes('Container') && labels.includes('Structure');
          });
          
          dimensions.forEach(dim => {
            const dimId = dim.id();
            allNodes.forEach(node => {
              if (!node.data('properties').dimension) {
                node.data('properties').dimension = {};
              }
          
              const hasCategory = node.data('properties').dimension[dimId];
          
              if (!hasCategory || hasCategory.length === 0) {
                node.data('properties').dimension[dimId] = ["-"];
              }
            });
          });
          
    }

    private processMetric() {
      const edges = this.cy.edges();
      const nodes = this.cy.nodes();

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
                const node = this.cy.getElementById(nodeId)
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

    private groupLayers() {
      const edges = this.cy.edges();
      const nodes = this.cy.nodes();

        const structures = getNodesByLabel(nodes, 'Structure');
        const hasScripts = getEdgesByLabel(edges, 'hasScript');
        const composesEdges = getEdgesByLabel(edges, 'composes');
        const implementsEdges = getEdgesByLabel(edges, 'implements');
      
        const composedDimIds = composesEdges
          .filter(cEdge => {
            const categoryId = cEdge.data('target');
            const relatedImpls = edges.filter(edge =>
              edge.data('label') === 'implements' && edge.data('target') === categoryId
            );
            return relatedImpls.some(iEdge => {
              const sourceNode = this.cy.getElementById(iEdge.data('source'));
              return sourceNode.data('labels')?.includes('Scripts') || sourceNode.data('labels')?.includes('Operation');
            });
          })
          .map(cEdge => cEdge.data('source'));
      
        const simpleDimIds = getNodesByLabel(nodes, 'Dimension').map(node => node.id());
        const dimensionIds = Array.from(new Set([...composedDimIds, ...simpleDimIds]));
      
        // ───── Structure node processing ─────
        structures.forEach(structure => {
          const scriptEdges = hasScripts.filter(edge => edge.data('source') === structure.id());
          const scripts = scriptEdges.map(edge => this.cy.getElementById(edge.data('target')));
      
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
      
            structure.data('properties').composedDimension[dimensionId] = counter(composedDimension[dimensionId]);
          });
      
          structure.addClass('layers');
        });
      
        const containers = nodes.filter(
          node => node.data('labels')?.includes('Container') && !node.data('labels')?.includes('Structure')
        );
      
        containers.forEach(container => {
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
                return counterToPercentage(fromComposed);
              }
              const fromSimple = c.data('properties')?.dimension?.[dimensionId] || [];
              return counterToPercentage(counter(fromSimple));
            });
      
            composedDimension[dimensionId].push(...layerCounters);
      
            subContainers.forEach(subContainer => {
              const subData = subContainer.data('properties')?.composedDimension?.[dimensionId];
              if (subData) {
                composedDimension[dimensionId].push(counterToPercentage(subData));
              }
            });
          });
      
          dimensionIds.forEach(dimensionId => {
            container.data('properties').composedDimension[dimensionId] = mergeCounters(composedDimension[dimensionId]);
          });
      
          container.addClass('layers');
          if (this.showStructure){
            container.addClass('package')
          }
        });
      }

    private cleanUp(): void{
        const edges = this.cy.edges();
        const nodes = this.cy.nodes();
        nodes.filter((node) => 
            !(node.data().labels?.some(label => !Object.values(detailedNodesLabel).includes(label))
        )).remove();

        const nodeIds = new Set();
        nodes.forEach(node => { nodeIds.add(node.data('id')); });
        edges.filter(edge => {
            const source = edge.data('source');
            const target = edge.data('target');
            return !(nodeIds.has(source) && nodeIds.has(target));
        }).remove();
    }

    private liftEdges(): void {
      const edges = this.cy.edges();
      const nodes = this.cy.nodes();
        const newEdges = edges.filter(e =>
          e.source().data('labels')?.includes("Structure") &&
          e.target().data('labels')?.includes("Structure") &&
          e.target().parent() !== e.source().parent()
        ).reduce((acc, e: cytoscape.EdgeSingular) => {
            const srcParent = e.source().parent().first().id();
            const tgtParent = e.target().parent().first().id();
            const nodeSrc = nodes.filter(node => node.id() == srcParent);
            const nodeTgt = nodes.filter(node => node.id() == tgtParent);
            if (!srcParent || !tgtParent) return acc;
            if (nodeSrc.parent().first().id() == nodeTgt.id() || nodeSrc.id() == nodeTgt.parent().first().id()) return acc;
    
            const key = `${srcParent}-${e.data('label')}-${tgtParent}`;
            if (!acc[key]) {
                acc[key] = {
                    group: "edges",
                    data: {
                        source: srcParent,
                        target: tgtParent,
                        label: getEdgeLabel(e),
                        interaction: getEdgeLabel(e),
                        properties: { ...e.data('properties'), weight: 0, metaSrc: "lifting" }
                    }
                };
            }
            acc[key].data.properties.weight += 1;
            return acc;
        }, {})
      
        this.cy.add(Object.values(newEdges));
        this.cy.edges().filter(e => e.source().data('labels').includes("Structure") && e.target().data('labels').includes("Structure") && e.target().parent() !== e.source().parent()).remove();
    }

    private handleParentChild() {
        console.log("HANDLE PARENT-CHILD")
        const containsMap = new Map<string, string[]>();
      
        this.cy.edges().forEach(edge => {
          if (edgeHasLabel(edge, "contains")) {
            const sourceId = edge.data('source');
            const targetId = edge.data('target');
      
            if (containsMap.has(targetId)) {
              containsMap.get(targetId).push(sourceId);
            } else {
              containsMap.set(targetId, [sourceId]);
            }
          }
        });
      
        this.cy.nodes().forEach(node => {
          const nodeId = node.id();
          const parentCandidates = containsMap.get(nodeId) || [];
      
          let parentNode = null;
      
          for (let candidateId of parentCandidates) {
            let candidate = this.cy.getElementById(candidateId);
      
            // Traverse ke atas jika candidate adalah Structure
            while (candidate && nodeHasLabels(candidate, ["Structure"])) {
              const nextParentId = containsMap.get(candidate.id())?.[0];
              if (!nextParentId) {
                candidate = null;
                break;
              }
              candidate = this.cy.getElementById(nextParentId);
            }
      
            if (candidate && !nodeHasLabels(candidate, ["Structure"])) {
              parentNode = candidate;
              break;
            }
          }
      
          // Tetapkan parent jika ditemukan
          if (parentNode) {
            node.move({ parent: parentNode.id() });
          }
        });
      }
      
    private hideStructure(): void {
        console.log("HIDE STRUCTURE");
      
        const structureNodes = getNodesByLabel(this.cy.nodes(), "Structure");
      
        const connectedEdges = structureNodes.connectedEdges();
        const containsMap = this.buildContainsMap();

        const redirectedEdges: Record<string, any> = {};

        connectedEdges.forEach(edge => {
            const sourceNode = edge.source();
            const targetNode = edge.target();

            if (!nodeHasLabels(sourceNode, ["Structure"]) && !nodeHasLabels(targetNode, ["Structure"])) {
                return;
            }

            const sourceContainer = this.getContainerFromContainsMap(containsMap, sourceNode.id());
            const targetContainer = this.getContainerFromContainsMap(containsMap, targetNode.id());

            // Jika salah satu tidak ditemukan, skip
            console.log("----------")
            console.log(edge.data())
            console.log(sourceNode.id(), sourceContainer);
            console.log(targetNode.id(), targetContainer)
            if (!sourceContainer || !targetContainer || sourceContainer === targetContainer) return;

            const label = getEdgeLabel(edge)
            const key = `${sourceContainer}-${label}-${targetContainer}`;
            console.log("LABEL", label)

            if (!redirectedEdges[key]) {
                redirectedEdges[key] = {
                  group: "edges",
                  data: {
                    id: key,
                    source: sourceContainer,
                    target: targetContainer,
                    label: label,
                    properties: {
                      ...edge.data("properties"),
                      weight: 1,
                    }
                  }
                };
            } else {
                redirectedEdges[key].data.properties.weight += 1;
            }
        })


        // console.log("EDGES MAP:", edgesMap)
        console.log("CONTAINS MAP:", containsMap)
      
        // this.cy.remove(connectedEdges);
        this.cy.remove(structureNodes);
        this.cy.add(Object.values(redirectedEdges));
        console.log("REDIRECTED EDGE:", redirectedEdges)
    }

    private buildEdgeMap(edges: Set<any> | undefined): Map<string, Set<string>> {
        const map = new Map<string, Set<string>>();
        edges?.forEach(edge => {
            if (!map.has(edge.data('target'))) {
                map.set(edge.data('target'), new Set());
            }
            map.get(edge.data('target'))?.add(edge.data('source'));
        });
        return map;
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

    private buildContainsMap(): Map<string, Set<string>> {
        const map = new Map<string, Set<string>>();
        this.cy.edges().forEach(edge => {
          if (edge.data('label') !== 'contains') return;
      
          const source = edge.data('source');
          const target = edge.data('target');
      
          if (!map.has(target)) map.set(target, new Set());
          map.get(target)?.add(source);
        });
        return map;
      }
      
      private getContainerFromContainsMap(containsMap: Map<string, Set<string>>, structureId: string): string | null {
        const candidates = containsMap.get(structureId);
        if (!candidates) return null;
      
        for (const id of candidates) {
          const node = this.cy.getElementById(id);
          if (nodeHasLabels(node, ["Container"]) && !nodeHasLabels(node, ["Structure"])) {
            return id;
          }
        }
        return null;
      }
      
}