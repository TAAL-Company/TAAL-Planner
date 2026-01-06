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
import AlertDialog from './Gallerypage/components/AlertDialog';
import BasicSelect from './Gallerypage/components/BasicSelect';
import { deleteFileByUrl, transferFile } from '../../../api/api';
import { useTranslation } from 'react-i18next';

const ImageGrid = ({ images, setReload, setLoading, folderNames, setPicture, sethandleClose }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [targetFolder, setTargetFolder] = useState('');
  const [dialogOpenTransfer, setDialogOpenTransfer] = useState(false);
  const { t } = useTranslation();

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

  const handleDialogConfirm = (imageUrl) => {
    handleDelete(imageUrl);
    setDialogOpen(false);
    handleMenuClose();
  };

  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: 2
    }}>
      {Object.entries(images).map(([key, url]) => (
        <Card key={key}
        >
          <CardMedia
            component="img"
            height="200"
            image={url}
            alt={key}
            onClick={(e) => {
              console.log(url);
              setPicture(url);
              sethandleClose(false);
            }}
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

export default ImageGrid;