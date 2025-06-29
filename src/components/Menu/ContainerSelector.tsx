import React, { useEffect, useState } from 'react';
import { EdgeLifter } from '../../core/Headless/EdgeLifter';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography
} from '@mui/material';
import { nodeHasLabels } from '../../utils/nodeUtils';

const ContainerSelector = ({ cyInstance, analyticAspect, filterEdgeDisplay }) => {
  const [containers, setContainers] = useState([]);
  const [selectedContainer, setSelectedContainer] = useState('');

  useEffect(() => {
    if (!cyInstance) return;

    const containerList = analyticAspect.depth.containerIds
    setContainers(containerList);
  }, [cyInstance]);

  const handleChange = (event) => {
    const containerId = event.target.value;
    setSelectedContainer(containerId);
    const node = cyInstance.getElementById(containerId)
    const level = node?.data("properties")?.depth
    const edgelifter = new EdgeLifter(cyInstance)
    edgelifter.unlift(analyticAspect.depth.maxDepth)

    if (containerId === '') {
      cyInstance.nodes().forEach(node => {
        if (node.id() == "nl.tudelft.jpacman.ui") console.log("CONTAINER")
        if (!(nodeHasLabels(node, ["Structure"]) || nodeHasLabels(node, ["Container"])) || node.id() == "java.lang.String") return;
        if (nodeHasLabels(node, ["Container"])) console.log("Harusnya ke display")
        node.style('display', 'element');
      });
      filterEdgeDisplay();
      return;
    }

    edgelifter.lift(analyticAspect.depth.maxDepth, level+1)
    filterAndLiftContainer(node)
    filterEdgeDisplay()
    console.log(cyInstance.getElementById("nl.tudelft.jpacman").style())
  };

  function filterAndLiftContainer(container: cytoscape.NodeSingular): void {
    const children = container.children();
    console.log("CHILDREN of", container.id())
    children.forEach(child => console.log(child.id()))

    const getAncestors = (node: cytoscape.NodeSingular): cytoscape.NodeSingular[] => {
      const ancestors: cytoscape.NodeSingular[] = [];
      let current = node;

      while (current.parent().nonempty()) {
        const parent = current.parent()[0];
        ancestors.push(parent);
        current = parent;
      }

      return ancestors;
    };

    const visibleNodes = new Set<string>([
      container.id(),
      ...children.map(n => n.id()),
      ...getAncestors(container).map(n => n.id()),
    ]);

    console.log("VISIBLE NODES:", visibleNodes)

    cyInstance.nodes().forEach(node => {
      if (visibleNodes.has(node.id())) {
        console.log("-", node.id())
        // if (node.id() == "nl.tudelft.jpacman.ui") console.log("CONTAINER", node.id())
        node.style('display', 'element');
        if (node.isParent()) {
          node.style('width', "50px");
          node.style('height', "30px");
        }
      } else {
        node.style('display', 'none');
      }
    });
    }

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Container Focus
      </Typography>
      <FormControl fullWidth size="small">
        <Select
          value={selectedContainer}
          onChange={handleChange}
        >
          <MenuItem value="">— Show All —</MenuItem>
          {containers.map((container) => (
            <MenuItem key={container} value={container}>
              {container}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default ContainerSelector;
