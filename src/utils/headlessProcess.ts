import { detailedNodesLabel } from "../constants/constants";
import { counter, counterToPercentage, mergeCounters } from "./utils";

export function headlessProcess(cyInstance: any) {
    cyInstance.startBatch();
    groupLayers(cyInstance);
    removeInvalidNodes(cyInstance);
    removeInvalidEdges(cyInstance);
    // liftEdges(cyInstance);
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
    console.log("edges:", cyInstance.edges().data());
}

function groupLayers(cyInstance: any) {
    const structures = cyInstance.nodes(node => node.data('labels').includes("Structure"))
    const hasScripts = cyInstance.edges(edge => edge.data('label').includes("hasScript"))
    console.log("structure:", structures)
    console.log("hasScriptX:", hasScripts)

    structures.forEach(structure => {
        const scriptEdges = hasScripts.filter(edge => edge.data('source') === structure.id())
        const scripts = scriptEdges.map(edge => cyInstance.getElementById(edge.data('target')))
        
        console.log("scripts for structure " + structure.id() + ":", scripts)

        const layers = []
        scripts.forEach((script, i) => {
            const layer = cyInstance.edges(edge => edge.data('source') === script.id() && edge.data('label') === "implements")
            if (layer.length < 1) console.log("script.id():", script.id())
            layers.push(layer.data('target') || '-')
            script.data('properties').layers = counter(layers)
        })

        structure.data('properties').layers = counter(layers)
        structure.addClass("layers")
    })

    const containers = cyInstance.nodes(node => node.data('labels').includes("Container") && !node.data('labels').includes("Structure"));
    console.log("containers:", containers)
    containers.forEach(container => {
        const contains = container.outgoers(e => e.data('label') === "contains" && e.target().data('labels').includes('Structure'));
		const classes = contains.targets();
		const layerCounters = classes.map(c => counterToPercentage(c.data('properties.layers')));
		container.data('properties')['layers'] = mergeCounters(...layerCounters);
		container.addClass('layers');
    })
    // console.log("containers fix:", containers)

    // console.log("has contains edges 4:", cyInstance.edges(e => e.data('label') === "contains"))

}