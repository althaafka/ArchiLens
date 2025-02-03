import { useRef, useState, useEffect } from 'react'

import './App.css'
import cytoscape from "cytoscape";
import cytoscapeCola from "cytoscape-cola";
import style from "./cy-style.json"

// import data from "./assets/jhotdraw_detailedinput.json";
// import data from "./assets/jpacman.json";
// import data from "./assets/jhotdraw_abstract.json";
import rawGraph from "./assets/strategy_detailedinput.json";

import { setupGraph } from "./setupGraph";

cytoscape.use(cytoscapeCola);

function App() {
  const cyRef = useRef(null);
  const [graph, setGraph] = useState(rawGraph)
  const [cyInstance, setCyInstance] = useState(null)
  const [showPrimitives, setShowPrimitives] = useState(false)

  const edgeTypes = [
    "contains", "calls", "constructs", "holds", "accepts", "specializes", "returns", "accesses"
  ];



  useEffect(() => {
    if (!cyRef.current) return;

    const cy = cytoscape({
      container: cyRef.current,
      elements: setupGraph(graph.elements),
      style: style
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

    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (!file) return;
  
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          setGraph(jsonData);
        } catch (error) {
          console.error('Error parsing JSON file:', error);
        }
      };
      reader.readAsText(file);
    };
  
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
        <label>
          <input
              type="checkbox"
              checked={showPrimitives}
              onChange={handleShowPrimitives}
          />
          Show Primitive
        </label>
        <hr></hr>
        <h2>Relationships</h2>
        <ul>
          {edgeTypes.map((type) => (
            <li key={type}>
              <label>
                <input
                  type="checkbox"
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
