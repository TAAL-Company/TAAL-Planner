import React from 'react';
import { Box } from '@mui/material';

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
}

export default TabPanel;
