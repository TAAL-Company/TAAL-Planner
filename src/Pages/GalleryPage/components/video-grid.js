import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import ReactPlayer from 'react-player';
import AlertDialog from './AlertDialog';
import BasicSelect from './BasicSelect';
import { deleteFileByUrl, transferFile } from '../../../api/api';
import { useTranslation } from 'react-i18next';

const VideoGrid = ({ videos, setReload, setLoading, folderNames }) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [targetFolder, setTargetFolder] = useState('');
  const [dialogOpenTransfer, setDialogOpenTransfer] = useState(false);

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
    handleDialogCloseTransfer();
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

  const handleTransferClick = () => {
    setDialogOpenTransfer(true);
  };

  const handleDialogCloseTransfer = () => {
    setDialogOpenTransfer(false);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleDialogConfirm = (videoUrl) => {
    handleDelete(videoUrl);
    setDialogOpen(false);
    handleMenuClose();
  };

  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: 2
    }}>
      {Object.entries(videos).map(([key, url]) => (
        <Card key={key}>
          <ReactPlayer url={url} controls width="100%" height="180px" />
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight="bold" noWrap>{getFileName(url)}</Typography>
              <IconButton onClick={(e) => handleMenuClick(e, url)}>
                <MoreVert />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      ))}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleTransferClick}>{t('GalleryPage.Transfer')}</MenuItem>
        <MenuItem onClick={handleDeleteClick}>{t('GalleryPage.Delete')}</MenuItem>
      </Menu>

      <BasicSelect
        open={dialogOpenTransfer}
        handleDialogCloseTransfer={handleDialogCloseTransfer}
        handleTransfer={handleTransfer}
        setTargetFolder={setTargetFolder}
        folderlist={folderNames}
      />

      <AlertDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onConfirm={handleDialogConfirm}
        imageUrl={selectedItem}
      />
    </Box>
  );
};

export default VideoGrid;
