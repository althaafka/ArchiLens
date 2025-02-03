import { useRef, useState, useEffect } from 'react'

import './App.css'
import cytoscape from "cytoscape";
import cytoscapeCola from "cytoscape-cola";
import style from "./cy-style.json"

// import data from "./assets/jhotdraw_detailedinput.json";
// import data from "./assets/jpacman.json";
import data from "./assets/jhotdraw_abstract.json";


import { setupGraph } from "./setupGraph";

cytoscape.use(cytoscapeCola);

function App() {
  const cyRef = useRef(null);
  const [graph, setGraph] = useState(data)

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

    return () => {
      cy.destroy();
    };
  }, []);

  return (
    <div className="app-container">
      {/* Cytoscape */}
      <div className="canvas">
        <div ref={cyRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {/* Menu Bar */}
      <div className="menu-bar">
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
