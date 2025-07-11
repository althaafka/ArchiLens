import {
  Box
} from '@mui/material';

import LiftEdges from './Edges/LiftEdges';
import FilterEdges from './Edges/FilterEdges';

const TabEdges = ({
  hidden,
  liftDepth,
  minDepth,
  maxDepth,
  handleLift,
  handleUnlift,
  selectedEdges,
  handleEdgeFilterChange,
  currentLayout,
  hidePackages,
  showStructure,
  containerFocus
}) => {
  return (
    <Box hidden={hidden} className="space-y-2 p-4">
      <LiftEdges
        liftDepth={liftDepth}
        minDepth={minDepth}
        maxDepth={maxDepth}
        handleLift={handleLift}
        handleUnlift={handleUnlift}
        currentLayout={currentLayout}
        hidePackages={hidePackages}
        showStructure={showStructure}
        containerFocus={containerFocus}
      />

      <FilterEdges
        selectedEdges={selectedEdges}
        handleEdgeFilterChange={handleEdgeFilterChange}
      />
    </Box>
  );
};

export default TabEdges;
