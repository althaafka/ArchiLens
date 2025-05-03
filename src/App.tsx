import { useRef, useState, useEffect } from 'react';
import './App.css';
import cytoscape from "cytoscape";
import cytoscapeCola from "cytoscape-cola";
import { Stylesheet } from "cytoscape";
import styleData from "./cy-style.json";
import rawGraph from "./assets/jpacman-v3-dim.json";
import { setupGraph } from "./utils/setupGraph";
import Menu from './components/Menu/Menu';
import { headlessProcess } from "./utils/headlessProcess";
import { visualProcess } from "./utils/visualProcess";
const style: Stylesheet[] = styleData as Stylesheet[];

cytoscape.use(cytoscapeCola);

function App() {
  const cyRef = useRef<HTMLDivElement>(null);
  const [graph, setGraph] = useState(rawGraph);
  const [cyInstance, setCyInstance] = useState(null);
  const [hcyInstance, setHCyInstance] = useState(null);
  const [analysisData, setAnalysisData] = useState({});
  const [colorMap, setColorMap] = useState(new Map<string, Object>())

  // Init cytoscape
  useEffect(() => {
    if (!cyRef.current) return;
    console.log("Initializing Cytoscape...");

    const processedGraph = setupGraph(graph.elements);

    const hcy = cytoscape({
      headless: true,
      elements: processedGraph.graph,
      ready: (event) => {
        const hcyInstance = event.cy;
        setHCyInstance(hcyInstance);
        const analysisData= headlessProcess(hcyInstance);
        console.log("Analysis Data:", analysisData)
        setAnalysisData(analysisData);
        
        console.log("elements:", hcyInstance.json().elements);

        if (cyRef.current) {
          const cy = cytoscape({
            container: cyRef.current,
            elements: hcyInstance.json().elements,
            style: style,
            wheelSensitivity: 0.25,
            ready: (cyEvent) => {
              const cyInstance = cyEvent.cy;
              setCyInstance(cyInstance);
              visualProcess(cyInstance, analysisData);
            },
          });
          cy.on('tap', 'node', (event) => {
            console.log("Node clicked:", event.target.data());
          });
  
          cy.on('tap', 'edge', (event) => {
            console.log("Edge clicked:", event.target.data());
          });
        }
      }
    })

    return () => {
      hcy.destroy();
    };
  }, [graph]);

  // useEffect(() => {
  //   if (!cyInstance) return;
  //   visualProcess(cyInstance, dimensionsData);
  // }, [cyInstance]);

  return (
    <>
    <div className="app-container">
      {/* Cytoscape */}
      <div className="canvas">
        <div ref={cyRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {/* Menu Bar */}
      <Menu cyInstance={cyInstance} setGraph={setGraph} analysisData={analysisData} />
    </div>
    </>
  );
}

export default App;