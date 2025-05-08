import { useRef, useState, useEffect } from 'react';
import './App.css';
import cytoscape from "cytoscape";
import cytoscapeCola from "cytoscape-cola";
import { StylesheetCSS } from "cytoscape";
import styleData from "./cy-style.json";
// import rawGraph from "./assets/jpacman-v3-dim.json";
import rawGraph from "./assets/jpacman-v4-metric.json";
import { setupGraph } from "./utils/setupGraph";
import Menu from './components/Menu/Menu';
import { headlessProcess } from "./utils/headlessProcess";
import { visualProcess } from "./utils/visualProcess";
const style: StylesheetCSS[] = styleData as unknown as StylesheetCSS[];

cytoscape.use(cytoscapeCola);

function App() {
  const cyRef = useRef<HTMLDivElement>(null);
  const [graph, setGraph] = useState(rawGraph);
  const [cyInstance, setCyInstance] = useState(null);
  const [_, setHCyInstance] = useState(null);
  const [analysisData, setAnalysisData] = useState({});

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
            elements: (hcyInstance.json() as { elements: any }).elements,
            style: style,
            wheelSensitivity: 0.25,
            ready: (cyEvent) => {
              const cyInstance = cyEvent.cy;
              setCyInstance(cyInstance);
              visualProcess(cyInstance, analysisData);
            },
          } as any);
  
          cy.on('tap', 'node', (event) => {
            console.log("Node clicked:", event.target.data());
          });
  
          cy.on('tap', 'edge', (event) => {
            console.log("Edge clicked:", event.target.data());
          });
        }
      }
    } as any)

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