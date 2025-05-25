import { useState, useRef } from 'react';
import { layoutTypes } from '../../constants/layoutData'
import registerSemanticGridLayout from 'cytoscape.js-semanticGrid';
import cytoscape from 'cytoscape';
import { initGraph } from '../../utils/graphManagement';
import AnalysisAspect from '../../utils/analysisAspect';

import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
} from '@mui/material';

registerSemanticGridLayout(cytoscape);


const Layout = ({ cyInstance, analysisData, showStructure }) => {
  const [layout, setLayout] = useState(layoutTypes.grid);
  const [xDimension, setXDimension] = useState('');
  const [yDimension, setYDimension] = useState('');
  const [hidePackages, setHidePackages] = useState(false);
  const [xRangeStep, setXRangeStep] = useState(1);
  const [yRangeStep, setYRangeStep] = useState(1);

  const prevLayoutRef = useRef(null)
  const [prevLayoutType, setPrevLayoutType] = useState(null);


  const relayout = () => {
    if (!cyInstance) return;
    const graph = initGraph(cyInstance);
    const analysisAspect = new AnalysisAspect(analysisData);

    
    if (prevLayoutRef.current && typeof prevLayoutRef.current.destroy === 'function' && prevLayoutType == "semanticGrid") {
      prevLayoutRef.current.destroy();
    }

    if (prevLayoutType === 'semanticGrid' ) {
      graph.unhidePackage(cyInstance);
    }
    
    setPrevLayoutType(layout);
    
    if (layout == "semanticGrid") {
      if (!xDimension || !yDimension) return;
      
      // if (showStructure) {
        hidePackages ? graph.hidePackage(cyInstance) : graph.unhidePackage(cyInstance);
      // }

      const layoutOptions: {
        name: string;
        xDimension: (node: any) => string;
        yDimension: (node: any) => string;
        xCategories?: string[];
        yCategories?: string[];
        rangeStep?: { x: number | null; y: number | null };
      } = {
        name: 'semanticGrid',
        xDimension: node => analysisAspect.getNodeCategory(node, xDimension, showStructure),
        yDimension: node => analysisAspect.getNodeCategory(node, yDimension, showStructure),
      };



      if (xDimension !== "Dimension:Container" && !analysisAspect.isMetric(xDimension)) {
        layoutOptions.xCategories = analysisAspect.getCategoriesOrder(xDimension);
      } else if (analysisAspect.isMetric(xDimension)) {
        layoutOptions.rangeStep = {x: xRangeStep, y:null};
      }


      if (yDimension !== "Dimension:Container" && !analysisAspect.isMetric(yDimension)) {
        layoutOptions.yCategories = analysisAspect.getCategoriesOrder(yDimension) ;
      } else if (analysisAspect.isMetric(yDimension)) {
        layoutOptions.rangeStep = {x: null, y: yRangeStep};
      }

      const layoutInstance = cyInstance.layout(layoutOptions);
      prevLayoutRef.current = layoutInstance;

      layoutInstance.run();

    } else {
      cyInstance.layout({
        name: layout,
        animated: false,
        avoidOverlap: true,
        nodeSpacing: 10,
      }).run();
    }
  };

  return (
    <Box className="mb-8">
      <Typography variant="subtitle1">Layout</Typography>

      <FormControl fullWidth size="small">
        <Select  value={layout} onChange={(e) => setLayout(e.target.value)} displayEmpty>
          {Object.entries(layoutTypes).map(([key, value]) => (
            <MenuItem key={key} value={key}>{value}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {layout === "semanticGrid" && (
        <Box className="space-y-2 mt-2">
          <Typography variant="subtitle1">Semantic Grid Dimensions</Typography>

          <Box display="flex" alignItems="center" gap={1}>
            <Typography className="w-12 text-center">X</Typography>

            <FormControl fullWidth size="small">
              <Select
                value={xDimension}
                onChange={(e) => setXDimension(e.target.value)}
                displayEmpty
              >
                {analysisData.dimension.map((dim) => (
                  <MenuItem key={dim.id} value={dim.id}>
                    {dim.properties.simpleName || dim.id}
                  </MenuItem>
                ))}
                <MenuItem value="Dimension:Container">Container</MenuItem>
                {analysisData.metric.map((metric) => (
                  <MenuItem key={metric.id} value={metric.id}>
                    {metric.properties.simpleName || metric.id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>


          {analysisData.metric.find((m) => m.id === xDimension) && (
            <Box className="" display="flex" alignItems="center" gap={1}>
              <Typography className="w-20 text-xs text-gray-500 text-center">Step</Typography>
              <TextField
                size="small"
                type="number"
                value={xRangeStep}
                onChange={(e) => setXRangeStep(Number(e.target.value))}
                inputProps={{ min: 0 }}
                fullWidth
              />
            </Box>
          )}

          <Box display="flex" alignItems="center" gap={1}>
            <Typography className="w-12 text-center">Y</Typography>
            <FormControl fullWidth size="small">
             <Select
               value={yDimension}
               onChange={(e) => setYDimension(e.target.value)}
               displayEmpty
             >
                {analysisData.dimension.map((dim) => (
                  <MenuItem key={dim.id} value={dim.id}>
                    {dim.properties.simpleName || dim.id}
                  </MenuItem>
                ))}
                <MenuItem value="Dimension:Container">Container</MenuItem>
                {analysisData.metric.map((metric) => (
                  <MenuItem key={metric.id} value={metric.id}>
                    {metric.properties.simpleName || metric.id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
                
            {analysisData.metric.find((m) => m.id === yDimension) && (
              <Box className="" display="flex" alignItems="center" gap={1}>
              <Typography className="w-20 text-xs text-gray-500 text-center">Step</Typography>
              <TextField
                size="small"
                type="number"
                value={yRangeStep}
                onChange={(e) => setYRangeStep(Number(e.target.value))}
                inputProps={{ min: 1 }}
                fullWidth
              />
            </Box>
            )}

          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={hidePackages}
                  onChange={(e) => setHidePackages(e.target.checked)}
                  size="small"
                />
              }
              label="Hide Package Nodes"
            />
          </FormGroup>
        </Box>
      )}

      <Box display="flex" justifyContent="flex-end" className="mt-2">
        <Button
          size="small"
          variant="contained"
          onClick={relayout}
          disabled={layout === "semanticGrid" && (!xDimension || !yDimension)}
        >
          Relayout
        </Button>
      </Box>
    </Box>
  );
};

export default Layout;
