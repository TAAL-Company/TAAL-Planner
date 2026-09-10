import React, { useState } from 'react';
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Chip
} from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import AlertDialog from './AlertDialog';
import BasicSelect from './BasicSelect';
import { deleteFileByUrl, transferFile } from '../../../api/api'; // Adjust the import path as necessary
import { useTranslation } from 'react-i18next';

// Deterministic color per route name so the same route always gets the same tag color
const getRouteColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 45%)`;
};

const ImageGrid = ({ images, setReload, setLoading, folderNames, routeTagsByUrl }) => {
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


  // Helper to extract file name from URL
  const getFileName = (url) => {
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  // Helper to extract file extension/type
  const getFileType = (url) => {
    const name = getFileName(url);
    return name.split('.').pop().toLowerCase();
  };

  // Helper to fetch image info (size, last modified, width, height)
  const fetchImageInfo = async (url) => {
    let size = null, lastModified = null, width = null, height = null;
    try {
      const response = await fetch(url, { method: 'HEAD' });
      size = response.headers.get('content-length');
      lastModified = response.headers.get('last-modified');
    } catch {}
    // Try to get width/height by loading the image
    try {
      await new Promise((resolve, reject) => {
        const img = new window.Image();
        img.onload = function() {
          width = img.naturalWidth;
          height = img.naturalHeight;
          resolve();
        };
        img.onerror = reject;
        img.src = url;
      });
    } catch {}
    return { size, lastModified, width, height };
  };

  // Store info for each image
  const [imageInfo, setImageInfo] = useState({});

  React.useEffect(() => {
    const loadInfo = async () => {
      const entries = Object.entries(images || {});
      const infoObj = {};
      await Promise.all(entries.map(async ([key, url]) => {
        if (!imageInfo[key]) {
          const info = await fetchImageInfo(url);
          infoObj[key] = info;
        } else {
          infoObj[key] = imageInfo[key];
        }
      }));
      setImageInfo(infoObj);
    };
    if (images && Object.keys(images).length > 0) {
      loadInfo();
    }
    // eslint-disable-next-line
  }, [images]);


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
      {Object.entries(images).map(([key, url]) => {
        const info = imageInfo[key] || {};
        return (
          <Card key={key}>
            <CardMedia
              component="img"
              height="200"
              image={url}
              alt={key}
            />
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold">{getFileName(url)}</Typography>
              <Typography variant="body2">Type: {getFileType(url)}</Typography>
              <Typography variant="body2">Size: {info.size ? `${(info.size/1024).toFixed(1)} KB` : 'N/A'}</Typography>
              <Typography variant="body2">Dimensions: {info.width && info.height ? `${info.width} x ${info.height}` : 'N/A'}</Typography>
              <Typography variant="body2">Last Modified: {info.lastModified ? new Date(info.lastModified).toLocaleString() : 'N/A'}</Typography>
              {(routeTagsByUrl?.[url] || []).length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                  {routeTagsByUrl[url].map((routeName) => (
                    <Chip
                      key={routeName}
                      label={routeName}
                      size="small"
                      sx={{ backgroundColor: getRouteColor(routeName), color: '#fff' }}
                    />
                  ))}
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton onClick={(e) => handleMenuClick(e, url)}>
                  <MoreVert />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        );
      })}

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