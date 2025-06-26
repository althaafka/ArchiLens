import { useRef, useState, useEffect } from 'react';
import './App.css';
import cytoscape from "cytoscape";
import cytoscapeCola from "cytoscape-cola";
import { StylesheetCSS } from "cytoscape";
import styleData from "./cy-style.json";
// import rawGraph from "./assets/jpacman-v3-dim.json";
import rawGraph from "./assets/jpacman-v4-metric.json";

// import rawGraph from "./assets/JHotDraw-5.1-output-v3c 3 (1).json";
import Menu from './components/Menu/Menu';
const style: StylesheetCSS[] = styleData as unknown as StylesheetCSS[];
import HeadlessProcessor from './core/HeadlessProcessor';
import VisualProcessor from './core/VisualProcessor';
import ElementDrawer from "./components/Menu/Drawer";
import GraphManager from './core/GraphManager';
import GraphPreProcessor from './core/GraphPreprocessor';
import { isSemanticGridEl } from './utils/graphUtils';

import { Box, CssBaseline } from '@mui/material';

cytoscape.use(cytoscapeCola);

function App() {
  const cyRef = useRef<HTMLDivElement>(null);
  const [graph, setGraph] = useState(rawGraph);
  const [cyInstance, setCyInstance] = useState(null);
  const [_, setHCyInstance] = useState(null);
  const [analyticAspect, setAnalyticAspect] = useState({});
  const [showStructure, setShowStructure] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);

  // Init cytoscape
  useEffect(() => {
    if (!cyRef.current) return;
    console.log("Initializing Cytoscape...");

    const processedGraph = new GraphPreProcessor(graph.elements).initialize();

    const hcy = cytoscape({
      headless: true,
      elements: processedGraph,
      ready: (event) => {
        const hcyInstance = event.cy;
        setHCyInstance(hcyInstance);
        const processor = new HeadlessProcessor(hcyInstance);
        const analysisData = processor.process(showStructure);

        setAnalyticAspect(analysisData);
        
        console.log("elements:", hcyInstance.json().elements);

        const manager = GraphManager.getInstance()
        manager.setAnalyticAspect(analysisData);
        console.log(analysisData)

        if (cyRef.current) {
          const cy = cytoscape({
            container: cyRef.current,
            elements: (hcyInstance.json() as { elements: any }).elements,
            style: style,
            wheelSensitivity: 0.25,
            ready: (cyEvent) => {
              const cyInstance = cyEvent.cy;
              setCyInstance(cyInstance);
              const visualizer = new VisualProcessor(cyInstance, manager.getAnalyticAspect());
              visualizer.process();
            },
          } as any);
  
          cy.on('tap', 'node', (event) => {
            console.log("Node clicked:", event.target.data());
            if (isSemanticGridEl(event.target)) return;
            setSelectedElement(event.target.data());
            setDrawerOpen(true);
          });
  
          cy.on('tap', 'edge', (event) => {
            console.log("Edge clicked:", event.target.data());
            if (isSemanticGridEl(event.target)) return;
            setSelectedElement(event.target.data());
            setDrawerOpen(true);
          });

          cy.on("tap", (e) => {
            if (e.target === cy) {
              setDrawerOpen(false);
            }
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
          className="bg-stone-50 shadow-lg"
          overflow="auto"
        >
          <Menu
            cyInstance={cyInstance}
            setGraph={setGraph}
            analyticAspect={analyticAspect}
            showStructure={showStructure}
            setShowStructure={setShowStructure}
          />
        </Box>

        {/* Cytoscape Canvas */}
        <Box flex={1} overflow="hidden">
          <div ref={cyRef} className="w-full h-full" />
        </Box>

        <ElementDrawer
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      elementData={selectedElement}
    />
      </Box>
    </>
  );

}

export default App;