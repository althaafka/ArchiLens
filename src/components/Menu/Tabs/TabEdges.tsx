import React from 'react';
import {
  Box, Typography, FormGroup, Checkbox, IconButton
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { edgeGradientColors } from '../../../constants/colorConstants';
import { edgesLabel } from '../../../constants/constants';

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
      <Typography variant="subtitle1">Lift Edges</Typography>
      <Box display="flex" gap={1} alignItems="center" className="flex justify-center">
        <IconButton
          onClick={handleLift}
          color="primary"
          disabled={liftDepth <= minDepth || (currentLayout === 'semanticGrid' && hidePackages) || !showStructure || containerFocus !== ""}
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
          disabled={liftDepth >= maxDepth || (currentLayout === 'semanticGrid' && hidePackages) || !showStructure || containerFocus !== ""}
          size="large"
        >
          <ArrowDownwardIcon />
        </IconButton>
      </Box>

      <Typography variant="subtitle1">Filter Edges</Typography>
      <FormGroup>
        {Object.values(edgesLabel).map((type) => {
          const colors = edgeGradientColors[type] || ['#ccc', '#eee'];
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
  );
};

export default TabEdges;
