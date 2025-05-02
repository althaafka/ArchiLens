import { useState, useRef } from 'react';
import { layoutTypes } from '../../constants/layoutData'
import registerSemanticGridLayout from 'cytoscape.js-semanticGrid';
import cytoscape from 'cytoscape';
registerSemanticGridLayout(cytoscape);


const Layout = ({ cyInstance, dimension }) => {
  const [layout, setLayout] = useState(layoutTypes.grid);
  const [xDimension, setXDimension] = useState('');
  const [yDimension, setYDimension] = useState('');

  const prevLayoutRef = useRef(null)

  const relayout = () => {
    if (!cyInstance) return;
    
    if (prevLayoutRef.current && typeof prevLayoutRef.current.destroy === 'function') {
      prevLayoutRef.current.destroy();
    }
    
    if (layout == "semanticGrid") {
      if (!xDimension || !yDimension) return;

      const layoutInstance = cyInstance.layout({
        name: 'semanticGrid',
        xDimension: (node) => {
          const composed = node?.data().properties?.dimension?.[xDimension];
          return composed ? composed[0].split(`${xDimension.split("Dimension:")[1]}:`)[1] : null;
        },
        yDimension: (node) => {
          const composed = node?.data().properties?.dimension?.[yDimension];
          return composed ? composed[0].split(`${yDimension.split("Dimension:")[1]}:`)[1] : null;
        }
      });

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
                .filter((dim) => !dimension.composedDimension.includes(dim.id))
                .map((dim) => (
                  <option key={dim.id} value={dim.id}>
                    {dim.properties.simpleName || dim.id}
                  </option>
                ))}
            </select>
          </label>
          <div></div>
          <label>
            Y Dimension:
            <select value={yDimension} onChange={(e) => setYDimension(e.target.value)}>
              <option value="" disabled>Choose</option>
              {dimension.dimension
                .filter((dim) => !dimension.composedDimension.includes(dim.id))
                .map((dim) => (
                  <option key={dim.id} value={dim.id}>
                    {dim.properties.simpleName || dim.id}
                  </option>
                ))}
            </select>
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
