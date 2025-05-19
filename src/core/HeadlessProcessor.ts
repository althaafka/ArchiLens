import cytoscape from "cytoscape";
import { counter, counterToPercentage, mergeCounters } from "../utils/utils";
import { detailedNodesLabel } from "../constants/constants";

export default class HeadlessProcessor {
    private cy: cytoscape.Core;
    private edges: cytoscape.EdgeCollection;
    private nodes: cytoscape.NodeCollection;

    constructor(cy: cytoscape.Core) {
        this.cy = cy;
    }

    public process(): any {
        this.edges = this.cy.edges();
        this.nodes = this.cy.nodes();

        this.processDimension();
        this.processMetric();
        this.groupLayers();
        const analyticAspect = this.collectAnalyticAspect()
        this.cleanUp();
        this.liftEdges();
        return analyticAspect;
    }

    private collectAnalyticAspect(): any {
        let deletedElements

        const dimension = this.getNodesByLabel('Dimension')
        const category = this.getNodesByLabel('Category')
        const metric = this.getNodesByLabel('Metric')
    
        deletedElements = {
            dimension: dimension.map(node => node.data()), 
            category: category.map(node => node.data()),
            metric: metric.map(node => node.data()),
            composedDimension: Array.from(
                new Set(
                    this.getEdgesByLabel('composes')
                        .filter(cEdge => {
                            const categoryId = cEdge.data('target');
                            const implementsEdges = this.edges.filter(edge => edge.data('label') === "implements" && edge.data('target') === categoryId);
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
        this.edges.filter(edge =>
            ["composes", "implements", "succeeds", "measures"].includes(edge.data('label'))
        ).remove();
    
    
        return deletedElements;
    }

    private processDimension(): void {
        const composesEdges = this.getEdgesByLabel('composes');
        const implementsEdges = this.getEdgesByLabel('implements');
        const succeedsEdges = this.getEdgesByLabel('succeeds');

        const dimensions = this.getNodesByLabel('Dimension');
        const categories = this.getNodesByLabel('Category');


        dimensions?.forEach( dim => {
            const composedCategories = composesEdges
                .filter(edge => edge.data('source') === dim.id())
                .map(edge => edge.data('target'));

            // Order Category
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
    }

    private processMetric() {
        const measuresEdges = this.getEdgesByLabel('measures');
        const metrics = this.getNodesByLabel('Metric');

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

    private groupLayers(){
        const structures = this.getNodesByLabel('Structure');
        const hasScripts = this.getEdgesByLabel('hasScript');
        const composesEdges =this.getEdgesByLabel('composes');
        const implementsEdges = this.getEdgesByLabel('implements')

        const dimensionIds = Array.from(
            new Set(
                composesEdges
                    .filter(cEdge => {
                        const categoryId = cEdge.data('target');
                        const implementsEdges = this.edges.filter(edge => edge.data('label') === "implements" && edge.data('target') === categoryId);
                        return implementsEdges.some(iEdge => {
                            const sourceNode = this.cy.getElementById(iEdge.data('source'));
                            return sourceNode.data('labels').includes("Scripts") || sourceNode.data('labels').includes("Operation");
                        });
                    })
                    .map(cEdge => cEdge.data('source'))
            )
        );

        console.log("dimensionId:", dimensionIds)

        structures.forEach(structure => {
            const scriptEdges = hasScripts.filter(edge => edge.data('source') === structure.id())
            const scripts = scriptEdges.map(edge => this.cy.getElementById(edge.data('target')))
            
            const composedDimension = [];
            scripts.forEach((script, _) => {
    
                dimensionIds.forEach((dimensionId: string) => {
                    const impementsEdge = implementsEdges.filter(edge => edge.data('source') === script.id() && edge.data('target').split(":")[0] === dimensionId.split(":")[1]);
                    if (!composedDimension[dimensionId]) {
                        composedDimension[dimensionId] = [];
                    }
                    if (impementsEdge.length != 0) {
                        composedDimension[dimensionId].push(impementsEdge[0].data('target'));
                    } else {
                        composedDimension[dimensionId].push("-");
                    }
                })
            })
            
            dimensionIds.forEach((dimensionId: any) => {
    
                if (!structure.data('properties').composedDimension) {
                    structure.data('properties').composedDimension = {};
                }
            
                if (!composedDimension[dimensionId] || composedDimension[dimensionId].length === 0) {
                    composedDimension[dimensionId] = [];
                }
    
                structure.data('properties').composedDimension[dimensionId] = counter(composedDimension[dimensionId]);
            })  
            structure.addClass("layers")
        })

        const containers = this.nodes.filter(node => node.data('labels').includes("Container") && !node.data('labels').includes("Structure"));
        
        containers.forEach(container => {
            console.log("tes", container.id())
            const contains = container.outgoers().filter(e => e.isEdge() && e.data('label') === "contains");
            const classes = contains.targets().filter(t => t.data('labels').includes('Structure'));
            const subContainers = contains.targets().filter(t => t.data('labels').includes('Container'));

            console.log("classes", classes)
            console.log("subContainers", subContainers)

            const composedDimension = [];
            dimensionIds.forEach((dimensionId: string) => {
                if (!container.data('properties').composedDimension) {
                    container.data('properties').composedDimension = {};
                }
    
                if (!composedDimension[dimensionId] || composedDimension[dimensionId].length === 0) {
                    composedDimension[dimensionId] = [];
                }

                // Hitung composedDimension dari struktur
                const layerCounters = classes.map(c => counterToPercentage(c.data('properties.composedDimension')[dimensionId]));
                composedDimension[dimensionId] = layerCounters;

                // Tambahkan composedDimension dari sub-containers
                subContainers.forEach(subContainer => {
                    const subComposedDimension = subContainer.data('properties').composedDimension?.[dimensionId];
                    if (subComposedDimension) {
                        composedDimension[dimensionId].push(counterToPercentage(subComposedDimension));
                    }
                });
            });
    
            dimensionIds.forEach((dimensionId: any) => {
                container.data('properties').composedDimension[dimensionId] = mergeCounters(composedDimension[dimensionId]);
            });
            container.addClass('layers');
        });
    }

    private cleanUp(): void{
        this.nodes.filter((node) => 
            !(node.data().labels?.some(label => !Object.values(detailedNodesLabel).includes(label))
        )).remove();

        const nodeIds = new Set();
        this.nodes.forEach(node => { nodeIds.add(node.data('id')); });
        this.edges.filter(edge => {
            const source = edge.data('source');
            const target = edge.data('target');
            return !(nodeIds.has(source) && nodeIds.has(target));
        }).remove();
    }

    private liftEdges(): void {
        const newEdges = this.edges.filter(e =>
          e.source().data('labels')?.includes("Structure") &&
          e.target().data('labels')?.includes("Structure") &&
          e.source().parent().nonempty() &&
          e.target().parent().nonempty() &&
          e.target().parent() !== e.source().parent()
        ).reduce((acc, e: cytoscape.EdgeSingular) => {
            const srcParent = e.source().parent().first().id();
            const tgtParent = e.target().parent().first().id();
            const nodeSrc = this.nodes.filter(node => node.id() == srcParent);
            const nodeTgt = this.nodes.filter(node => node.id() == tgtParent);

            if (!srcParent || !tgtParent) return acc;
            if (nodeSrc.parent().first().id() == nodeTgt.id() || nodeSrc.id() == nodeTgt.parent().first().id()) return acc;
    
            const key = `${srcParent}-${e.data('label')}-${tgtParent}`;
            if (!acc[key]) {
                acc[key] = {
                    group: "edges",
                    data: {
                        source: srcParent,
                        target: tgtParent,
                        label: e.data('label'),
                        interaction: e.data('label'),
                        properties: { ...e.data('properties'), weight: 0, metaSrc: "lifting" }
                    }
                };
            }
            acc[key].data.properties.weight += 1;
            return acc;
        }, {})
      
        this.cy.add(Object.values(newEdges));
        this.edges.filter(e => e.source().data('labels').includes("Structure") && e.target().data('labels').includes("Structure") && e.target().parent() !== e.source().parent()).remove();
    }
      
      
    private getNodesByLabel(label: string): cytoscape.NodeCollection {
        return this.nodes.filter(node => this.nodeHasLabel(node, label))
    }

    private nodeHasLabel(node: cytoscape.NodeSingular, label: string): boolean {
        return this.getNodeLabel(node)?.includes(label);
    }

    private getNodeLabel(node: cytoscape.NodeSingular) {
        return node.data('labels') || [node.data('label')]
    }

    private getEdgesByLabel(label: string): cytoscape.EdgeCollection {
        return this.edges.filter(edge => this.edgeHasLabel(edge, label));
    }

    private edgeHasLabel(edge: cytoscape.EdgeSingular, label: string): boolean{
        return this.getEdgeLabel(edge) === label;
    }

    private getEdgeLabel(edge: cytoscape.EdgeSingular) {
        return edge.data('label');
    }


}