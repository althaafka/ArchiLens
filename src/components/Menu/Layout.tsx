import { useState, useRef } from 'react';
import { layoutTypes } from '../../constants/layoutData'
import registerSemanticGridLayout from 'cytoscape.js-semanticGrid';
import cytoscape from 'cytoscape';
import { initGraph, getGraph } from '../../utils/graphManagement';
import Dimension from '../../utils/dimension';
registerSemanticGridLayout(cytoscape);


const Layout = ({ cyInstance, dimension }) => {
  const [layout, setLayout] = useState(layoutTypes.grid);
  const [xDimension, setXDimension] = useState('');
  const [yDimension, setYDimension] = useState('');
  const [hidePackages, setHidePackages] = useState(false);

  const prevLayoutRef = useRef(null)
  const [prevLayoutType, setPrevLayoutType] = useState(null);


  const relayout = () => {
    if (!cyInstance) return;
    const graph = initGraph(cyInstance);
    const dimInstance = new Dimension(dimension);

    
    if (prevLayoutRef.current && typeof prevLayoutRef.current.destroy === 'function' && prevLayoutType == "semanticGrid") {
      prevLayoutRef.current.destroy();
    }

    if (prevLayoutType === 'semanticGrid') {
      graph.unhidePackage();
    }
    
    setPrevLayoutType(layout);

    if (layout == "semanticGrid") {
      if (!xDimension || !yDimension) return;

      const layoutOptions = {
        name: 'semanticGrid',
        xDimension: node => dimInstance.getNodeCategory(node, xDimension),
        yDimension: node => dimInstance.getNodeCategory(node, yDimension),
      };

      if (xDimension !== "Dimension:Container") {
        layoutOptions.xCategories = dimInstance.getCategoriesOrder(xDimension);
      }

      if (yDimension !== "Dimension:Container") {
        layoutOptions.yCategories = dimInstance.getCategoriesOrder(yDimension);
      }

      const layoutInstance = cyInstance.layout(layoutOptions);
      prevLayoutRef.current = layoutInstance;
      layoutInstance.run();

      hidePackages ? graph.hidePackage() : graph.unhidePackage();
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
    <>
      <h2>Layout</h2>
      <select value={layout} onChange={(e) => setLayout(e.target.value)}>
        {Object.entries(layoutTypes).map(([layoutKey, layoutValue]) => (
          <option key={layoutKey} value={layoutKey}>
            {layoutValue}
          </option>
        ))}
      </select>
      {layout === "semanticGrid" && (
        <div>
          <br></br>
          <h3>Semantic Grid Dimensions</h3>
          <br></br>
          <label>
            X Dimension:
            <select value={xDimension} onChange={(e) => setXDimension(e.target.value)}>
              <option value="" disabled>Choose</option>
              {dimension.dimension
                .map((dim) => (
                  <option key={dim.id} value={dim.id}>
                    {dim.properties.simpleName || dim.id}
                  </option>
                ))}
              <option value="Dimension:Container" key="Dimension:Container">Container</option>
            </select>
          </label>
          <div></div>
          <label>
            Y Dimension:
            <select value={yDimension} onChange={(e) => setYDimension(e.target.value)}>
              <option value="" disabled>Choose</option>
              {dimension.dimension
                .map((dim) => (
                  <option key={dim.id} value={dim.id}>
                    {dim.properties.simpleName || dim.id}
                  </option>
                ))}
              <option value="Dimension:Container" key="Dimension:Container">Container</option>
            </select>
          </label>
          <br></br>
          <label>
            <input
              type="checkbox"
              checked={hidePackages}
              onChange={(e) => setHidePackages(e.target.checked)}
            />
            Hide Package Nodes
          </label>
          <br></br>
        </div>
      )}
      <button onClick={relayout} disabled={layout === "semanticGrid" && (!xDimension || !yDimension)}>
        Relayout
      </button>
    </>
  );
};

export default Layout;
