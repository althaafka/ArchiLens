import { useState, useEffect } from 'react'
import { edgesLabel } from '../../utils/constants';
import useNodeColoring from '../../hooks/useNodeColoring';
import ColoringLegend from '../ColoringLegend';
import FeaturesColoringLegend from '../FeaturesColoringLegend';
import Layout from './Layout';
import FileUpload from './FileUpload'
import ShowPrimitives from './ShowPrimitives'

const Menu = ({
  cyInstance,
  setGraph,
  features
}) => {
  const coloringTypes = ["none", "role stereotypes", "features"];

  const [selectedEdges, setSelectedEdges] = useState(() => {
    return Object.values(edgesLabel).reduce((acc, edge) => {
      edge != "calls"? acc[edge] = false: acc[edge] = true;
      return acc;
    }, {});
  });
  const [coloring, setColoring] = useState("none")

  // Nodes Coloring
  const { featureColors } = useNodeColoring(cyInstance, coloring, features);

  // Filter Edges
  const handleEdgeFilterChange = (event) => {
    const { name, checked } = event.target;
    setSelectedEdges((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  useEffect(() => {
    if (!cyInstance) return;

    cyInstance.edges().forEach((edge) => {
      const edgeType = edge._private.data.labels || edge._private.data.label

      edge.style({
        display: selectedEdges[edgeType] ? "element" : "none",
      });
    });
  }, [selectedEdges, cyInstance]);

  return (
    <div className="menu-bar">
      <h1>ArchiLens</h1>
      <hr />
      <FileUpload setGraph={setGraph}/>
      <hr />
      <Layout cyInstance={cyInstance}/>
      <hr />
      <h2>Nodes</h2>
      <ShowPrimitives cyInstance={cyInstance}/>
      <h3>Coloring</h3>
      <select value={coloring} onChange={(e) => setColoring(e.target.value)}>
        {coloringTypes.map((coloring) => (
          <option key={coloring} value={coloring}>{coloring}</option>
        ))}
      </select>
      {coloring === "role stereotypes" && <ColoringLegend />}
      {coloring === "features" && <FeaturesColoringLegend featureColors={featureColors} />}
      <hr />
      <h2>Relationships</h2>
      <ul>
        {Object.values(edgesLabel).map((type) => (
          <li key={type}>
            <label>
              <input
                type="checkbox"
                name={type}
                checked={selectedEdges[type]}
                onChange={handleEdgeFilterChange}
              />
              {type}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Menu;
