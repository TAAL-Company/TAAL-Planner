import React, { useState, useEffect } from 'react';
import { Box, Backdrop, CircularProgress, Button } from '@mui/material';
import SearchBar from './Gallerypage/components/search-bar';
// import UploadZone from './components/upload-zone';
import SidebarNav from './Gallerypage/components/sidebar-nav';
import ImageGrid from './image-grid';
import AudioList from './audio-grid';
import { getBlobsInContainer } from '../../../components/azureBlob';
import { useTranslation } from 'react-i18next';

const GalleryPage = (props) => {
  const { t } = useTranslation();
  const [blobList, setBlobList] = useState({});
  const [sortedUrls, setSortedUrls] = useState({});
  const [folderNames, setFolderNames] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('pictures');
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    const fetchBlobs = async () => {
      try {
        console.log('fetching blobs');
        setLoading(true);
        setBlobList(await getBlobsInContainer());
      } catch (error) {
        console.error('Error fetching blobs:', error);
        // Optionally set an error state or show a notification
        setBlobList({});
      } finally {
        setLoading(false);
      }
    };
    fetchBlobs();
  }, [reload]);

  useEffect(() => {
    const sorted = {};

    for (const key in blobList) {
      const url = blobList[key];
      const parts = url.split('/');
      let folderName = 'general';

      const imageIndex = parts.indexOf('images');
      if (imageIndex !== -1 && imageIndex + 2 < parts.length) {
        folderName = parts[imageIndex + 1];
      }

      let fileType = getFileType(url);
      let fileTypeFolder = 'pictures';
      if (['aac', 'mp3', 'wav'].includes(fileType)) {
        fileTypeFolder = 'audio';
      }

      sorted[folderName] = sorted[folderName] || {};
      sorted[folderName][fileTypeFolder] = sorted[folderName][fileTypeFolder] || {};
      sorted[folderName][fileTypeFolder][key] = url;
    }

    setSortedUrls(sorted);

    const userRole = JSON.parse(sessionStorage.getItem('jwt'))?.role;
    if (userRole === "ADMIN") {
      setFolderNames(Object.keys(sorted));
    } else if (userRole === "STUDENT" || userRole === "EDITOR") {
      const userSites = JSON.parse(sessionStorage.getItem('jwt')).sites;
      const filteredFolders = Object.keys(sorted).filter(url =>
        userSites.some(site => site.nameInEnglish === url)
      );
      setFolderNames(filteredFolders);
    }
  }, [blobList]);

  const getFileType = (url) => {
    const extension = url.split('.').pop().toLowerCase();
    return extension;
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFolderSelect = (folder) => {
    setSelectedFolder(folder);
  };

  const getFileName = (url) => {
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  const getFilteredItems = () => {
    if (!selectedFolder || !sortedUrls[selectedFolder]) return {};

    const items = sortedUrls[selectedFolder][selectedType];
    if (!searchQuery) return items;

    return Object.fromEntries(
      Object.entries(items).filter(([key]) => {
        const url = items[key];
        const fileName = getFileName(url);
        return fileName.toLowerCase().includes(searchQuery.toLowerCase());
      }
      )
    );
  };

  return (
    <Box sx={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden', }}>
      <SidebarNav
        folderNames={folderNames}
        sortedUrls={sortedUrls}
        onFolderSelect={handleFolderSelect}
        setSelectedType={setSelectedType}
        showaudio={props.showaudio}
        showimage={props.showimage}
      />
      <Box sx={{ flexGrow: 1, p: 3, overflowY: 'scroll' }}>
        <Button onClick={() => {
          props.sethandleClose(false)
        }}>{t('GalleryPage.Close')}</Button>
        {/* <UploadZone onFileUpload={handleFileUpload} /> */}
        <SearchBar onSearch={handleSearch} />
        {selectedType === 'pictures' ? (
          <ImageGrid images={getFilteredItems()} setReload={setReload} setLoading={setLoading} folderNames={folderNames} setPicture={props.setPicture} sethandleClose={props.sethandleClose} />
        ) : (
          <AudioList audios={getFilteredItems()} setReload={setReload} setLoading={setLoading} folderNames={folderNames} setAudio={props.setPicture} sethandleClose={props.sethandleClose} />
        )}
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <CircularProgress size="10rem" color="info" />
        </Backdrop>
      </Box>
    </Box>
  );
};

export default GalleryPage;