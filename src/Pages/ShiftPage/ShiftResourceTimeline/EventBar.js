import React from 'react';
import { Box, Typography } from '@mui/material';
import RouteIcon from '@mui/icons-material/Route';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { MS_PER_DAY, COLUMN_W } from './timelineConstants';

function EventBar({ event, anchorMs, routes, onOpen }) {
  const { shift, assignment, startMs, endMs, title } = event;

  const left  = ((startMs - anchorMs) / MS_PER_DAY) * COLUMN_W;
  const width = Math.max(18, ((endMs - startMs) / MS_PER_DAY) * COLUMN_W);

  const routeObjs = (assignment?.routeIds || [])
    .map((rid) => routes.find((r) => r.id === rid))
    .filter(Boolean);

  return (
    <Box
      onClick={(e) => onOpen(e, event)}
      sx={{
        position:        'absolute',
        left:            left,
        width:           width,
        top:             10,
        bottom:          10,
        backgroundColor: shift?.color || '#1976d2',
        borderRadius:    '6px',
        color:           'white',
        display:         'flex',
        flexDirection:   'column',
        justifyContent:  'center',
        px:              '8px',
        py:              '3px',
        overflow:        'hidden',
        cursor:          'pointer',
        userSelect:      'none',
        zIndex:          3,
        boxShadow:       '0 2px 8px rgba(0,0,0,0.18)',
        transition:      'filter 0.12s, box-shadow 0.12s',
        '&:hover':       {
          filter:     'brightness(1.12)',
          boxShadow:  '0 4px 14px rgba(0,0,0,0.26)',
          zIndex:     4,
        },
      }}
    >
      <Typography
        sx={{ fontSize: 11.5, fontWeight: 700, lineHeight: 1.25, color: 'inherit' }}
        noWrap
      >
        {title}
      </Typography>
      {width > 60 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.15 }}>
          <AccessTimeIcon sx={{ fontSize: 10, opacity: 0.7 }} />
          <Typography sx={{ fontSize: 9.5, opacity: 0.8, color: 'inherit', lineHeight: 1 }} noWrap>
            {shift?.startTime}–{shift?.endTime}
          </Typography>
        </Box>
      )}
      {width > 90 && routeObjs.length > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, mt: 0.1 }}>
          <RouteIcon sx={{ fontSize: 9, opacity: 0.65 }} />
          <Typography sx={{ fontSize: 9, opacity: 0.7, color: 'inherit' }}>
            {routeObjs.length} route{routeObjs.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default EventBar;
