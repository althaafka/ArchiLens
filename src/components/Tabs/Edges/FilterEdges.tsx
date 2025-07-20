import { Box, Typography, FormGroup, Checkbox } from '@mui/material';
import { edgeGradientColors } from '../../../constants/colorConstants';
import { edgesLabel } from '../../../constants/constants';

const FilterEdges = ({ selectedEdges, handleEdgeFilterChange }) => {
  return (
    <Box>
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

export default FilterEdges;
