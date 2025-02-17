import { useEffect } from 'react';

const stereoTypesColors = {
  "Controller": "#FFE8E2",
  "Information Holder": "#FFF2DD",
  "Interfacer": "#E7F5E9",
  "User Interfacer": "#E7F5E9",
  "Internal Interfacer": "#E7F5E9",
  "Eksternal Interfacer": "#E7F5E9",
  "Service Provider": "#E2EFFC",
  "Structurer": "#EFE6FF",
  "Coordinator": "#FFD9DF",
};

const borderColors = {
  "Controller": "#FFC7B8",
  "Information Holder": "#FEBA4C",
  "Interfacer": "#81C880",
  "User Interfacer": "#B2E2C7",
  "Internal Interfacer": "#B2E2C7",
  "Eksternal Interfacer": "#B2E2C7",
  "Service Provider": "#5EAAED",
  "Structurer": "#D9B2FF",
  "Coordinator": "#FFB2C7",
};

const useNodeColoring = (cyInstance, coloring) => {
  useEffect(() => {
    if (!cyInstance || coloring !== "role stereotypes") return;

    cyInstance.nodes().forEach((node) => {
      const roleStereotypes = node._private.data.properties?.roleStereotype;

      if (roleStereotypes && stereoTypesColors[roleStereotypes]) {
        node.style({
          'background-color': stereoTypesColors[roleStereotypes],
          'border-width': 3,
          'border-color': borderColors[roleStereotypes],
        });
      }
    });
  }, [coloring, cyInstance]);
};

export default useNodeColoring;