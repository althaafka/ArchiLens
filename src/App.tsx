import { useRef, useState, useEffect } from 'react';
import './App.css';

// Cytoscape and layout library
import cytoscape from "cytoscape";
import cytoscapeCola from "cytoscape-cola";
import cytoscapeKlay from 'cytoscape-klay';
import cytoscapeFcose from 'cytoscape-fcose';
import cytoscapeDagre from 'cytoscape-dagre';

import { StylesheetCSS } from "cytoscape";
import styleData from "./cy-style.json";
// import rawGraph from "./assets/jpacman-v4-metric.json";
import rawGraph from "./assets/fix/jpacman-test.json";
// import rawGraph from "./assets/fix/JHotDraw.json";

import Menu from './components/Menu';
import HeadlessProcessor from './core/HeadlessProcessor';
import VisualProcessor from './core/VisualProcessor';
import ElementDrawer from "./components/Drawer";
import GraphPreProcessor from './core/GraphPreprocessor';
import { isSemanticGridEl } from './utils/graphUtils';

import { Box, CssBaseline } from '@mui/material';
import { IconButton, Stack, Tooltip } from "@mui/material";
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';

cytoscape.use(cytoscapeCola);
cytoscape.use(cytoscapeKlay);
cytoscape.use(cytoscapeFcose);
cytoscape.use(cytoscapeDagre);

const style: StylesheetCSS[] = styleData as unknown as StylesheetCSS[];

function App() {
  const cyRef = useRef<HTMLDivElement>(null);
  const [graph, setGraph] = useState(rawGraph);
  const [cyInstance, setCyInstance] = useState(null);
  const [_, setHCyInstance] = useState(null);
  const [analyticAspect, setAnalyticAspect] = useState({});
  const [showStructure, setShowStructure] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [containerFocus, setContainerFocus] = useState("");

  useEffect(() => {
    if (!cyRef.current) return;

    const clonedGraph = JSON.parse(JSON.stringify(graph.elements));
    const processedGraph = GraphPreProcessor.initialize(clonedGraph);

    const hcy = cytoscape({
      headless: true,
      elements: processedGraph,
      ready: (event) => {
        const hcyInstance = event.cy;
        setHCyInstance(hcyInstance);
        const analysisData = HeadlessProcessor.process(hcyInstance, showStructure, containerFocus);
        console.log("analytic aspect: ", analysisData)
        
        setAnalyticAspect(analysisData);

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

          cy.layout({
            name: 'klay'
          }).run();
  
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
  }, [graph, showStructure, containerFocus]);

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
            containerFocus={containerFocus}
            setContainerFocus={setContainerFocus}
          />
        </Box>

        {/* Cytoscape Canvas */}
        <Box flex={1} overflow="hidden">
          <div ref={cyRef} className="w-full h-full" />
{/* Tombol Fit dengan Icon */}
<Stack direction="row" spacing={1} position="absolute" bottom={16} right={16}>
  <Tooltip title="Fit Graph" arrow>
    <IconButton
      onClick={() => {
        if (cyInstance) {
          cyInstance.fit(undefined, 30); // padding 30
        }
      }}
      color="primary"
      sx={{
        bgcolor: 'white',
        border: '1px solid #ccc',
        boxShadow: 2,
        '&:hover': {
          bgcolor: 'grey.100',
        },
      }}
    >
      <ZoomOutMapIcon />
    </IconButton>
  </Tooltip>
</Stack>

        </Box>

        <ElementDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          elementData={selectedElement}
          analyticAspect={analyticAspect}
        />
      </Box>
    </>
  );

}

export default App;