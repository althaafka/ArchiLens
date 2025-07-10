import { useState, useEffect } from 'react'
import { edgesLabel } from '../../constants/constants';
import { saveAs } from 'file-saver';
import {
  Box, Typography, Divider
} from '@mui/material';
import { Tabs, Tab } from '@mui/material';
import { EdgeLifter } from '../../core/Headless/EdgeLifter';
import { isSemanticGridEl } from '../../utils/graphUtils';


import TabGeneral from './Tabs/TabGeneral';
import TabNodes from './Tabs/TabNodes';
import TabEdges from './Tabs/TabEdges';

const Menu = ({
  cyInstance,
  setGraph,
  analyticAspect,
  showStructure,
  setShowStructure,
  containerFocus,
  setContainerFocus
}) => {

  const [tabIndex, setTabIndex] = useState(0);
  const [liftDepth, setLiftDepth] = useState(analyticAspect?.depth?.maxDepth);
  const [currentLayout, setCurrentLayout] = useState('grid');
  const [hidePackages, setHidePackages] = useState(false);
  const [categoriesVisibility, setCategoriesVisibility] = useState({});
  const [selectedEdges, setSelectedEdges] = useState(() => {
    return Object.values(edgesLabel).reduce((acc, edge) => {
      edge != "calls"? acc[edge] = false: acc[edge] = true;
      return acc;
    }, {});
  });
  const [coloring, setColoring] = useState("none");
  const [maxDepth, setMaxDepth] = useState(analyticAspect?.depth?.maxDepth ?? 2);

  
  
  const handleTabChange = (_event, newValue) => setTabIndex(newValue);
  const handleLayoutChange = (layout) => setCurrentLayout(layout);
  const handleHidePackagesChange = (hide) => setHidePackages(hide);
  const handleLiftChange = (liftDepth) => setLiftDepth(liftDepth);
  
  const minDepth = 2;
  
  const handleLift = () => {
    if (!cyInstance) return;
    const lifter = new EdgeLifter(cyInstance)
    cyInstance.batch(() => {
      lifter.liftEdges(liftDepth);
      filterEdgeDisplay();
    });
    
    setLiftDepth(prev => Math.max(minDepth, Number(prev) - 1));
  };
  
  const handleUnlift = () => {
    if (!cyInstance) return;
    const lifter = new EdgeLifter(cyInstance)
    
    cyInstance.batch(() => {
      lifter.unliftEdges(liftDepth+1);
      filterEdgeDisplay();
    });
    
    setLiftDepth(prev => Math.min(maxDepth, Number(prev) + 1));
  };
  
  const handleEdgeFilterChange = (event) => {
    const { name, checked } = event.target;
    setSelectedEdges((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };
  
  const filterEdgeDisplay = () => {
    if (!cyInstance) return;
    cyInstance.edges().forEach((edge) => {
      if (isSemanticGridEl(edge)) return;
      const edgeType = edge.data('label');
      edge.style({
        display: selectedEdges[edgeType] ? "element" : "none",
      });
    });
  };
  
  useEffect(() => {
    filterEdgeDisplay();
    setLiftDepth(analyticAspect?.depth?.maxDepth)
  }, [selectedEdges, cyInstance]);
  
  useEffect(() => {
    if (containerFocus == "") setLiftDepth(analyticAspect?.depth?.maxDepth)
    }, [containerFocus])
  
  useEffect(() => {
    setMaxDepth(analyticAspect?.depth?.maxDepth ?? 2);
  }, [cyInstance]);

  const downloadGraphAsPng = () => {
    if (!cyInstance) return;
    const pngData = cyInstance.png({ full: true });
    const byteString = atob(pngData.split(',')[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([uint8Array], { type: 'image/png' });
    saveAs(blob, 'graph.png');
  };

  return (
    <Box gap={1}>
      <Typography className="text-center p-3" variant="h6">ArchiLens</Typography>
      <Divider/>

      <Tabs 
        value={tabIndex} 
        onChange={handleTabChange} 
        variant="fullWidth"
        sx={{
          minHeight: 40,
          '& .MuiTab-root': {
            minHeight: 40,
            minWidth: 40,
            fontSize: '0.75rem',
            padding: '4px 8px',
            '&.Mui-selected': {
              fontWeight: 'bold',
            },
          },
        }}
      >
        <Tab label="General" />
        <Tab label="Nodes" />
        <Tab label="Edges" />
      </Tabs>


      <TabGeneral
        hidden={tabIndex !== 0}
        cyInstance={cyInstance}
        setGraph={setGraph}
        analyticAspect={analyticAspect}
        showStructure={showStructure}
        setShowStructure={setShowStructure}
        containerFocus={containerFocus}
        setContainerFocus={setContainerFocus}
        handleLayoutChange={handleLayoutChange}
        handleHidePackagesChange={handleHidePackagesChange}
        handleLiftChange={handleLiftChange}
        downloadGraphAsPng={downloadGraphAsPng}
        filterEdgeDisplay={filterEdgeDisplay}
      />

      <TabNodes
        hidden={tabIndex !== 1}
        cyInstance={cyInstance}
        analyticAspect={analyticAspect}
        coloring={coloring}
        setColoring={setColoring}
        categoriesVisibility={categoriesVisibility}
        setCategoriesVisibility={setCategoriesVisibility}
      />

      <TabEdges
        hidden={tabIndex !== 2}
        liftDepth={liftDepth}
        minDepth={minDepth}
        maxDepth={maxDepth}
        handleLift={handleLift}
        handleUnlift={handleUnlift}
        currentLayout={currentLayout}
        hidePackages={hidePackages}
        showStructure={showStructure}
        containerFocus={containerFocus}
        selectedEdges={selectedEdges}
        handleEdgeFilterChange={handleEdgeFilterChange}
      />
    </Box>
  );
};

export default Menu;
