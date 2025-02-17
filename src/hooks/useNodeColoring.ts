import { useEffect } from 'react';
import { stereoTypesColors, stereoTypesBorder } from '../utils/constants';


const useNodeColoring = (cyInstance, coloring) => {
  useEffect(() => {
    if (!cyInstance) return;
    console.log(coloring)

    if (coloring == "role stereotypes") {
      cyInstance.nodes().forEach((node) => {
        const roleStereotypes = node._private.data.properties?.roleStereotype;
  
        if (roleStereotypes && stereoTypesColors[roleStereotypes]) {
          node.style({
            'background-color': stereoTypesColors[roleStereotypes],
            'border-width': 3,
            'border-color': stereoTypesBorder[roleStereotypes],
          });
        }
      });
    }  else if (coloring == "none") {
      const hasColoredNodes = cyInstance.nodes().some(node => node.style('background-color') !== stereoTypesColors['-']);

      if (hasColoredNodes) {
        cyInstance.nodes().forEach((node) => {
          node.style({
            'background-color': stereoTypesColors['-'],
            "border-width": "3",
            "border-color": "#5E5E5E"
          });
        });
      }
    }
  }, [coloring, cyInstance]);
};

export default useNodeColoring;