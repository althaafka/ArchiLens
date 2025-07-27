import { Box } from '@mui/material';
import FileUpload from './General/FileUpload';
import Layout from './General/Layout';
import ContainerSelector from './General/ContainerSelector';
import StructureVisibility from './General/StructureVisibility';
import DownloadGraph from './General/DownloadGraph';

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
  handleLiftChange
}) => {
  return (
    <Box hidden={hidden} className="space-y-2 p-4">
      <FileUpload setGraph={setGraph} />

      <StructureVisibility 
        showStructure={showStructure} 
        setShowStructure={setShowStructure}
      />

      {showStructure &&
      <ContainerSelector
        cyInstance={cyInstance}
        analyticAspect={analyticAspect}
        selectedContainer={containerFocus}
        setSelectedContainer={setContainerFocus}
      />
      }

      <Layout
        cyInstance={cyInstance}
        analyticAspect={analyticAspect}
        showStructure={showStructure}
        onLayoutChange={handleLayoutChange}
        onHidePackagesChange={handleHidePackagesChange}
        onLiftEdgeChange={handleLiftChange}
      />

      <DownloadGraph cyInstance={cyInstance} />
    </Box>
  );
};

export default TabGeneral;
