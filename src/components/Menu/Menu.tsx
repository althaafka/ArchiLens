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


const Menu = ({
  cyInstance,
  setGraph,
  analysisData,
  showStructure,
  setShowStructure
}) => {

  const [tabIndex, setTabIndex] = useState(0);
  const handleTabChange = (_event, newValue) => setTabIndex(newValue);


  const [selectedEdges, setSelectedEdges] = useState(() => {
    return Object.values(edgesLabel).reduce((acc, edge) => {
      edge != "calls"? acc[edge] = false: acc[edge] = true;
      return acc;
    }, {});
  });

  // const [showStructure, setShowStructure] = useState(true)
  // Filter Edges
  const handleEdgeFilterChange = (event) => {
    const { name, checked } = event.target;
    setSelectedEdges((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  useEffect(() => {
    if (!cyInstance) return;

    cyInstance.edges().forEach((edge) => {
      const edgeType = edge._private.data.labels || edge._private.data.label

      edge.style({
        display: selectedEdges[edgeType] ? "element" : "none",
      });
    });

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

      {tabIndex==0 && (
        <Box className="space-y-2 p-4">
          <FileUpload setGraph={setGraph}/>

          <Box display="flex" justifyContent="space-between" alignItems="center" className="my-2">
            <Typography variant="subtitle1">Structure Visibility</Typography>
            <Switch
              checked={showStructure}
              onChange={(e) => setShowStructure(e.target.checked)}
            />
          </Box>

          <Layout cyInstance={cyInstance} analysisData={analysisData} showStructure={showStructure} />

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
      )}

      {tabIndex==1 && (
        <Box className="space-y-2 p-4">
          <ShowPrimitives cyInstance={cyInstance} />

          <NodeColoring cyInstance={cyInstance} analysisData={analysisData} />
        </Box>
      )}

      {tabIndex==2 && (
        <Box className="space-y-2 p-4">
          <Typography variant="subtitle1">Filter Edges</Typography>
          <FormGroup>
            {Object.values(edgesLabel).map((type) => (
              <FormControlLabel
                key={type}
                control={
                  <Checkbox
                    name={type}
                    checked={selectedEdges[type]}
                    onChange={handleEdgeFilterChange}
                    size="small"
                  />
                }
                label={type}
              />
            ))}
          </FormGroup>

        </Box>
      )}
    
    </Box>
  );
};

export default Menu;
