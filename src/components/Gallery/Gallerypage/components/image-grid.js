import React, { useState } from 'react';
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import AlertDialog from './AlertDialog';
import { deleteFileByUrl } from '../../../../api/api';

const ImageGrid = ({ images,setReload }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleMenuClick = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleTransfer = () => {
    console.log('Transfer');
    handleMenuClose();
  };

  const handleDelete = async () => {
    await deleteFileByUrl(selectedItem);
    setReload(prev => !prev);
    handleMenuClose();
  };

  const getFileName = (url) => {
    const parts = url.split('/');
    return parts[parts.length - 1];
  };


  const handleDeleteClick = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleDialogConfirm = (imageUrl) => {
    handleDelete(imageUrl);
    setDialogOpen(false);
    handleMenuClose();
  };

  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: 2
    }}>
      {Object.entries(images).map(([key, url]) => (
        <Card key={key}>
          <CardMedia
            component="img"
            height="200"
            image={url}
            alt={key}
          />
          <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography>{getFileName(url)}</Typography>
            <IconButton onClick={(e) => handleMenuClick(e, url)}>
              <MoreVert />
            </IconButton>
          </CardContent>
        </Card>
      ))}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleTransfer}>Transfer</MenuItem>
        <MenuItem onClick={handleDeleteClick}>Delete</MenuItem>
      </Menu>

      <AlertDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onConfirm={handleDialogConfirm}
        imageUrl={selectedItem}
      />
    </Box>
  );
};

export default ImageGrid;