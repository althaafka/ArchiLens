import { useState, useEffect } from 'react'
import { edgesLabel } from '../utils/constants';
import useNodeColoring from '../hooks/useNodeColoring';

const Menu = ({
  cyInstance,
  setGraph
}) => {
  const layoutTypes = ["grid", "cola"];
  const coloringTypes = ["none", "role stereotypes"];

  const [layout, setLayout] = useState("grid");
  const [showPrimitives, setShowPrimitives] = useState(false);
  const [selectedEdges, setSelectedEdges] = useState(() => {
    return Object.values(edgesLabel).reduce((acc, edge) => {
      edge != "calls"? acc[edge] = false: acc[edge] = true;
      return acc;
    }, {});
  });
  const [coloring, setColoring] = useState("none")


  // File upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result as string)
        setGraph(jsonData);
      } catch (error) {
        console.error('Error parsing JSON file:', error);
      }
    };
    reader.readAsText(file);
  };

  // Layout
  const relayout = () => {
    if (!cyInstance) return;
    cyInstance.layout({
       name: layout === "cola" ? "cola" : "grid",
       animated: false,
       avoidOverlap: true,
       nodeSpacing: 10,
    }).run();
  };

  // Show Primitives
  useEffect(() => {
    if (!cyInstance) return;

    cyInstance.nodes().forEach((node) => {
      const nodeLabels = node.data("labels") || [];
      const shouldHide =
        nodeLabels.includes("Primitive") || node.data("id") === "java.lang.String";

      if (shouldHide) {
        node.style({
          display: showPrimitives ? "element" : "none",
        });
      }
    });
  }, [showPrimitives, cyInstance]);


  // Nodes Coloring
  useNodeColoring(cyInstance, coloring);

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
      <input type="file" accept=".json" onChange={handleFileUpload} />
      <hr />
      <h2>Layout</h2>
      <select value={layout} onChange={(e) => setLayout(e.target.value)}>
        {layoutTypes.map((layout) => (
          <option key={layout} value={layout}>{layout === "grid" ? "default" : layout}</option>
        ))}
      </select>
      <button onClick={() => relayout()}>Relayout</button>
      <hr />
      <h2>Nodes</h2>
      <label>
        <input
          type="checkbox"
          checked={showPrimitives}
          onChange={(e) => setShowPrimitives(e.target.checked)}
        />
        Show Primitive
      </label>
      <h3>Coloring</h3>
      <select value={coloring} onChange={(e) => setColoring(e.target.value)}>
        {coloringTypes.map((coloring) => (
          <option key={coloring} value={coloring}>{coloring}</option>
        ))}
      </select>
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
