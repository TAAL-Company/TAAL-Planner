import { Box, Paper, Typography } from '@mui/material';
import React from 'react';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export const Frame = ({ text, color, id }) => {
  return (
    <Paper
      // elevation={3}
      sx={{
        // width: "350px",
        height: '50px',
        margin: '3px',
        borderRadius: '10px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',// center the text
        boxShadow: 1
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          alignItems: 'center',
        }}
      >
        <IconButton onClick={() => console.log(id)}>
          <MoreVertIcon />
        </IconButton>
      </Box>
      <Typography>
        {text}
      </Typography>
      <Box
        sx={{
          position: 'absolute',
          width: '20px',
          height: '91px',
          top: 0,
          right: 0,
          bgcolor: color,
          borderRadius: '0px 10px 10px 0px',
        }}
      />
    </Paper>
  );
};

export default Frame;
