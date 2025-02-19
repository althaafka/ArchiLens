const FeaturesColoringLegend = ({ featureColors }) => {
    return (
      <div className="legend-container">
        <h4>Node Coloring Legend</h4>
        <ul>
          {featureColors && Object.entries(featureColors).map(([feature, color]) => (
            <li key={feature} className="legend-item">
              <span
                className="legend-box"
                style={{
                  backgroundColor: color,
                  border: `3px solid #000000`,
                }}
              />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  export default FeaturesColoringLegend;
  