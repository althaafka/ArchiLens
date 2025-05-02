import { useState } from 'react';
import { layoutTypes } from '../../constants/layoutData'
import registerSemanticGridLayout from 'cytoscape-semantic-grid';
import cytoscape from 'cytoscape';
registerSemanticGridLayout(cytoscape);


const Layout = ({ cyInstance, dimension }) => {
  const [layout, setLayout] = useState(layoutTypes.grid);
  const [xDimension, setXDimension] = useState('');
  const [yDimension, setYDimension] = useState('');
  console.log("test:", cyInstance?.nodes()[14].data().properties?.dimension['Dimension:RoleStereotypes'][0])

  const relayout = () => {
    if (!cyInstance) return;

    if (layout == "semanticGrid") {
      console.log("dimension:", dimension);

      cyInstance.layout({
        name: 'semanticGrid',
        xDimension: (node) => {
          console.log("xDimension", xDimension)
          const composedDimension = node?.data().properties?.dimension?.[xDimension];
          console.log(composedDimension)
          // console.log(x)
          return composedDimension
            ? composedDimension[0].split(`${xDimension.split("Dimension:")[1]}:`)[1]
            : null;
        },
        yDimension: (node) => {
          console.log("yDimension", yDimension)
          const composedDimension = node?.data().properties?.dimension?.[yDimension];
          return composedDimension
            ? composedDimension[0].split(`${yDimension.split("Dimension:")[1]}:`)[1]
            : null;
        }
      }).run();
    } else {
      cyInstance.nodes(node => node.data('labels').includes("Container")).style('display', 'element');

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
              <option value="">Select X Dimension</option>
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
              <option value="">Select Y Dimension</option>
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
      <button onClick={relayout}>Relayout</button>
    </>
  );
};

export default Layout;
