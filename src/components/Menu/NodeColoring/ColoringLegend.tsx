const ColoringLegend = ({ 
    coloring, 
    dimension,
    categoriesVisibility, 
    setCategoriesVisibility, 
  }) => {
  
    const dimensionId = dimension.dimension.find(d => d.id === coloring)?.id;

    const handleCheckboxChange = (key) => {
      setCategoriesVisibility((prev) => ({
          ...prev,
          [key]: !prev[key],
      }));
  };


  return (
    <div className="legend-container">
      <h4>Node Coloring Legend</h4>
      <ul>
        {/* {Object.entries(colorMap.get(coloring)).map(([key, color]) => ( */}
        {Object.keys(dimension.colorMap[dimensionId]).map(key => (
          <li key={key} className="legend-item">
              <input
                type="checkbox"
                checked={categoriesVisibility[key] ?? true}
                onChange={() => handleCheckboxChange(key)}
              />
            <span
              className="legend-box"
              style={{
                backgroundColor: dimension.colorMap[dimensionId][key] || "#F2F2F2",
                border: `3px solid ${ "#5E5E5E"}`,
              }}
            />
            {dimension.category.find(c => c.id === key)?.properties.simpleName || key}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ColoringLegend;
