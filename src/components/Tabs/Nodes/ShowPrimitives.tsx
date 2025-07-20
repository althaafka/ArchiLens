import { useEffect, useState } from 'react';
import { Switch, Box, Typography } from '@mui/material';

const ShowPrimitives = ({ cyInstance }) => {
    const [showPrimitives, setShowPrimitives] = useState(false);
    
    useEffect(() => {
        if (!cyInstance) return;

        cyInstance.nodes().forEach((node) => {
            const nodeLabels = node.data("labels") || [];
            const shouldHide =
                nodeLabels.includes("Primitive") || node.data("id") === "java.lang.String";
            if (shouldHide) {
                node.style({
                    display: showPrimitives ? "element" : "none",
                });
            }
        })
    }, [showPrimitives, cyInstance]);

    return (
      <Box className="flex items-center justify-between">
        <Typography variant="subtitle1">
          Show Primitives
        </Typography>
        <Switch
          checked={showPrimitives}
          onChange={(e) => setShowPrimitives(e.target.checked)}
        />
      </Box>
    );
};

export default ShowPrimitives;