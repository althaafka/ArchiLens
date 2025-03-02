import { useRef, useState, useEffect } from 'react';
import './App.css';
import cytoscape from "cytoscape";
import cytoscapeCola from "cytoscape-cola";
import { Stylesheet } from "cytoscape";
import styleData from "./cy-style.json";
import rawGraph from "./assets/jhotdraw-features.json";
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
        }
      }
    });

    return () => {
      hcy.destroy();
    };
  }, [graph]);

  useEffect(() => {
    if (!cyInstance) return;

    initNodeColors();
    setNodeStyles();
  }, [cyInstance]);


  function initNodeColors() {
    colorMap.set('default', { "default": "#F2F2F2" });
    colorMap.set('rs', rsColors);
    colorMap.set('rs-bg', generateBgColors(rsColors));
    colorMap.set('feature', generateColorMap(features));
    colorMap.set('feature-bg', generateBgColors(colorMap.get('feature')));
    colorMap.set('layer', generateColorMap(layers));
    colorMap.set('layer-bg', generateBgColors(colorMap.get('layer')))
  }

  function setNodeStyles() {
    setRsStyles();
    setFeatureStyles();
  }

  function setRsStyles() {
    if (!cyInstance) return;

    const nodes = cyInstance.nodes().filter(n => n.data('labels').includes("Structure"));
    const rsColorMap = colorMap.get('rs');
    const rsBgMap = colorMap.get('rs-bg')

    nodes.forEach((node) => {
      if (node.data('properties.roleStereotype')) {
        addScratch(node, 'style_rs', {
          'background-fill': "solid",
          'border-color': rsColorMap[node.data('properties.roleStereotype')] || rsColorMap['-'],
          'background-color': rsBgMap[node.data('properties.roleStereotype')] || rsBgMap['-'],
        });
      }
    });
  }

  function setFeatureStyles() {
    if (!cyInstance) return;

    const featureColorMap = colorMap.get('feature');
    const featureBgMap = colorMap.get('feature-bg')

    features?.forEach((feature) => {
      feature?.data?.properties?.feature_members.forEach((feature_member) => {
        const node = cyInstance.getElementById(feature_member);
        if (node) {
          addScratch(node, 'style_feature', {
            'background-fill': "solid",
            'background-color': featureBgMap[feature.data.id],
            'border-color': featureColorMap[feature.data.id]
          });
        }
      });
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