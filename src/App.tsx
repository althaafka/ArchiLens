import { useRef, useState, useEffect } from 'react';
import './App.css';
import cytoscape from "cytoscape";
import cytoscapeCola from "cytoscape-cola";
import { Stylesheet } from "cytoscape";
import styleData from "./cy-style.json";
import rawGraph from "./assets/jhotdraw-trc-sum-rs.json";
import { setupGraph } from "./utils/setupGraph";
import Menu from './components/menu';

const style: Stylesheet[] = styleData as Stylesheet[];

cytoscape.use(cytoscapeCola);

function App() {
  const cyRef = useRef<HTMLDivElement>(null);
  const [graph, setGraph] = useState(rawGraph);
  const [cyInstance, setCyInstance] = useState(null);

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

  return (
    <div className="app-container">
      {/* Cytoscape */}
      <div className="canvas">
        <div ref={cyRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {/* Menu Bar */}
      <Menu cyInstance={cyInstance} setGraph={setGraph} />
    </div>
  );
}

export default App;
