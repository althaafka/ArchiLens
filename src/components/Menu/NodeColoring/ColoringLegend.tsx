import {
  Box,
  FormControlLabel,
  Checkbox,
  Typography,
  Chip
} from '@mui/material';
import { Grid } from '@mui/material';




const ColoringLegend = ({ 
    coloring, 
    analyticAspect,
    categoriesVisibility, 
    setCategoriesVisibility, 
  }) => {
  
    const dimensionId = analyticAspect.dimension.find(d => d.id === coloring)?.id;

    const handleCheckboxChange = (key) => {
      setCategoriesVisibility((prev) => ({
          ...prev,
          [key]: !prev[key],
      }));
  };


  return (
    <Box className="mt-2">
      <Typography variant="subtitle1">
        Node Coloring Legend
      </Typography>

      <Box className="flex flex-col">
        {Object.keys(analyticAspect.colorMap[dimensionId] || {}).map((key) => {
          const color = analyticAspect.colorMap[dimensionId][key] || '#F2F2F2';
          const label =
            analyticAspect.category.find((c) => c.id === key)?.properties.simpleName || key;

          return (
            <Box key={key} className="flex items-center">
              <Checkbox
                checked={categoriesVisibility[key] ?? true}
                onChange={() => handleCheckboxChange(key)}
                size="small"
              />
              <span
                className="w-9 h-4.5 mr-2 rounded-sm border border-gray-600"
                style={{ backgroundColor: color }}
              />
              <Typography variant="body2" className="text-sm text-gray-800">
                {label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
  
};

export default ColoringLegend;
