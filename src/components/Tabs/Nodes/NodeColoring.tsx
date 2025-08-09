import { useEffect } from 'react';
import ColoringLegend from './ColoringLegend';
import { getScratch } from '../../../utils/utils';
// import { nodeColoringTypes } from '../../../constants/nodeColoringData';
import { camelCaseToWords } from '../../../utils/utils';
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';

const NodeColoring = ({ cyInstance, analyticAspect, coloring, setColoring, categoriesVisibility, setCategoriesVisibility, showStructure}) => {

  useEffect(() => {
    setColoring('none')
  }, [cyInstance])

  useEffect(() => {
    if (!cyInstance) return;

    if (!analyticAspect?.metric?.find(m => m.id == coloring)) {
      let catVis = {};
      if (coloring != "none"){
        if (!catVis) return
        catVis = Object.keys(analyticAspect?.colorMap?.[coloring] || {}).reduce((acc, key) => {
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
      if (node.hasClass('hidden')) {
        node.style('display', 'none');
      }
    });

  }, [coloring, cyInstance]);

  useEffect(() => {
    if (!cyInstance ) return;
    console.log("--", coloring)
    const test = cyInstance.nodes(n => 
        showStructure ? 
          n.data("labels")?.includes("Structure") && n.id() != "java.lang.String" :
          n.data('labels')?.includes("Container") && !n.data("labels")?.includes("Structure") 
        )

    test.forEach(node => {
      console.log(node.id())
    })
    
    if(coloring === "none" || analyticAspect.metric.find(m => m.id == coloring)) {
      cyInstance.nodes(n => 
        showStructure ? 
          n.data("labels")?.includes("Structure") && n.id() != "java.lang.String" :
          n.data('labels')?.includes("Container") && !n.data("labels")?.includes("Structure") 
        ).forEach((node) => {
        node.style('display', 'element');
      })
      return;
    }
    // if (analyticAspect.metric.find(m => m.id == coloring)) return;
    cyInstance.nodes(n => 
      showStructure? 
        n.data("labels")?.includes("Structure") && n.id() != "java.lang.String": 
        n.data("labels")?.includes("Container") && !n.data("labels")?.includes("Structure"))
    .forEach((node) => {
      let categoriesIds;
      if (analyticAspect.composedDimension.includes(coloring)) {
        categoriesIds = Object.keys(node.data('properties').composedDimension?.[coloring] || {})
      } else {
        categoriesIds = node?.data('properties')?.dimension?.[coloring];
        if (categoriesIds?.length == 0) categoriesIds = ['-']
      }
      if(!showStructure && !categoriesIds) {
        categoriesIds = Object.keys(node.data('properties').composedDimension?.[coloring] || {})
      }
      console.log("-", node.id(), categoriesIds)

      const isVisible = categoriesIds?.some((id) => categoriesVisibility[id])
      if (node.hasClass('hidden')) {
        node.style('display', 'none');
      } else {
        node.style('display', isVisible ? 'element' : 'none');
      }
    })
  }, [categoriesVisibility]);

  return (
    <Box>
      <Typography variant="subtitle1">Node Coloring</Typography>
      <FormControl fullWidth size="small">
        <Select
          value={coloring}
          onChange={(e) => setColoring(e.target.value)}
        >
          <MenuItem value="none">None</MenuItem>
          {analyticAspect?.dimension?.map((dim) => (
            <MenuItem key={dim.id} value={dim.id}>
              {camelCaseToWords(dim.properties.simpleName)}
            </MenuItem>
          ))}
          {analyticAspect?.metric?.map((metric) => (
            <MenuItem key={metric.id} value={metric.id}>
              {camelCaseToWords(metric.properties.simpleName)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {coloring !== "none" && !analyticAspect.metric.find((m) => m.id === coloring) && (
        <ColoringLegend
          coloring={coloring}
          analyticAspect={analyticAspect}
          categoriesVisibility={categoriesVisibility}
          setCategoriesVisibility={setCategoriesVisibility}
        />
      )}
    </Box>
  );
};

export default NodeColoring;
