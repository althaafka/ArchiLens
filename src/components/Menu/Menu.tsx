import { useState, useEffect } from 'react'
import { edgesLabel } from '../../constants/constants';
import { saveAs } from 'file-saver';
import Layout from './Layout';
import FileUpload from './FileUpload'
import ShowPrimitives from './ShowPrimitives'
import NodeColoring from './NodeColoring/NodeColoring';
import LevelManager from '../../core/LevelManager';

const Menu = ({
  cyInstance,
  setGraph,
  analysisData,
  showStructure,
  setShowStructure
}) => {

  const [selectedEdges, setSelectedEdges] = useState(() => {
    return Object.values(edgesLabel).reduce((acc, edge) => {
      edge != "calls"? acc[edge] = false: acc[edge] = true;
      return acc;
    }, {});
  });

  // const [showStructure, setShowStructure] = useState(true)
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

  const downloadGraphAsPng = () => {
    if (!cyInstance) return;
    const pngData = cyInstance.png({ full: true });
    const byteString = atob(pngData.split(',')[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([uint8Array], { type: 'image/png' });
    saveAs(blob, 'graph.png');
  };

  return (
    <div className="menu-bar">
      <h1>ArchiLens</h1>
      <hr />
      <FileUpload setGraph={setGraph}/>
      <hr />
      <Layout cyInstance={cyInstance} analysisData={analysisData} showStructure={showStructure}/>
      <hr />
      <button onClick={downloadGraphAsPng}>Download Graph as PNG</button>
      <hr />
      <h2>Nodes</h2>
      <ShowPrimitives cyInstance={cyInstance}/>
      <hr />
      <h2>Show Options</h2>
      <label>
        <input
          type="checkbox"
          checked={showStructure}
          onChange={(e) => setShowStructure(e.target.checked)}
        />
        Show Structure Nodes
      </label>
      <h3>Coloring</h3>
      <NodeColoring cyInstance={cyInstance} analysisData={analysisData}/>
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
