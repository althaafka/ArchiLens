import { detailedNodesLabel } from "../constants/constants";
import { counter, counterToPercentage, mergeCounters, addScratch } from "./utils";

export function headlessProcess(cyInstance: any) {
    cyInstance.startBatch();
    processDimension(cyInstance);
    processMetric(cyInstance);
    groupLayers(cyInstance);
    const analysisAspect = deleteAnalysisAspect(cyInstance);
    removeInvalidNodes(cyInstance);
    removeInvalidEdges(cyInstance);
    liftEdges(cyInstance);
    cyInstance.endBatch();
    return analysisAspect;
}

function removeInvalidNodes(cyInstance: any) {
    cyInstance.nodes().filter((node) => 
        !(node.data().labels?.some(label => !Object.values(detailedNodesLabel).includes(label))
    )).remove();
}

function removeInvalidEdges(cyInstance: any) {
    const nodeIds = new Set();
    cyInstance.nodes().forEach(node => nodeIds.add(node.data('id')));
    cyInstance.edges().filter(edge => {
        const source = edge.data('source');
        const target = edge.data('target');
        return !(nodeIds.has(source) && nodeIds.has(target));
    }).remove();
}

function groupLayers(cyInstance: any) {
    const structures = cyInstance.nodes(node => node.data('labels').includes("Structure"))
    const hasScripts = cyInstance.edges(edge => edge.data('label').includes("hasScript"))
    const composesEdges = cyInstance.edges(edge => edge.data('label') === "composes")
    const implementsEdges = cyInstance.edges(edge => edge.data('label') === "implements")
    const dimensionIds = Array.from(
        new Set(
            composesEdges
                .filter(cEdge => {
                    const categoryId = cEdge.data('target');
                    const implementsEdges = cyInstance.edges(edge => edge.data('label') === "implements" && edge.data('target') === categoryId);
                    return implementsEdges.some(iEdge => {
                        const sourceNode = cyInstance.getElementById(iEdge.data('source'));
                        return sourceNode.data('labels').includes("Scripts") || sourceNode.data('labels').includes("Operation");
                    });
                })
                .map(cEdge => cEdge.data('source'))
        )
    );

    structures.forEach(structure => {
        const scriptEdges = hasScripts.filter(edge => edge.data('source') === structure.id())
        const scripts = scriptEdges.map(edge => cyInstance.getElementById(edge.data('target')))
        
        const composedDimension = [];
        scripts.forEach((script, i) => {

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

    const containers = cyInstance.nodes(node => node.data('labels').includes("Container") && !node.data('labels').includes("Structure"));

    containers.forEach(container => {
        const contains = container.outgoers(e => e.data('label') === "contains" && e.target().data('labels').includes('Structure'));
		const classes = contains.targets();
        const composedDimension = [];
        dimensionIds.forEach((dimensionId: any) => {
            if (!container.data('properties').composedDimension) {
                container.data('properties').composedDimension = {};
            }

            if (!composedDimension[dimensionId] || composedDimension[dimensionId].length === 0) {
                composedDimension[dimensionId] = [];
            }
            const layerCounters = classes.map(c => counterToPercentage(c.data('properties.composedDimension')[dimensionId]));
            composedDimension[dimensionId] = layerCounters;

        })

        dimensionIds.forEach((dimensionId: any) => {
            container.data('properties').composedDimension[dimensionId] = mergeCounters(composedDimension[dimensionId]);
        })
		container.addClass('layers');
    })

}

const liftEdges = (pCy) => {

    const newEdges = pCy.edges(e => 
        e.source().data('labels').includes("Structure") && 
        e.target().data('labels').includes("Structure") && 
        e.target().parent() !== e.source().parent()
    ).reduce((acc, e) => {
        const srcParent = e.source().parent().id();
        const tgtParent = e.target().parent().id();
        const nodeSrc = pCy.nodes(node => node.id() == srcParent);
        const nodeTgt = pCy.nodes(node => node.id() == tgtParent);
        if (!srcParent || !tgtParent) return acc;
        if (nodeSrc.parent().id() == nodeTgt.id() || nodeSrc.id() == nodeTgt.parent().id()) return acc;

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
    }, {});

    pCy.add(Object.values(newEdges));
    pCy.edges(e => e.source().data('labels').includes("Structure") && e.target().data('labels').includes("Structure") && e.target().parent() !== e.source().parent()).remove();
};


function processDimension(cyInstance: any) {
    const composesEdges = cyInstance.edges(edge => edge.data('label') === "composes");
    console.log("tes: ", composesEdges.length)
    const implementsEdges = cyInstance.edges(edge => edge.data('label') === "implements");
    const succeedsEdges = cyInstance.edges(edge => edge.data('label') === "succeeds");
    const dimensions = cyInstance.nodes(node => node.data('labels').includes("Dimension"));
    const categories = cyInstance.nodes(node => node.data('labels').includes("Category"));

    dimensions?.forEach(dim => {
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
    });

    categories.forEach(cat => {
        const categoriesMember = implementsEdges
            .filter(edge => edge.data('target') === cat.id())
            .map(edge => edge.data('source'));
        cat.data('members', categoriesMember);
    });

    implementsEdges.forEach(edge => {
        const node = cyInstance.getElementById(edge.data('source'));
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

function processMetric(cyInstance: any) {
    const measuresEdges = cyInstance.edges(edge => edge.data('label') == "measures");
    const metrics = cyInstance.nodes(node => node.data('labels').includes("Metric"));

    metrics?.forEach(metric => {
        const measuredNode = measuresEdges
            .filter(edge => edge.data('target') === metric.id())
            .map(edge => [edge.data('source'), edge.data('properties').value]);

        metric.data("properties").members = measuredNode;
        // console.log("metric:", metric.id());
        // console.log(measuredNode)
        let maxVal = -Infinity;
        let minVal = Infinity;
        measuredNode.forEach(([nodeId, value]) => {
            const node = cyInstance.getElementById(nodeId)
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

function deleteAnalysisAspect(cyInstance) {
    let deletedElements

    // const nodesToRemove = cyInstance.nodes(node =>
    //     node.data('labels').includes("Dimension") || node.data('labels').includes("Category")
    // );

    const dimension = cyInstance.nodes(node => node.data('labels').includes("Dimension"))
    const category = cyInstance.nodes(node => node.data('labels').includes("Category"))
    const metric = cyInstance.nodes(node => node.data('labels').includes("Metric"))

    deletedElements = {
        dimension: dimension.map(node => node.data()), 
        category: category.map(node => node.data()),
        metric: metric.map(node => node.data()),
        composedDimension: Array.from(
            new Set(
                cyInstance.edges(edge => edge.data('label') === "composes")
                    .filter(cEdge => {
                        const categoryId = cEdge.data('target');
                        const implementsEdges = cyInstance.edges(edge => edge.data('label') === "implements" && edge.data('target') === categoryId);
                        return implementsEdges.some(iEdge => {
                            const sourceNode = cyInstance.getElementById(iEdge.data('source'));
                            return sourceNode.data('labels').includes("Scripts") || sourceNode.data('labels').includes("Operation");
                        });
                    })
                .map(cEdge => cEdge.data('source'))
            )
        )
    };

    cyInstance.remove(dimension);
    cyInstance.remove(category);
    cyInstance.remove(metric);
    cyInstance.edges(edge =>
        ["composes", "implements", "succeeds", "measures"].includes(edge.data('label'))
    ).remove();

    // console.log("Deleted elements:", deletedElements);

    return deletedElements;
}