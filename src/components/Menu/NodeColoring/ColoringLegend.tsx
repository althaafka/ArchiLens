const ColoringLegend = ({ coloring, colorMap }) => {
  if (!colorMap) return null;
  const backgroundColors = colorMap.get(`${coloring}-bg`)

  return (
    <div className="legend-container">
      <h4>Node Coloring Legend</h4>
      <ul>
        {Object.entries(colorMap.get(coloring)).map(([key, color]) => (
          <li key={key} className="legend-item">
            <span
              className="legend-box"
              style={{
                backgroundColor: coloring == "rs" ? backgroundColors[key]: color,
                border: `3px solid ${coloring == "rs"? color : "#5E5E5E"}`,
              }}
            />
            {key}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ColoringLegend;