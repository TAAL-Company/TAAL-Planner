import React, { useMemo } from 'react';
import { TreeView, TreeItem } from '@mui/lab';
import { ExpandMore, ChevronRight, ChevronLeft } from '@mui/icons-material';
import { styled, alpha, useTheme } from '@mui/material/styles';

const CustomTreeItem = styled(TreeItem)(({ direction, theme }) => ({
  '& .MuiTreeItem-content': {
    padding: theme.spacing(0.5, 0),
    margin:  theme.spacing(0.2, 0),

    textAlign: direction === 'rtl' ? 'right' : 'left', // Align text for RTL
  },
  '& .MuiTreeItem-iconContainer': {
    marginRight: direction === 'rtl' ? theme.spacing(1) : 0,
    marginLeft: direction === 'rtl' ? 0 : theme.spacing(1),
  },
  '& .MuiTreeItem-group': {
    marginLeft: direction === 'rtl' ? "" : 15,
    marginRight: direction === 'rtl' ? 15 : "",
    borderLeft: direction === 'rtl' ? 'none' : `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
    borderRight: direction === 'rtl' ? `1px dashed ${alpha(theme.palette.text.primary, 0.4)}` : 'none',
  },
}));

export default function BorderedTreeView({ filteredDataRoutes, renderRoute, direction }) {
  const treeData = useMemo(() => {
    const map = {};
    const roots = [];

    filteredDataRoutes.forEach((route) => {
      map[route.id] = { ...route, children: [] };
    });

    filteredDataRoutes.forEach((route) => {
      if (route.parentRouteId) {
        map[route.parentRouteId]?.children.push(map[route.id]);
      } else {
        roots.push(map[route.id]);
      }
    });

    return roots;
  }, [filteredDataRoutes]);

  const renderTreeItems = (nodes) =>
    nodes.map((node, index) => (
      <CustomTreeItem key={node.id} nodeId={node.id.toString()} label={renderRoute(node, index)} direction={direction}>
        {node.children.length > 0 && renderTreeItems(node.children)}
      </CustomTreeItem>
    ));

  return (
    <TreeView
      defaultCollapseIcon={<ExpandMore />}
      defaultExpandIcon={direction === 'rtl' ? <ChevronLeft /> : <ChevronRight />}
      sx={{
        overflowX: 'hidden',
        minHeight: 270,
        flexGrow: 1,
        maxWidth: 300,
        direction: direction, // Ensure TreeView respects the theme direction
      }}
    >
      {renderTreeItems(treeData)}
    </TreeView>
  );
}