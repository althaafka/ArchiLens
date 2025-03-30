import { useEffect, useState } from 'react';
import ColoringLegend from './ColoringLegend';
import { getScratch } from '../../../utils/utils';
// import { nodeColoringTypes } from '../../../constants/nodeColoringData';
import { camelCaseToWords } from '../../../utils/utils';

const NodeColoring = ({ cyInstance, dimension }) => {
  const [coloring, setColoring] = useState("none");
  // const [featureVisibility, setFeatureVisibility] = useState(
    // Object.keys(colorMap.get(coloring) || {}).reduce((acc, key) => {
    //   acc[key] = true;
    //   return acc;
    // }, {})
  // );

  // const [featureChanged, setFeatureChanged] = useState(null)

  useEffect(() => {
    // if (!cyInstance) return;
    // setFeatureVisibility(Object.keys(colorMap.get(coloring) || {}).reduce((acc, key) => {
    //   acc[key] = true;
    //   return acc;
    // }, {}))
    
    // cyInstance.nodes().forEach((node) => {
    //   const styleKey = `style_${coloring}`;
    //   const style = getScratch(node, styleKey);
    //   if (style) {
    //     node.style(style);
    //   }
    // });

  }, [coloring, cyInstance]);

  // useEffect(() => {
    // if (coloring !== 'feature' || !cyInstance || !featureChanged) return;
  
    // const nodes = cyInstance.nodes().filter(n => n.data('labels').includes("Structure") && n.data('id') !== "java.lang.String");
    // nodes.forEach((node) => {
    //   const featureIds = (node.data().properties.feature || []).filter(featureId => featureVisibility[featureId]);
  
    //   if (!featureIds.length) {
    //     node.style({
    //       "display": "none"
    //     });
    //     return;
    //   }
  
    //   const colors = featureIds.map((id) => colorMap.get('feature')[id] || "#F2F2F2");
    //   const positions = colors.map((_, index) => `${(index / (colors.length - 1)) * 100}%`);
  
    //   node.style(featureIds.length === 1
    //     ? {
    //         'background-color': colors[0],
    //         'border-color': '#5E5E5E',
    //         'background-fill': 'solid',
    //         'display': "element"
    //       }
    //     : {
    //         "background-fill": "linear-gradient",
    //         "background-gradient-direction": "to-right",
    //         "background-gradient-stop-colors": colors,
    //         "background-gradient-stop-positions": positions,
    //         "border-color": "#5E5E5E",
    //         "display": "element"
    //       }
    //   );
    // });


  
  // }, [featureVisibility]);
  

  return (
    <div>
      <h3>Node Coloring</h3>
      <select value={coloring} onChange={(e) => setColoring(e.target.value)}>
        {dimension?.dimension?.map((dim) => ( 
          <option key={dim.id} value={dim.id}>{camelCaseToWords(dim.properties.simpleName)}</option> 
        ))}
      </select>
      {/* {coloring !== "none" && (
        // <ColoringLegend 
        //   coloring={coloring} 
        //   colorMap={colorMap} 
        //   featureVisibility={featureVisibility}
        //   setFeatureVisibility={setFeatureVisibility}
        //   setFeatureChanged={setFeatureChanged}
        // />
      )} */}
    </div>
  );
};

export default NodeColoring;
