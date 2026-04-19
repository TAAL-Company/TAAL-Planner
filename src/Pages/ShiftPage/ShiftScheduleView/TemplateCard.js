import React from 'react';
import { Box, Typography } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

function TemplateCard({ template, provided }) {
  return (
    <Box
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 1.25,
        py: 0.75,
        mb: 0.75,
        backgroundColor: template.color,
        color: 'white',
        borderRadius: 1.5,
        cursor: 'grab',
        userSelect: 'none',
        boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
        transition: 'box-shadow 0.15s',
        '&:active': { cursor: 'grabbing' },
      }}
    >
      <DragIndicatorIcon sx={{ fontSize: 15, opacity: 0.7, flexShrink: 0 }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={700} sx={{ fontSize: 11.5, lineHeight: 1.25 }}>
          {template.emoji} {template.name}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.9, fontSize: 10 }}>
          {template.startTime} – {template.endTime}
        </Typography>
      </Box>
    </Box>
  );
}

export default TemplateCard;
