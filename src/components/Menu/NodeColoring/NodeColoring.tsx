import { useEffect, useState } from 'react';
import ColoringLegend from './ColoringLegend';
import { getScratch } from '../../../utils/utils';
// import { nodeColoringTypes } from '../../../constants/nodeColoringData';
import { camelCaseToWords } from '../../../utils/utils';

const NodeColoring = ({ cyInstance, dimension }) => {
  const [coloring, setColoring] = useState("none");
  const [categoriesVisibility, setCategoriesVisibility] = useState({});

  // const [featureChanged, setFeatureChanged] = useState(null)

  useEffect(() => {
    if (!cyInstance) return;


    let catVis = {};
    if (coloring != "none"){
      catVis = Object.keys(dimension.colorMap[coloring]).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {})
    }
    setCategoriesVisibility(catVis);
    console.log("catVis", catVis);


    console.log("coloring", coloring);
    console.log("categoriesVisibility", categoriesVisibility)
    
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


    cyInstance.nodes(n => n.data("labels")?.includes("Structure")).forEach((node) => {
      const categoriesIds = dimension.composedDimension.includes(coloring)? Object.keys(node.data('properties').composedDimension?.[coloring] || {}) : (node?.data('properties')?.dimension?.[coloring] || []);
      const isVisible = categoriesIds.some((id) => categoriesVisibility[id])
      node.style('display', isVisible ? 'element' : 'none');
    })
  }, [categoriesVisibility, coloring, cyInstance]);

  return (
    <div>
      <h3>Node Coloring</h3>
      <select value={coloring} onChange={(e) => setColoring(e.target.value)}>
        <option key="none" value="none">None</option> 
        {dimension?.dimension?.map((dim) => ( 
          <option key={dim.id} value={dim.id}>{camelCaseToWords(dim.properties.simpleName)}</option> 
        ))}
      </select>
      {coloring !== "none" && (
        <ColoringLegend 
          coloring={coloring} 
          dimension={dimension}
          categoriesVisibility={categoriesVisibility}
          setCategoriesVisibility={setCategoriesVisibility}
        />
      )}
    </div>
  );
};

export default NodeColoring;
