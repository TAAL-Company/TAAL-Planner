import React from 'react';
import { Paper, Typography, Button } from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

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

  const handleUploadClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (e) => {
      onFileUpload(Array.from(e.target.files));
    };
    input.click();
  };

  return (
    <Paper 
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={handleUploadClick}
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