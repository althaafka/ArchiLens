import {
  Typography,
  Box,

} from "@mui/material";

const ColoredBadge = ({ label, color }: { label: string; color?: string }) => (
             <Box className="flex items-center">
                  <Box
                  sx={{
                    width: 35,
                    height: 20,
                    borderRadius: '4px',
                    background: color,
                    border: '1px solid #ccc',
                    marginRight: 1,
                    flexShrink: 0,
                  }}
                />
                <Typography variant="body2" className="text-sm text-gray-800">
                  {label}
                </Typography>
              </Box>
  
);

export default ColoredBadge;