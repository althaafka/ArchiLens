import React from 'react';
import { Box, Typography } from '@mui/material';
import ShowPrimitives from './Nodes/ShowPrimitives';
import NodeColoring from './Nodes/NodeColoring';
import NodeFilterTree from '../NodeFilterTree';

const TabNodes = ({
  hidden,
  cyInstance,
  analyticAspect,
  coloring,
  setColoring,
  categoriesVisibility,
  setCategoriesVisibility
}) => {
  return (
    <Box hidden={hidden} className="space-y-2 p-4">
      <ShowPrimitives cyInstance={cyInstance} />

      <NodeColoring
        cyInstance={cyInstance}
        analyticAspect={analyticAspect}
        coloring={coloring}
        setColoring={setColoring}
        categoriesVisibility={categoriesVisibility}
        setCategoriesVisibility={setCategoriesVisibility}
      />
      
      <NodeFilterTree
        cyInstance={cyInstance}
        categoriesVisibility={categoriesVisibility}
      />
    </Box>
  );
};

export default TabNodes;
