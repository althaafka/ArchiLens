import { Box, Typography, Switch } from '@mui/material';

const StructureVisibility = ({ showStructure, setShowStructure }) => {
  const handleToggle = (e) => setShowStructure(e.target.checked);

  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" className="my-2">
      <Typography variant="subtitle1">Structure Visibility</Typography>
      <Switch
        checked={showStructure}
        onChange={handleToggle}
      />
    </Box>
  );
};

export default StructureVisibility;