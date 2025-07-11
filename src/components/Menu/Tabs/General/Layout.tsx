import { useState, useRef, useEffect } from 'react';
import { layoutTypes } from '../../../../constants/layoutData'
import registerSemanticGridLayout from 'cytoscape.js-semanticGrid';
import cytoscape from 'cytoscape';
import { isPureContainer, removeChildRelation, addChildRelation } from "../../../../utils/nodeUtils";
import { edgeHasLabel } from "../../../../utils/edgeUtils";

import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
} from '@mui/material';
import { EdgeLifter } from '../../../../core/Headless/EdgeLifter';

registerSemanticGridLayout(cytoscape);


const Layout = ({ cyInstance, showStructure, analyticAspect, onLayoutChange, onHidePackagesChange, onLiftEdgeChange }) => {
  const [layout, setLayout] = useState(layoutTypes.grid);
  const [xDimension, setXDimension] = useState('');
  const [yDimension, setYDimension] = useState('');
  const [hidePackages, setHidePackages] = useState(false);
  const [xRangeStep, setXRangeStep] = useState(1);
  const [yRangeStep, setYRangeStep] = useState(1);

  const prevLayoutRef = useRef(null)
  const [prevLayoutType, setPrevLayoutType] = useState(null);

  useEffect(() => {
    onLayoutChange?.(layout);
  }, [layout]);
  useEffect(() => {
    onHidePackagesChange?.(hidePackages);
  }, [hidePackages]);

  const hidePackage = () => {
    cyInstance.nodes().forEach((node) => {
      const isPackage = isPureContainer(node);
      if (isPackage) {
        removeChildRelation(node)
        node.style('display', 'none');
      }
    })
  }

  const unhidePackage = () => {
    const containsMap = new Map<string, Set<string>>();
    cyInstance.edges().forEach((edge) => {
      if (!edgeHasLabel(edge, "contains")) return;

      if (!containsMap.has(edge.data().source)){
        containsMap.set(edge.data().source, new Set())
      }
      containsMap.get(edge.data().source)?.add(edge.data().target)
    })

    cyInstance.nodes().forEach((node) => {
      if (isPureContainer(node)) {
        node.style('display', 'element');
  
        const children = containsMap.get(node.id());
  
        if (children) {
          children?.forEach((childId) => {
            const childNode = cyInstance.getElementById(childId);
            if (childNode && childNode.length > 0) {
              addChildRelation(node, childNode);
            }
          });
        }
      }
    })
  }

  const relayout = () => {
    if (!cyInstance) return;

    
    if (prevLayoutRef.current && typeof prevLayoutRef.current.destroy === 'function' && prevLayoutType == "semanticGrid") {
      prevLayoutRef.current.destroy();
    }

    if (prevLayoutType === 'semanticGrid' && showStructure ) {
      unhidePackage();
    }
    
    setPrevLayoutType(layout);

    if (layout == "semanticGrid") {
      if (!xDimension || !yDimension) return;
      
      const layoutOptions: {
        name: string;
        xDimension: (node: any) => string;
        yDimension: (node: any) => string;
        xCategories?: string[];
        yCategories?: string[];
        rangeStep?: { x: number | null; y: number | null };
      } = {
        name: 'semanticGrid',
        xDimension: node => analyticAspect.getNodeCategory(node, xDimension, showStructure),
        yDimension: node => analyticAspect.getNodeCategory(node, yDimension, showStructure),
      };
      
      if (xDimension !== "Dimension:Container" && !analyticAspect.isMetric(xDimension)) {
        layoutOptions.xCategories = analyticAspect.getCategoriesOrder(xDimension);
      } else if (analyticAspect.isMetric(xDimension)) {
        layoutOptions.rangeStep = {x: xRangeStep, y:null};
      } else if (xDimension == 'Dimension:Container') {
        const containerOrder = analyticAspect.getContainerOrder();
        if (showStructure){
          layoutOptions.xCategories = containerOrder
        } else {
          layoutOptions.xCategories = ["root", ...containerOrder]
        }
      }
      
      if (yDimension !== "Dimension:Container" && !analyticAspect.isMetric(yDimension)) {
        layoutOptions.yCategories = analyticAspect.getCategoriesOrder(yDimension) ;
      } else if (analyticAspect.isMetric(yDimension)) {
        layoutOptions.rangeStep = {x: null, y: yRangeStep};
      }  else if (yDimension == 'Dimension:Container') {
        const containerOrder = analyticAspect.getContainerOrder();
        if (showStructure){
          layoutOptions.yCategories = containerOrder
        } else {
          layoutOptions.yCategories = ["root", ...containerOrder]
        }
      }
      
      const layoutInstance = cyInstance.layout(layoutOptions);
      prevLayoutRef.current = layoutInstance;
      
      layoutInstance.run();
      
      if (showStructure) {
        if (hidePackages) {
          const edgelifter = new EdgeLifter(cyInstance)
          edgelifter.unlift(analyticAspect?.depth?.maxDepth)
          hidePackage()
          onLiftEdgeChange?.(analyticAspect?.depth?.maxDepth)
        } else {
          unhidePackage()
        }
      }
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
                {analyticAspect.dimension.map((dim) => (
                  <MenuItem key={dim.id} value={dim.id}>
                    {dim.properties.simpleName || dim.id}
                  </MenuItem>
                ))}
                <MenuItem value="Dimension:Container">Container</MenuItem>
                {analyticAspect.metric.map((metric) => (
                  <MenuItem key={metric.id} value={metric.id}>
                    {metric.properties.simpleName || metric.id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>


          {analyticAspect.metric.find((m) => m.id === xDimension) && (
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
                {analyticAspect.dimension.map((dim) => (
                  <MenuItem key={dim.id} value={dim.id}>
                    {dim.properties.simpleName || dim.id}
                  </MenuItem>
                ))}
                <MenuItem value="Dimension:Container">Container</MenuItem>
                {analyticAspect.metric.map((metric) => (
                  <MenuItem key={metric.id} value={metric.id}>
                    {metric.properties.simpleName || metric.id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
                
            {analyticAspect.metric.find((m) => m.id === yDimension) && (
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
