import React, { useState } from 'react';
import {
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  FolderOutlined,
  ImageOutlined,
  AudiotrackOutlined
} from '@mui/icons-material';

const SidebarNav = ({ folderNames, sortedUrls, onFolderSelect, setSelectedType, showaudio, showimage }) => {
  const [openFolder, setOpenFolder] = useState(null);

  const handleFolderClick = (folderName) => {
    setOpenFolder(openFolder === folderName ? null : folderName);
  };

  const handleTypeClick = (folderName, type) => {
    onFolderSelect(folderName);
    setSelectedType(type);
  };

  return (
    <Paper
      sx={{
        width: 240,
        backgroundColor: '#002144',
        color: 'white',
        overflowY: 'auto',
      }}
    >
      <Typography variant="h6" sx={{ p: 2 }}>Gallery</Typography>
      <List>
        {folderNames.map((folderName) => (
          <React.Fragment key={folderName}>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleFolderClick(folderName)}>
                <ListItemIcon sx={{ color: 'white' }}>
                  <FolderOutlined />
                </ListItemIcon>
                <ListItemText primary={folderName} />
                {openFolder === folderName ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            {openFolder === folderName && (
              <List component="div" disablePadding>
                {(showimage && Object.keys(sortedUrls[folderName]).includes('pictures')) ||
                  (showaudio && Object.keys(sortedUrls[folderName]).includes('audio')) ? (
                  Object.keys(sortedUrls[folderName]).map((type) => {
                    if ((type === 'pictures' && showimage) || (type === 'audio' && showaudio)) {
                      return (
                        <ListItemButton
                          key={type}
                          sx={{ pl: 4 }}
                          onClick={() => handleTypeClick(folderName, type)}
                        >
                          <ListItemIcon sx={{ color: 'white' }}>
                            {type === 'pictures' ? (
                              <ImageOutlined />
                            ) : (
                              <AudiotrackOutlined />
                            )}
                          </ListItemIcon>
                          <ListItemText primary={type} />
                        </ListItemButton>
                      );
                    } else {
                      return null;
                    }
                  })
                ) : (
                  <ListItemButton sx={{ pl: 4 }}>
                    <ListItemText primary="No media available" />
                  </ListItemButton>
                )}
              </List>
            )}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default SidebarNav;