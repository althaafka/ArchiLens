import { useState, useEffect } from 'react'
import { edgesLabel } from '../../constants/constants';
import { saveAs } from 'file-saver';
import Layout from './Layout';
import FileUpload from './FileUpload'
import ShowPrimitives from './ShowPrimitives'
import NodeColoring from './NodeColoring/NodeColoring';
import {
  Switch, Box, Typography, Button, Divider, FormGroup, FormControlLabel, Checkbox
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { Tabs, Tab } from '@mui/material';
import GraphManager from '../../core/GraphManager';
import { EdgeLifter } from '../../core/Headless/EdgeLifter';
import { IconButton, Tooltip } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { isSemanticGridEl } from '../../utils/graphUtils';
import NodeFilterTree from './NodeFilterTree';
import ContainerSelector from './ContainerSelector';
import { edgeGradientColors } from '../../constants/colorConstants';


const Menu = ({
  cyInstance,
  setGraph,
  analyticAspect,
  showStructure,
  setShowStructure
}) => {

  const [tabIndex, setTabIndex] = useState(0);
  const handleTabChange = (_event, newValue) => setTabIndex(newValue);
  const [liftDepth, setLiftDepth] = useState(analyticAspect?.depth?.maxDepth);

  const [currentLayout, setCurrentLayout] = useState('grid');
  const [hidePackages, setHidePackages] = useState(false);

  const handleLayoutChange = (layout) => setCurrentLayout(layout);
  const handleHidePackagesChange = (hide) => setHidePackages(hide);
  const handleLiftChange = (liftDepth) => setLiftDepth(liftDepth);

  // const forceDisableLift = currentLayout === 'semanticGrid' && hidePackages;

  const [selectedEdges, setSelectedEdges] = useState(() => {
    return Object.values(edgesLabel).reduce((acc, edge) => {
      edge != "calls"? acc[edge] = false: acc[edge] = true;
      return acc;
    }, {});
  });

  const [coloring, setColoring] = useState("none");

  const minDepth = 2;
  const maxDepth = analyticAspect?.depth?.maxDepth ?? 2;
  // console.log("MAX DEPTH CHECK:",  maxDepth)


  const handleLift = () => {
    if (!cyInstance) return;
    const lifter = new EdgeLifter(cyInstance)
    cyInstance.batch(() => {
      lifter.liftEdges(liftDepth);
      // console.log("LIFT", liftDepth)
      filterEdgeDisplay();
    });
    
    setLiftDepth(prev => Math.max(minDepth, Number(prev) - 1));
  };

  const handleUnlift = () => {
    if (!cyInstance) return;
    const lifter = new EdgeLifter(cyInstance)

    cyInstance.batch(() => {
      lifter.unliftEdges(liftDepth+1);
      // console.log("UNLIFT", liftDepth+1)
      filterEdgeDisplay();
    });

    setLiftDepth(prev => Math.min(maxDepth, Number(prev) + 1));
  };

  // Filter Edges
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

      <Box hidden={tabIndex !== 0} className="space-y-2 p-4">
        <FileUpload setGraph={setGraph}/>
        <Box display="flex" justifyContent="space-between" alignItems="center" className="my-2">
          <Typography variant="subtitle1">Structure Visibility</Typography>
          <Switch
            checked={showStructure}
            onChange={(e) => setShowStructure(e.target.checked)}
          />
        </Box>
        <ContainerSelector cyInstance={cyInstance} analyticAspect={analyticAspect} filterEdgeDisplay={filterEdgeDisplay}></ContainerSelector>
        <Layout 
          cyInstance={cyInstance} 
          analyticAspect={analyticAspect} 
          showStructure={showStructure} 
          onLayoutChange={handleLayoutChange}
          onHidePackagesChange={handleHidePackagesChange}
          onLiftEdgeChange={handleLiftChange}
          />
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={downloadGraphAsPng}
          startIcon={<DownloadIcon />}
        >
          Download Graph as PNG
        </Button>
      </Box>

      <Box hidden={tabIndex !== 1} className="space-y-2 p-4">
        <ShowPrimitives cyInstance={cyInstance} />
        <NodeColoring 
          cyInstance={cyInstance} 
          analyticAspect={analyticAspect} 
          coloring={coloring}
          setColoring={setColoring}
        />
          <Typography variant="subtitle1">Node Visibility</Typography>
  <NodeFilterTree cyInstance={cyInstance} />
      </Box>

      <Box hidden={tabIndex !== 2} className="space-y-2 p-4">
        {/* Opsi Lift/Unlift by Depth */}
        <Typography variant="subtitle1">Lift Edges</Typography>
        <Box display="flex" gap={1} alignItems="center" className="flex justify-center">
          <IconButton
              onClick={handleLift}
              color="primary"
              disabled={liftDepth <= minDepth || (currentLayout === 'semanticGrid' && hidePackages) || !showStructure}
              size="large"
            >
            <ArrowUpwardIcon />
          </IconButton>
          <Typography variant="body1" sx={{ minWidth: 32, textAlign: 'center' }}>
            {liftDepth}
          </Typography>
          <IconButton
            onClick={handleUnlift}
            color="primary"
            disabled={liftDepth >= maxDepth || (currentLayout === 'semanticGrid' && hidePackages) || !showStructure}
            size="large"
          >
            <ArrowDownwardIcon />
          </IconButton>
        </Box>
        <Typography variant="subtitle1">Filter Edges</Typography>
<FormGroup>
  {Object.values(edgesLabel).map((type) => {
    const colors = edgeGradientColors[type] || ['#ccc', '#eee']; // fallback
    return (
      <Box key={type} display="flex" alignItems="center" mb={0.5}>
        <Checkbox
          name={type}
          checked={selectedEdges[type]}
          onChange={handleEdgeFilterChange}
          size="small"
          sx={{ padding: 0.5, marginRight: 1 }}
        />
        <Box
          sx={{
            width: 50,
            height: 15,
            borderRadius: '4px',
            background: `linear-gradient(to right, ${colors[0]}, ${colors[1]})`,
            border: '1px solid #ccc',
            marginRight: 1,
            flexShrink: 0,
          }}
        />
        <Typography variant="body2">{type}</Typography>
      </Box>
    );
  })}
</FormGroup>


      </Box>
    </Box>
  );
};

export default Menu;
