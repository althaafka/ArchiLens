import { useEffect, useState } from 'react';
import ColoringLegend from './ColoringLegend';
import { getScratch } from '../../../utils/utils'
import { nodeColoringTypes } from '../../../constants/nodeColoringData';

const NodeColoring = ({ cyInstance, colorMap }) => {
  const [coloring, setColoring] = useState("none");

  useEffect(() => {
    if (!cyInstance) return;
    
    cyInstance.nodes().forEach((node) => {
      const styleKey = `style_${coloring}`;
      const style = getScratch(node, styleKey)
      if (style) {
        node.style(style);
      }
    });
  }, [coloring, cyInstance]);

  return (
    <div>
      <h3>Node Coloring</h3>
      <select value={coloring} onChange={(e) => setColoring(e.target.value)}>
        {Object.entries(nodeColoringTypes).map(([key, value]) => (
          <option key={key} value={key}>{value}</option>
        ))}
      </select>
      {coloring !== "none" && <ColoringLegend coloring={coloring} colorMap={colorMap} />}
    </div>
  );
};

export default NodeColoring;