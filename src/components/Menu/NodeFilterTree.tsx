// components/NodeFilterTree.jsx
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { Checkbox, FormControlLabel, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import {  nodeHasLabels } from '../../utils/nodeUtils';

const NodeFilterTree = ({ cyInstance, categoriesVisibility }) => {
  const [checkedMap, setCheckedMap] = useState({});

  useEffect(() => {
    if (!cyInstance) return;
    const newCheckedMap = {};
    cyInstance.nodes().forEach(node => {
      newCheckedMap[node.id()] = node.style('display') !== 'none';
    });
    setCheckedMap(newCheckedMap);
    console.log("FILTER TREE:", newCheckedMap)
  }, [categoriesVisibility, cyInstance]);

  const handleToggle = (id, checked) => {
    console.log(handleToggle)
    const node = cyInstance.getElementById(id);
    console.log(id, checked)
    node.style({ display: checked ? 'element' : 'none' });
    // if (!checked){
    //   node.addClass('hidden')
    // } else {
    //   node.removeClass('hidden')
    // }
    const parent = node.parent();
    if (parent.nonempty()) {
        // parent.removeClass('hidden')
        parent.style({
          display: 'element',
          opcity: 1,
          width: 50,
          height: 30
        });
        setCheckedMap(prev => ({ ...prev, [parent.id()]: true }));
    }

    setCheckedMap(prev => ({ ...prev, [id]: checked }));
  };

  const buildTreeData = (cy) => {
    const nodes = cy?.nodes();
    const tree = {};
    const lookup = {};

    nodes?.forEach(node => {
      const id = node.id();
      lookup[id] = { id, label: node?.data('properties')?.simpleName || id, children: [] };
    });

    nodes?.forEach(node => {
      if ((!nodeHasLabels(node, ["Structure"]) && !nodeHasLabels(node, ["Container"])) || node.id() == "java.lang.String") return
      const id = node.id();
      const parent = node.parent()?.id();

      if (parent && lookup[parent]) {
        lookup[parent].children.push(lookup[id]);
      } else {
        tree[id] = lookup[id];
      }
    });

    return Object.values(tree);
  };

const renderTree = (nodeData) => {
  const isChecked = checkedMap[nodeData.id] ?? true;

  return (
  <><Typography variant="subtitle1">Node Visibility</Typography>
  <TreeItem key={nodeData.id} itemId={nodeData.id} label={
    <FormControlLabel
      control={
        <Checkbox
          size="small"
          checked={isChecked}
          onChange={(e) => handleToggle(nodeData.id, e.target.checked)}
          onClick={(e) => e.stopPropagation()}
        />
      }
      label={nodeData.label}
    />
  }>
    {nodeData.children?.map(child => renderTree(child))}
  </TreeItem>
  </>
  )
}

  const treeData = buildTreeData(cyInstance);

  return (
    <SimpleTreeView
      multiSelect
      sx={{
        '& .MuiTreeItem-content': {
          minHeight: '28px',
          py: 0,
        }
      }}
    >
      {treeData.map(node => renderTree(node))}
    </SimpleTreeView>
  );
};

export default NodeFilterTree;
