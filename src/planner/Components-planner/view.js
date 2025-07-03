import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import { Droppable } from 'react-beautiful-dnd';
import { Frame } from './tag';
import TreeView from '@mui/lab/TreeView';
import TreeItem, { treeItemClasses } from '@mui/lab/TreeItem';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { styled } from '@mui/material/styles';

// StyledTreeItem with vertical and horizontal dashed borders
const StyledTreeItem = styled(TreeItem, {
  shouldForwardProp: (prop) => prop !== 'rootNode'
})(({ rootNode }) => {
  const borderColor = "gray";
  return {
    position: "relative",
    "&:before": {
      pointerEvents: "none",
      content: '""',
      position: "absolute",
      width: 48,        // updated from 32 to 48
      left: -16,
      top: 26,          // updated from 12 to 26
      borderBottom: !rootNode ? `1px dashed ${borderColor}` : "none"
    },
    [`& .${treeItemClasses.group}`]: {
      marginLeft: 16,
      paddingLeft: 18,
      borderLeft: `1px dashed ${borderColor}`
    }
  };
});

export default function View({ routeViewData }) {
    // Collect all node IDs for expand/collapse control
    const allNodeIds = useMemo(() => {
        let ids = [];
        routeViewData?.forEach(station => {
            ids.push(String(station.id));
            if (station.tasks) {
                station.tasks.forEach(task => ids.push(`task-${task.id}`));
            }
        });
        return ids;
    }, [routeViewData]);

    const [expanded, setExpanded] = useState(allNodeIds);

    // Update expanded nodes if data changes
    React.useEffect(() => {
        setExpanded(allNodeIds);
    }, [allNodeIds]);

    const handleToggle = (event, nodeIds) => {
        setExpanded(nodeIds);
    };

    return (
        <Droppable droppableId="routeview">
            {(provided) => (
                <Box
                    sx={{
                        flexGrow: 1,
                        p: 2,
                        bgcolor: '#f5f5f5',
                        borderRadius: 2,
                        height: '100%',
                        boxShadow: 1,
                        minHeight: '40vh',
                        overflowY: 'auto'
                    }}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                >
                    {routeViewData && routeViewData.length > 0 ? (
                        <TreeView
                            expanded={expanded}
                            onNodeToggle={handleToggle}
                            defaultCollapseIcon={<ExpandMoreIcon />}
                            defaultExpandIcon={<ChevronRightIcon />}
                        >
                            {routeViewData.map((station) => (
                                <StyledTreeItem
                                    key={station.id}
                                    nodeId={String(station.id)}
                                    label={<Frame text={station.title || station.name} color={station.color} id={station.id} />}
                                    rootNode
                                >
                                    {station.tasks && station.tasks.length > 0 && station.tasks.map((task) => (
                                        <StyledTreeItem
                                            key={task.id}
                                            nodeId={`task-${task.id}`}
                                            label={<Frame text={task.title} color={station.color} id={task.id} />}
                                        />
                                    ))}
                                </StyledTreeItem>
                            ))}
                        </TreeView>
                    ) : (
                        <Box sx={{ textAlign: 'center', color: '#aaa', mt: 4 }}>
                            גרור תחנה או משימה לכאן
                        </Box>
                    )}
                    {provided.placeholder}
                </Box>
            )}
        </Droppable>
    );
}