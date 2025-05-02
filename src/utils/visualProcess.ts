import { handleDimension } from "./handleDimension";
import { generateColorMap, addScratch, lightenHSLArray, lightenHSL } from "./utils";

export function visualProcess(cyInstance, dimension) {
    cyInstance.startBatch();
    initNodeColors(dimension);
    setNodeStyles(dimension, cyInstance);
    cyInstance.endBatch();
}

function initNodeColors(dimension){
    dimension.colorMap = {};
    dimension.dimension.forEach((dim) => {
        dimension.colorMap[dim.id] = generateColorMap(dim.categories);
    })
}

function setNodeStyles(dimension, cyInstance) {
    function setDefaultNodeStyle(){
        const nodes = cyInstance.nodes(node => node.data('labels').includes("Structure") && node.data('id') !== "java.lang.String");
        nodes.forEach((node) => {
            addScratch(node, 'style_none', {
                'background-color': 	'hsl(0, 0%, 95%)',
                'display': 'element',
                'background-fill': 'solid',
            })
        })
            const pureContainers = cyInstance.nodes(node => node.data('labels').includes("Container") && !node.data('labels').includes("Structure") && node.data('id') !== "java.lang.String");
        
            let maxDepth = 0;
            pureContainers.forEach((node) => {
                let depth = 0;
                let current = node;
        
                while (current.parent().length > 0) {
                    depth++;
                    current = current.parent()[0];
                }
        
                maxDepth = Math.max(maxDepth, depth);
            });
        
            console.log("Max Depth:", maxDepth);
        
            const minLightness = 80;
            const maxLightness = 92;
        
            pureContainers.forEach((node) => {
                let depth = 0;
                let current = node;
        
                while (current.parent().length > 0) {
                    depth++;
                    current = current.parent()[0];
                }
        
                const lightness = minLightness + ((maxLightness - minLightness) / maxDepth) * depth;
                const adjustedColor = `hsl(0, 0%, ${lightness}%)`;
        
                addScratch(node, 'style_none', {
                    'background-color': adjustedColor,
                    'border-color': 'hsl(0, 0%, 35%)',
                    'display': 'element',
                    'background-fill': 'solid',
                });
            });
        

    }

    setDefaultNodeStyle();

    dimension.dimension.forEach((dim) => {
        if (!dimension.composedDimension.includes(dim.id)){
            const nodes = cyInstance.nodes(n => n.hasClass('layers') && n.data('id') !== "java.lang.String")
            nodes.forEach((node) => {
                const categoryIds = node.data('properties').dimension;

                if (categoryIds && categoryIds[dim.id]){
                    const colors = categoryIds[dim.id].map((id) => dimension.colorMap[dim.id][id] || "#f2f2f2");
                    const positions = colors.map((_, index) => `${(index / (colors.length - 1)) * 100}%`);

                    // console.log("set node style", `style_${dim.id}`)
                    return addScratch(node, `style_${dim.id}`, categoryIds[dim.id].length === 1
                        ? {
                            'background-color': colors[0],
                            'border-color': '#5E5E5E',
                            'background-fill': 'solid',
                            'display': 'element',
                        }
                        : {
                        "background-fill": "linear-gradient",
                        "background-gradient-direction": "to-right",
                        "background-gradient-stop-colors": colors,
                        "background-gradient-stop-positions": positions,
                        "border-color": '#5E5E5E',
                        'display': 'element',
                    })

                } else {
                    return addScratch(node, `style_${dim.id}`, {
                        'display': 'element',
                        'background-color': dimension.colorMap[dim.id]["-"],
                        'border-color': '#5E5E5E',
                    })
                }
            })
        } else {
            const container = cyInstance.nodes(node => node.data('labels').includes("Container") && !node.data('labels').includes("Structure"));
            container.forEach((node) => {
                addScratch(node, `style_${dim.id}`, {
                    'background-color': 'hsl(0, 0%, 85%)',
                    'display': 'element',
                    'background-fill': 'solid',
                })
            })
            // console.log("composed dimension jk", dim.id);            
            const nodes = cyInstance.nodes(n => n.hasClass('layers') && n.data('id') !== "java.lang.String")
            nodes.forEach((node) => {
                const categoriesId = node.data('properties').composedDimension;
                if (categoriesId && categoriesId[dim.id]){
                    // console.log("node id", node.data('id'));
                    // console.log("categories keys", categoriesId[dim.id]);
                    if (Object.keys(categoriesId[dim.id]).length == 0) return;

                    // console.log("composed dimension", node.data('properties').composedDimension[dim.id]);

                    const composedDimension = node.data('properties').composedDimension[dim.id];
                    const totalWeight  = Object.keys(composedDimension).reduce((acc, cat) => acc + (Number(categoriesId[dim.id][cat]) || 0), 0);
                    const colors =  dim.categories.filter(cat => Object.keys(composedDimension).includes(cat)).flatMap((cat) => [dimension.colorMap[dim.id][cat], dimension.colorMap[dim.id][cat]]);

                    let cumulativePercentage = 0;
                    const positions = dim.categories
                        .filter(cat => Object.keys(composedDimension).includes(cat))
                        .flatMap((cat) => {
                            const weight = Number(categoriesId[dim.id]?.[cat]) || 0;
                            const percentage = (weight / totalWeight) * 100;
                            const startPercentage = cumulativePercentage;
                            cumulativePercentage += percentage;
                            if (cumulativePercentage > 100) cumulativePercentage = 100;
                            if (100 - cumulativePercentage < 0.00001) cumulativePercentage = 100;
                            const endPercentage = cumulativePercentage;
                            return [`${startPercentage}%`, `${endPercentage}%`];
                        });


                    // console.log("totalWeight", totalWeight);
                    // console.log("colors", colors);
                    // console.log("position", positions);

                    const isPureContainer = node.data('labels').includes("Container") && !node.data('labels').includes("Structure")

                    return addScratch(node, `style_${dim.id}`, Object.keys(categoriesId[dim.id]).length == 1
                        ? {
                            'background-color': isPureContainer? lightenHSL(colors[0], 15) :colors[0],
                            'border-color': '#5E5E5E',
                            'display': 'element',
                            "background-fill": 'solid'
                        }
                        : {
                            "background-fill": "linear-gradient",
                            "background-gradient-direction": isPureContainer? 'to-bottom-right': "to-right",
                            "background-gradient-stop-colors": isPureContainer? lightenHSLArray(colors) : colors,
                            "background-gradient-stop-positions": positions,
                            "border-color": '#5E5E5E',
                            'display': 'element',
                        })
                }
            })

        }
    })

}
