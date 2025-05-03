const ColoringLegend = ({ 
    coloring, 
    analysisData,
    categoriesVisibility, 
    setCategoriesVisibility, 
  }) => {
  
    const dimensionId = analysisData.dimension.find(d => d.id === coloring)?.id;

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
        {Object.keys(analysisData.colorMap[dimensionId]).map(key => (
          <li key={key} className="legend-item">
              <input
                type="checkbox"
                checked={categoriesVisibility[key] ?? true}
                onChange={() => handleCheckboxChange(key)}
              />
            <span
              className="legend-box"
              style={{
                backgroundColor: analysisData.colorMap[dimensionId][key] || "#F2F2F2",
                border: `3px solid ${ "#5E5E5E"}`,
              }}
            />
            {analysisData.category.find(c => c.id === key)?.properties.simpleName || key}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ColoringLegend;
