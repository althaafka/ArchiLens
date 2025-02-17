import { stereoTypesColors, stereoTypesBorder } from '../utils/constants';

const ColoringLegend = () => {
  return (
    <div className="legend-container">
      <h4>Node Coloring Legend</h4>
      <ul>
        {Object.entries(stereoTypesColors).map(([type, color]) => (
          <li key={type} className="legend-item">
            <span
              className="legend-box"
              style={{
                backgroundColor: color,
                border: `3px solid ${stereoTypesBorder[type]}`,
              }}
            />
            {type}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ColoringLegend;