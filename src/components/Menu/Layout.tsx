import { useState } from 'react';
import { layoutTypes } from '../../constants/layoutData'

const Layout = ({ cyInstance }) => {
  const [layout, setLayout] = useState(layoutTypes.grid);

  const relayout = () => {
    if (!cyInstance) return;
    cyInstance.layout({
      name: layout,
      animated: false,
      avoidOverlap: true,
      nodeSpacing: 10,
    }).run();
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
      <button onClick={relayout}>Relayout</button>
    </>
  );
};

export default Layout;
