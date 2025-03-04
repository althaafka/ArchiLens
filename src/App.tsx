import { useRef, useState, useEffect } from 'react';
import './App.css';
import cytoscape from "cytoscape";
import cytoscapeCola from "cytoscape-cola";
import { Stylesheet } from "cytoscape";
import styleData from "./cy-style.json";
import rawGraph from "./assets/jhotdraw-features-v2.json";
import { setupGraph } from "./utils/setupGraph";
import Menu from './components/Menu/Menu';
import { rsColors } from "./constants/nodeColoringData";
import { generateColorMap, addScratch, generateBgColors } from "./utils/utils";

const style: Stylesheet[] = styleData as Stylesheet[];

cytoscape.use(cytoscapeCola);

function App() {
  const cyRef = useRef<HTMLDivElement>(null);
  const [graph, setGraph] = useState(rawGraph);
  const [cyInstance, setCyInstance] = useState(null);
  const [features, setFeatures] = useState([]);
  const [layers, setLayers] = useState([]);
  const [colorMap, setColorMap] = useState(new Map<string, Object>())

  // Init cytoscape
  useEffect(() => {
    if (!cyRef.current) return;

    const processedGraph = setupGraph(graph.elements);
    setFeatures(processedGraph.feature);
    setLayers(processedGraph.layer);

    const hcy = cytoscape({
      headless: true,
      elements: processedGraph.graph,
      ready: (event) => {
        const hcyInstance = event.cy;
        setCyInstance(hcyInstance);

        if (cyRef.current) {
          const cy = cytoscape({
            container: cyRef.current,
            elements: hcyInstance.json().elements,
            style: style,
            wheelSensitivity: 0.25,
            ready: (cyEvent) => {
              setCyInstance(cyEvent.cy);
            },
          });
          cy.on('tap', 'node', (event) => {
            console.log("Node clicked:", event.target.data());
          });
  
          cy.on('tap', 'edge', (event) => {
            console.log("Edge clicked:", event.target.data());
          });
        }

      }
    });

    return () => {
      hcy.destroy();
    };
  }, [graph]);

  useEffect(() => {
    if (!cyInstance) return;

    addScratch(cyInstance, 'features', features)
    initNodeColors();
    setNodeStyles();
  }, [cyInstance]);


  function initNodeColors() {
    colorMap.set('default', { "default": "#F2F2F2" });
    colorMap.set('rs', rsColors);
    colorMap.set('rs-bg', generateBgColors(rsColors));
    colorMap.set('feature', generateColorMap(features));
    colorMap.set('layer', generateColorMap(layers));
    colorMap.set('layer-bg', generateBgColors(colorMap.get('layer')))
  }

  function setNodeStyles() {
    setRsStyles();
    setFeatureStyles();
  }

  function setRsStyles() {
    if (!cyInstance) return;

    const nodes = cyInstance.nodes().filter(n => n.data('labels').includes("Structure") && n.data('id') !== "java.lang.String");
    const rsColorMap = colorMap.get('rs');
    const rsBgMap = colorMap.get('rs-bg')

    nodes.forEach((node) => {
      addScratch(node, 'style_rs', {
        'display': "element",
        'background-fill': "solid",
        'border-color': rsColorMap[node.data('properties.roleStereotype')] || rsColorMap['-'],
        'background-color': rsBgMap[node.data('properties.roleStereotype')] || rsBgMap['-'],
      });
    });
  }

  function setFeatureStyles() {
    if (!cyInstance) return;
  
    const featureColorMap = colorMap.get('feature');
    const defaultColor = "#F2F2F2";
  
    const nodeFeatureMap = features.reduce((map, feature) => {
      const featureId = feature.data.id;
      const members = feature.data.properties?.members || [];
  
      members.forEach((member) => {
        if (!map.has(member)) map.set(member, []);
        map.get(member).push(featureId);
      });
  
      return map;
    }, new Map<string, string[]>());
  
    const nodes = cyInstance.nodes().filter(n => n.data('labels').includes("Structure") && n.data('id') !== "java.lang.String");
    nodes.forEach((node) => {
      const nodeId = node.data('id');
      const featureIds = nodeFeatureMap.get(nodeId) || [];

      if (featureIds) node.data().properties = { ...node.data().properties, feature: featureIds };
      if (!featureIds.length) {
        return addScratch(node, 'style_feature', {
          'display': "element",
          'background-color': colorMap.get('-'),
          'border-color': '#5E5E5E'
        });
      }

      const colors = featureIds.map((id) => featureColorMap[id] || defaultColor);
      const positions = colors.map((_, index) => `${(index / (colors.length - 1)) * 100}%`);
  
      addScratch(node, 'style_feature', featureIds.length === 1
        ? {
            'display': "element",
            'background-color': colors[0],
            'border-color': '#5E5E5E'
          }
        : {
            'display': "element",
            "background-fill": "linear-gradient",
            "background-gradient-direction": "to-right",
            "background-gradient-stop-colors": colors,
            "background-gradient-stop-positions": positions,
            "border-color": "#5E5E5E"
          }
      );
    });
  }
  

  return (
    <>
    <div className="app-container">
      {/* Cytoscape */}
      <div className="canvas">
        <div ref={cyRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {/* Menu Bar */}
      <Menu cyInstance={cyInstance} setGraph={setGraph} colorMap={colorMap} />
    </div>
    </>
  );
}

export default App;