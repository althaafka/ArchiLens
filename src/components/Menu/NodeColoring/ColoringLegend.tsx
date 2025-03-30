const ColoringLegend = ({ 
    coloring, 
    dimension,
    // featureVisibility, 
    // setFeatureVisibility, 
    // setFeatureChanged 
  }) => {
  
    const dimensionId = dimension.dimension.find(d => d.id === coloring)?.id;
    console.log("dimensionId", dimensionId);
    console.log("colormap", dimension.colorMap[dimensionId]);

  // if (!colorMap) return null;
  // const backgroundColors = colorMap.get(`${coloring}-bg`);

  // const handleCheckboxChange = (feature) => {
  //   setFeatureChanged({key: feature, visibility: !featureVisibility[feature]})
  //   const updatedVisibility = { ...featureVisibility, [feature]: !featureVisibility[feature] };
  //   setFeatureVisibility(updatedVisibility);
  // };  1 

  return (
    <div className="legend-container">
      <h4>Node Coloring Legend</h4>
      <ul>
        {/* {Object.entries(colorMap.get(coloring)).map(([key, color]) => ( */}
        {Object.keys(dimension.colorMap[dimensionId]).map(key => (
          <li key={key} className="legend-item">
            {/* {coloring === "feature" && (
              <input
                type="checkbox"
                checked={featureVisibility[key] ?? true}
                onChange={() => handleCheckboxChange(key)}
              />
            )} */}
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
