import React from 'react';
import { Box, Button, Divider, Switch, Typography } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import FileUpload from '../FileUpload';
import Layout from '../Layout';
import ContainerSelector from '../ContainerSelector';

const TabGeneral = ({
  hidden,
  setGraph,
  showStructure,
  setShowStructure,
  cyInstance,
  analyticAspect,
  containerFocus,
  setContainerFocus,
  handleLayoutChange,
  handleHidePackagesChange,
  handleLiftChange,
  downloadGraphAsPng,
  filterEdgeDisplay
}) => {
  return (
    <Box hidden={hidden} className="space-y-2 p-4">
      <FileUpload setGraph={setGraph} />
      <Box display="flex" justifyContent="space-between" alignItems="center" className="my-2">
        <Typography variant="subtitle1">Structure Visibility</Typography>
        <Switch
          checked={showStructure}
          onChange={(e) => setShowStructure(e.target.checked)}
        />
      </Box>
      <ContainerSelector
        cyInstance={cyInstance}
        analyticAspect={analyticAspect}
        filterEdgeDisplay={filterEdgeDisplay}
        selectedContainer={containerFocus}
        setSelectedContainer={setContainerFocus}
      />
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
  );
};

export default TabGeneral;
