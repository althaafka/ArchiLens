import { useEffect, useState } from 'react';
import ColoringLegend from './ColoringLegend';
import { getScratch } from '../../../utils/utils';
// import { nodeColoringTypes } from '../../../constants/nodeColoringData';
import { camelCaseToWords } from '../../../utils/utils';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

const NodeColoring = ({ cyInstance, analysisData}) => {
  const [coloring, setColoring] = useState("none");
  const [categoriesVisibility, setCategoriesVisibility] = useState({});

  // const [featureChanged, setFeatureChanged] = useState(null)

  useEffect(() => {
    if (!cyInstance) return;


    if (!analysisData.metric.find(m => m.id == coloring)) {
      let catVis = {};
      if (coloring != "none"){
        catVis = Object.keys(analysisData.colorMap[coloring]).reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {})
      }
      setCategoriesVisibility(catVis);

    }
    
    cyInstance.nodes().forEach((node) => {
      node.style(getScratch(node, 'style_none'));
      const styleKey = `style_${coloring}`;
      const style = getScratch(node, styleKey);
      if (style) {
        node.style(style);
      }
    });

  }, [coloring, cyInstance]);

  useEffect(() => {
    if (!cyInstance || coloring === "none") return;
    if (analysisData.metric.find(m => m.id == coloring)) return;

    cyInstance.nodes(n => n.data("labels")?.includes("Structure")).forEach((node) => {
      const categoriesIds = analysisData.composedDimension.includes(coloring)? Object.keys(node.data('properties').composedDimension?.[coloring] || {}) : (node?.data('properties')?.dimension?.[coloring] || []);
      const isVisible = categoriesIds.some((id) => categoriesVisibility[id])
      node.style('display', isVisible ? 'element' : 'none');
    })
  }, [categoriesVisibility, coloring, cyInstance]);

  return (
    <Box>
      <Typography variant="subtitle1">Node Coloring</Typography>
      <FormControl fullWidth size="small">
        <Select
          value={coloring}
          onChange={(e) => setColoring(e.target.value)}
        >
          <MenuItem value="none">None</MenuItem>
          {analysisData?.dimension?.map((dim) => (
            <MenuItem key={dim.id} value={dim.id}>
              {camelCaseToWords(dim.properties.simpleName)}
            </MenuItem>
          ))}
          {analysisData?.metric?.map((metric) => (
            <MenuItem key={metric.id} value={metric.id}>
              {camelCaseToWords(metric.properties.simpleName)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {coloring !== "none" && !analysisData.metric.find((m) => m.id === coloring) && (
        <ColoringLegend
          coloring={coloring}
          analysisData={analysisData}
          categoriesVisibility={categoriesVisibility}
          setCategoriesVisibility={setCategoriesVisibility}
        />
      )}
    </Box>
  );
};

export default NodeColoring;
