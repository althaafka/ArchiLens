import { useRef, useState, useEffect } from 'react'

import './App.css'
import cytoscape from "cytoscape";
import cytoscapeCola from "cytoscape-cola";
import { Stylesheet } from "cytoscape";
import styleData from "./cy-style.json";

const style: Stylesheet[] = styleData as Stylesheet[];

import rawGraph from "./assets/jhotdraw-trc-sum-rs.json";
// import rawGraph from "./assets/jpacman.json";
// import rawGraph from "./assets/jhotdraw_abstract.json";
// import rawGraph from "./assets/strategy_detailedinput.json";

import { setupGraph } from "./utils/setupGraph";
import { edgesLabel } from './utils/constants';
import useNodeColoring from './hooks/useNodeColoring';

cytoscape.use(cytoscapeCola);

function App() {
  const cyRef = useRef(null);
  const [graph, setGraph] = useState(rawGraph)
  const [cyInstance, setCyInstance] = useState(null)
  const [showPrimitives, setShowPrimitives] = useState(false)
  const [layout, setLayout] = useState("grid")
  const [coloring, setColoring] = useState("none")
  const [selectedEdges, setSelectedEdges] = useState(() => {
    return Object.values(edgesLabel).reduce((acc, edge) => {
      edge != "calls"? acc[edge] = false: acc[edge] = true;
      return acc;
    }, {});
  });

  const layoutTypes = [
    "grid", "cola"
  ]

  const coloringTypes = [
    "none", "role stereotypes"
  ]

  // Init cytoscape
  useEffect(() => {
    if (!cyRef.current) return;

    const cy = cytoscape({
      container: cyRef.current,
      elements: setupGraph(graph.elements),
      style: style,
      pixelRatio: 1
    });

    setCyInstance(cy);

    return () => {
      cy.destroy();
    };
  }, [graph]);

    // Function to toggle primitives visibility
    const handleShowPrimitives = (e) => {
      console.log("toggle primitives")
      setShowPrimitives(e.target.checked);
    };
  
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


    // Function to upload file
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

    // Function to filter edge types
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

  

    // Function to relayout
    const handleLayoutChange = (event) => {
      setLayout(event.target.value);
    };
  
    const applyLayout = () => {
      if (!cyInstance) return;
      cyInstance.layout({
         name: layout === "cola" ? "cola" : "grid",
         animated: false,
         avoidOverlap: true,
         nodeSpacing: 10,
      }).run();
    };

    // Function to change nodes coloring
    const handleColoringChange = (event) => {
      setColoring(event.target.value)
    }

    useNodeColoring(cyInstance, coloring);
  
  
  return (
    <div className="app-container">
      {/* Cytoscape */}
      <div className="canvas">
        <div ref={cyRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {/* Menu Bar */}
      <div className="menu-bar">
        <h1>ArchiLens</h1>
        <hr></hr>
        <input type="file" accept=".json" onChange={handleFileUpload} />
        <hr></hr>
        <h2>Layout</h2>
        <select value={layout} onChange={handleLayoutChange}>
          {layoutTypes.map((layout) => (
            <option value={layout}>{layout == "grid"? "default": layout}</option>
          ))}
        </select>
        <button onClick={applyLayout}>Relayout</button>
        <hr></hr>
        <h2>Nodes</h2>
        <label>
          <input
              type="checkbox"
              checked={showPrimitives}
              onChange={handleShowPrimitives}
          />
          Show Primitive
        </label>
        <h3>Coloring</h3>
        <select value={coloring} onChange={handleColoringChange}>
          {coloringTypes.map((coloring) => (
            <option value={coloring}>{coloring}</option>
          ))}
        </select>
        <hr></hr>
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
    </div>
  )
}

export default App
