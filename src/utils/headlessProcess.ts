import { detailedNodesLabel } from "../constants/constants";
import { counter, counterToPercentage, mergeCounters } from "./utils";

export function headlessProcess(cyInstance: any) {
    cyInstance.startBatch();
    processDimension(cyInstance);
    groupLayers(cyInstance);
    deleteDimensionInformation(cyInstance);
    removeInvalidNodes(cyInstance);
    removeInvalidEdges(cyInstance);
    liftEdges(cyInstance);
    cyInstance.endBatch();
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

    console.log("dimensionIds", dimensionIds)

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
        
        if (structure.id() == "nl.tudelft.jpacman.sprite.ImageSprite"){
            console.log("composedDimension", composedDimension)
        }
        dimensionIds.forEach((dimensionId: any) => {
            console.log("dimension:", composedDimension[dimensionId])

            if (!structure.data('properties').composedDimension) {
                structure.data('properties').composedDimension = {};
            }
        
            if (!composedDimension[dimensionId] || composedDimension[dimensionId].length === 0) {
                composedDimension[dimensionId] = [];
            }

            console.log("ORDERED categories2:", cyInstance.nodes(node => node.id() == dimensionId).data('categories'))
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
            console.log("layerCounters", layerCounters)

        })
        console.log("composedDimension container:", composedDimension)
        dimensionIds.forEach((dimensionId: any) => {
            console.log("dimension:", composedDimension[dimensionId])
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
    const implementsEdges = cyInstance.edges(edge => edge.data('label') === "implements");
    const succeedsEdges = cyInstance.edges(edge => edge.data('label') === "succeeds");
    const dimensions = cyInstance.nodes(node => node.data('labels').includes("Dimension"));
    const categories = cyInstance.nodes(node => node.data('labels').includes("Category"));

    dimensions.forEach(dim => {
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

        console.log("orderedCategories", orderedCategories)
        dim.data('categories', orderedCategories);
    });

    categories.forEach(cat => {
        const categoriesMember = implementsEdges
            .filter(edge => edge.data('target') === cat.id())
            .map(edge => edge.data('source'));
        cat.data('members', categoriesMember);
    });

    implementsEdges.forEach(edge => {
        console.log("loop")
        const node = cyInstance.getElementById(edge.data('source'));

        if (!node.data('properties').dimension) {
            node.data('properties').dimension = [];
        }
        node.data('properties').dimension.push(edge.data('target'));
    });
}

function deleteDimensionInformation(cyInstance) {
    cyInstance.edges(edge => edge.data('label') === "composes").remove();
    cyInstance.edges(edge => edge.data('label') === "implements").remove();
    cyInstance.edges(edge => edge.data('label') === "succeeds").remove();
    cyInstance.nodes(node => node.data('labels').includes("Dimension")).remove();
    cyInstance.nodes(node => node.data('labels').includes("Category")).remove();
}