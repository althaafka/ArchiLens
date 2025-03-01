import { useRef, useState, useEffect } from 'react';
import './App.css';
import cytoscape from "cytoscape";
import cytoscapeCola from "cytoscape-cola";
import { Stylesheet } from "cytoscape";
import styleData from "./cy-style.json";
import rawGraph from "./assets/jhotdraw-features.json";
import { setupGraph } from "./utils/setupGraph";
import Menu from './components/Menu/Menu';

const style: Stylesheet[] = styleData as Stylesheet[];

cytoscape.use(cytoscapeCola);

function App() {
  const cyRef = useRef<HTMLDivElement>(null);
  const [graph, setGraph] = useState(rawGraph);
  const [cyInstance, setCyInstance] = useState(null);
  const [hcyInstance, setHcyInstance] = useState(null);
  const [features, setFeatures] = useState(null);

  // Init cytoscape
  useEffect(() => {
    if (!cyRef.current) return;

    const processedGraph = setupGraph(graph.elements);
    const hcy = cytoscape({
      headless: true,
      elements: processedGraph.graph,
      ready: (event) => {
        const hcyInstance = event.cy

        hcyInstance.startBatch();
        // Headless processing
        hcyInstance.endBatch();

        setHcyInstance(hcyInstance);
        setFeatures(processedGraph.feature);

        if (cyRef.current) {
          const cy = cytoscape({
            container: cyRef.current,
            elements: hcyInstance.json().elements,
            style: style,
            wheelSensitivity: 0.25,
            ready: (cyEvent) => {
              setCyInstance(cyEvent.cy);
              initNodeColoring()
            },
          });
        }
      }
    });
    
    return () => {
      hcy.destroy();
    };
  }, [graph]);

  useEffect(() => {
    if (!cyInstance) return;
  
    const handleClick = (event: cytoscape.EventObject) => {
      console.log("Clicked element:", event.target.data());
    };
  
    cyInstance.on("tap", "node", handleClick);
    cyInstance.on("tap", "edge", handleClick);
  
    return () => {
      cyInstance.off("tap", "node", handleClick);
      cyInstance.off("tap", "edge", handleClick);
    };
  }, [cyInstance]);

  function initNodeColoring() {

  }


  return (
    <div className="app-container">
      {/* Cytoscape */}
      <div className="canvas">
        <div ref={cyRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {/* Menu Bar */}
      <Menu cyInstance={cyInstance} setGraph={setGraph} features={features}/>
    </div>
  );
}

export default App;
