import { useRef, useState } from 'react'

import './App.css'

function App() {
  const cyRef = useRef(null);

  const edgeTypes = [
    "contains", "calls", "constructs", "holds", "accepts", "specializes", "returns", "accesses"
  ];

  return (
    <div className="app-container">
      {/* Cytoscape */}
      <div className="canvas">
        <div ref={cyRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {/* Menu Bar */}
      <div className="menu-bar">
        <h2>Relationships</h2>
        <ul>
          {edgeTypes.map((type) => (
            <li key={type}>
              <label>
                <input
                  type="checkbox"
                />
                {type}
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default App
