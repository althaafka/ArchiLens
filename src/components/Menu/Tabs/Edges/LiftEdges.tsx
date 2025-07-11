import { Box, Typography, IconButton } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const LiftEdges = ({
  liftDepth,
  minDepth,
  maxDepth,
  handleLift,
  handleUnlift,
  currentLayout,
  hidePackages,
  showStructure,
  containerFocus
}) => {
  const isDisabled = (direction) => {
    if (!showStructure || containerFocus !== "") return true;
    if (currentLayout === 'semanticGrid' && hidePackages) return true;
    if (direction === 'up') return liftDepth <= minDepth;
    if (direction === 'down') return liftDepth >= maxDepth;
    return false;
  };

  return (
    <Box>
      <Typography variant="subtitle1">Lift Edges</Typography>
      <Box display="flex" gap={1} alignItems="center" justifyContent="center">
        <IconButton
          onClick={handleLift}
          color="primary"
          disabled={isDisabled('up')}
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
          disabled={isDisabled('down')}
          size="large"
        >
          <ArrowDownwardIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default LiftEdges;
