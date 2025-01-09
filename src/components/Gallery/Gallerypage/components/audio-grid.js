import React, { useState } from 'react';
import { Box, List, ListItem, ListItemText, IconButton, Menu, MenuItem } from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import ReactPlayer from 'react-player';
import AlertDialog from './AlertDialog';
import { deleteFileByUrl, transferFile } from '../../../../api/api';

const AudioList = ({ audios, setReload, setLoading, targetFolder }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
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

  const handleTransfer = async () => {
    setLoading(true);
    try {
      await transferFile(selectedItem, targetFolder);
      setReload(prev => !prev); // Trigger useEffect to fetch blobs
    } catch (error) {
      console.error("Error transferring file:", error);
    }
    setLoading(false);
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

  const handleDialogConfirm = (audioUrl) => {
    handleDelete(audioUrl);
    setDialogOpen(false);
    handleMenuClose();
  };

  return (
    <Box>
      <List>
        {Object.entries(audios).map(([key, url]) => (
          <ListItem key={key} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <ListItemText primary={getFileName(url)} />
            <ReactPlayer url={url} controls height="50px" />
            <IconButton onClick={(e) => handleMenuClick(e, url)}>
              <MoreVert />
            </IconButton>
          </ListItem>
        ))}
      </List>

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

export default AudioList;