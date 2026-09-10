import React, { useState, useEffect } from 'react';
import { Box, Backdrop, CircularProgress } from '@mui/material';
import SearchBar from './components/search-bar';
import UploadZone from './components/upload-zone';
import SidebarNav from './components/sidebar-nav';
import ImageGrid from './components/image-grid';
import AudioList from './components/audio-grid';
import { getBlobsInContainer } from '../../components/azureBlob';
import { uploadFiles, getingData_Tasks } from '../../api/api';

const GalleryPage = () => {
  const [blobList, setBlobList] = useState({});
  const [sortedUrls, setSortedUrls] = useState({});
  const [folderNames, setFolderNames] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('pictures');
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(false);
  const [routeTagsByUrl, setRouteTagsByUrl] = useState({});

  useEffect(() => {
    const fetchBlobs = async () => {
      console.log('fetching blobs');
      setLoading(true);
      const [blobs, tasks] = await Promise.all([getBlobsInContainer(), getingData_Tasks()]);
      setBlobList(blobs);
      setRouteTagsByUrl(buildRouteTagsByUrl(tasks));
      setLoading(false);
    };
    fetchBlobs();
  }, [reload]);

  // Maps a task's picture_url to the (deduped) names of routes it belongs to
  const buildRouteTagsByUrl = (tasks) => {
    const map = {};
    for (const task of tasks || []) {
      if (!task.picture_url) continue;
      const routeNames = [...new Set((task.routes || []).map((r) => r.route?.name).filter(Boolean))];
      if (!routeNames.length) continue;
      map[task.picture_url] = [...new Set([...(map[task.picture_url] || []), ...routeNames])];
    }
    return map;
  };


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

  const handleFileUpload = async (selectedFile) => {
    const files = Array.from(selectedFile);
    const folder = 'general';
    const site = selectedFolder
  
    if (files.length) {
      const duplicate = sortedUrls[selectedFolder][selectedType];
      for (const file of files) {
        let isDuplicate = false;
        for (const [key, value] of Object.entries(duplicate)) {
          if (file.name === getFileName(value)) {
            alert("File already exists");
            isDuplicate = true;
            break;
          }
        }
        if (isDuplicate) continue;
  
        setLoading(true);
        await uploadFiles(file, folder, site);
      }
  
      setReload(prev => !prev); // Trigger useEffect to fetch blobs
      setLoading(false);
    }
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
    <Box sx={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden', position: 'absolute' }}>
      <SidebarNav
        folderNames={folderNames}
        sortedUrls={sortedUrls}
        onFolderSelect={handleFolderSelect}
        setSelectedType={setSelectedType}
        showaudio={true}
        showimage={true}
      />
      <Box sx={{ flexGrow: 1, p: 3, overflowY: 'scroll' }}>
        <UploadZone onFileUpload={handleFileUpload} />
        <SearchBar onSearch={handleSearch} />
        {selectedType === 'pictures' ? (
          <ImageGrid images={getFilteredItems()} setReload={setReload} setLoading={setLoading} folderNames={folderNames} routeTagsByUrl={routeTagsByUrl}/>
        ) : (
          <AudioList audios={getFilteredItems()} setReload={setReload} setLoading={setLoading} folderNames={folderNames}/>
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