import { useRef, useState, useEffect } from 'react';
import './App.css';
import cytoscape from "cytoscape";
import cytoscapeCola from "cytoscape-cola";
import { StylesheetCSS } from "cytoscape";
import styleData from "./cy-style.json";
// import rawGraph from "./assets/jpacman-v3-dim.json";
import rawGraph from "./assets/jpacman-v4-metric.json";
import Menu from './components/Menu/Menu';
const style: StylesheetCSS[] = styleData as unknown as StylesheetCSS[];
import GraphSetup from './core/GraphSetup'
import HeadlessProcessor from './core/HeadlessProcessor';
import VisualProcessor from './core/VisualProcessor';

import { Box, CssBaseline } from '@mui/material';

cytoscape.use(cytoscapeCola);

function App() {
  const cyRef = useRef<HTMLDivElement>(null);
  const [graph, setGraph] = useState(rawGraph);
  const [cyInstance, setCyInstance] = useState(null);
  const [_, setHCyInstance] = useState(null);
  const [analysisData, setAnalysisData] = useState({});
  const [showStructure, setShowStructure] = useState(true);

  // Init cytoscape
  useEffect(() => {
    if (!cyRef.current) return;
    console.log("Initializing Cytoscape...");

    const processedGraph = new GraphSetup(graph.elements).initialize();

    const hcy = cytoscape({
      headless: true,
      elements: processedGraph,
      ready: (event) => {
        const hcyInstance = event.cy;
        setHCyInstance(hcyInstance);
        const processor = new HeadlessProcessor(hcyInstance);
        const analysisData = processor.process(showStructure);

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

              const visualizer = new VisualProcessor(cyInstance, analysisData);
              visualizer.process();
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
  }, [graph, showStructure]);

  return (
    <>
      <CssBaseline />
      <Box display="flex" height="100vh" overflow="hidden">
        {/* Sidebar */}
        <Box
          width={280}
          className="bg-white shadow-lg"
          overflow="auto"
        >
          <Menu
            cyInstance={cyInstance}
            setGraph={setGraph}
            analysisData={analysisData}
            showStructure={showStructure}
            setShowStructure={setShowStructure}
          />
        </Box>

        {/* Cytoscape Canvas */}
        <Box flex={1} overflow="hidden">
          <div ref={cyRef} className="w-full h-full" />
        </Box>
      </Box>
    </>
  );

}

export default App;