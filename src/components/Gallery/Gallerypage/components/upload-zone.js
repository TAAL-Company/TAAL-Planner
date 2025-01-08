import React from 'react';
import { Paper, Typography } from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

const UploadZone = ({ onFileUpload }) => {
  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    onFileUpload(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    onFileUpload(files);
  };

  return (
    <Paper 
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      sx={{ 
        p: 3, 
        mb: 3, 
        backgroundColor: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer'
      }}
    >
      <AddPhotoAlternateIcon sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
      <Typography color="primary">Upload Images / a folder</Typography>
      <Typography variant="body2" color="text.secondary">or drag & drop</Typography>
    </Paper>
  );
};

export default UploadZone;