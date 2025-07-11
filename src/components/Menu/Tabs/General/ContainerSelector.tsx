import { useEffect, useState } from 'react';
import {
  Box,
  FormControl,
  MenuItem,
  Select,
  Typography
} from '@mui/material';

const ContainerSelector = ({ cyInstance, analyticAspect, selectedContainer, setSelectedContainer }) => {
  const [containers, setContainers] = useState([]);

  useEffect(() => {
    if (!cyInstance) return;

    const containerList = analyticAspect.depth.containerIds
    setContainers(containerList);
  }, [cyInstance]);

  const handleChange = (event) => {
    setSelectedContainer(event.target.value)
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Container Focus
      </Typography>
      <FormControl fullWidth size="small">
        <Select
          value={selectedContainer}
          onChange={handleChange}
        >
          <MenuItem value="">— Show All —</MenuItem>
          {containers.map((container) => (
            <MenuItem key={container} value={container}>
              {container}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default ContainerSelector;
