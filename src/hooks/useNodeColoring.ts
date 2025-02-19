import { useEffect, useState } from 'react';
import { stereoTypesColors, stereoTypesBorder } from '../utils/constants';

const generateColor = (index, total) => {
  const hue = (index * (360 / total)) % 360;
  return `hsl(${hue}, 80%, 80%)`;
};

const useNodeColoring = (cyInstance, coloring, features) => {
  const [featureColors, setFeatureColors] = useState({});

  useEffect(() => {
    if (!cyInstance) return;
    console.log("coloring:", coloring)

    if (coloring == "role stereotypes") {
      cyInstance.nodes().forEach((node) => {
        const roleStereotypes = node._private.data.properties?.roleStereotype;
  
        node.style({
          'background-color': stereoTypesColors[roleStereotypes]? stereoTypesColors[roleStereotypes]: stereoTypesColors['-'],
          'border-width': 3,
          'border-color': stereoTypesBorder[roleStereotypes]? stereoTypesBorder[roleStereotypes] : stereoTypesBorder['-'],
        });
      });
    }  else if (coloring == "none") {
      const hasColoredNodes = cyInstance.nodes().some(node => node.style('background-color') !== stereoTypesColors['-']);

      if (hasColoredNodes) {
        cyInstance.nodes().forEach((node) => {
          node.style({
            'background-color': stereoTypesColors['-'],
            "border-width": "3",
            "border-color": stereoTypesBorder['-']
          });
        });
      }
    } else if (coloring === "features" && Array.isArray(features) && features.length > 0) {
      let newFeatureColors = {};
      cyInstance.nodes().forEach((node) => {
        node.style({
          'background-color': stereoTypesColors['-'],
          "border-width": "3",
          "border-color": stereoTypesBorder['-']
        });
      });
      features.forEach((feature, index) => {
        const featureName = feature.data.properties?.simpleName || feature.data.id;
        const color = generateColor(index, features.length);
        newFeatureColors[featureName] = color;

        const featureMembers = feature.data.properties?.feature_members || [];
        featureMembers.forEach(memberId => {
          const memberNode = cyInstance.nodes(`[id="${memberId}"]`);
          if (memberNode) {
            memberNode.style({
              'background-color': color,
              'border-width': 2,
              'border-color': '#5E5E5E',
            });
          }
        });
      });

      setFeatureColors(newFeatureColors);
    }

    cyInstance.nodes().forEach((node) => {
      if (node.isParent()) {
        node.style({
          'background-color': '#EEEEEE',
          'border-width': 2,
          'border-color': '#9E9E9E',
        });
      }
    });

  }, [coloring, cyInstance, features]);

  return { featureColors };
};

export default useNodeColoring;