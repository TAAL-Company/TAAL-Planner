import React, { useState, useEffect } from 'react';
// import '../Gallery/Gallery.css';
import { getBlobsInContainer } from '../azureBlob';
import { isStorageConfigured } from '../azureBlob';
import { FileIcon } from 'react-file-icon';
import ReactPlayer from 'react-player';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import AlertDialog from './AlertDialog';
import ImageIcon from '@mui/icons-material/Image';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ButtonGroup from '@mui/material/ButtonGroup';

const storageConfigured = isStorageConfigured();

function Gallery2(props) {
  const [sortedUrls, setSortedUrls] = useState([]);
  const [selectedFolderType, setselectedFolderType] = useState('pictures');
  const [selectedFolder, setSelectedFolder] = useState('general');
  const [open, setOpen] = React.useState(false);
  const [popup, setpopup] = useState(false);

  const [urlAudio, setUrlAudio] = useState('');
  // all blobs in container
  const [blobList, setBlobList] = useState([]);
  // current file to upload into container
  const [folderNames, setFolderNames] = useState([]);

  const [GetImageUrl, setGetImageUrl] = useState([]);

  const handleOpen = (url) => {
    setOpen(true);
    setUrlAudio(url);
  };
  const handleClose = () => {
    setOpen(false);
    setpopup(false);
  };

  useEffect(async () => {
    // prepare UI for results
    setBlobList(await getBlobsInContainer());
  }, []);
  useEffect(() => {
    for (const key in blobList) {
      const url = blobList[key];
      const parts = url.split('/');
      let folderName = 'general';

      const imageIndex = parts.indexOf('images');
      if (imageIndex !== -1 && imageIndex + 2 < parts.length) {
        folderName = parts[imageIndex + 1];
      }

      let fileType = getFileType(url);
      let fileTypeFolder = '';

      if (['jpeg', 'png', 'jpg', 'webp'].includes(fileType)) {
        fileTypeFolder = 'pictures';
      } else if (['aac', 'mp3', 'wav'].includes(fileType)) {
        fileTypeFolder = 'audio';
      }

      sortedUrls[folderName] = sortedUrls[folderName] || {};
      sortedUrls[folderName][fileTypeFolder] = sortedUrls[folderName][fileTypeFolder] || {};
      sortedUrls[folderName][fileTypeFolder][key] = url;
    }
    if (JSON.parse(sessionStorage.getItem('jwt'))?.role === "ADMIN") {
      setFolderNames(Object.keys(sortedUrls));
    } else if (JSON.parse(sessionStorage.getItem('jwt'))?.role === "STUDENT" || JSON.parse(sessionStorage.getItem('jwt'))?.role === "EDITOR") {
      const usersites = JSON.parse(sessionStorage.getItem('jwt')).sites;
      console.log("usersites", usersites);
      const filteredSortedUrls = Object.keys(sortedUrls).filter(url => {
        console.log("url", url);
        return usersites.some(site => site.nameInEnglish === url)
      });
      console.log(filteredSortedUrls);
      setFolderNames(filteredSortedUrls);
    }
  }, [blobList]);


  const getFileType = (url) => {
    if (typeof url === 'string') {
      const parts = url.split('.');
      const extension = parts[parts.length - 1];
      const fileType = extension.toLowerCase();

      return fileType;
    } else {
      return 'unknown';
    }
  };
  // display file name and image
  const DisplayImagesFromContainer = (selectedFolder, selectedFolderType) => (
    <div className='galleryImages'>
      {sortedUrls[selectedFolder] && sortedUrls[selectedFolder][selectedFolderType] ? (
        Object.keys(sortedUrls[selectedFolder][selectedFolderType]).map((key) => {
          return (
            <div key={key}>
              <br />
              {['aac', 'mp3', 'wav'].includes(
                getFileType(sortedUrls[selectedFolder][selectedFolderType][key])
              ) ? (
                <a onClick={() => handleOpen(sortedUrls[selectedFolder][selectedFolderType][key])}>
                  <FileIcon
                    extension={getFileType(sortedUrls[selectedFolder][selectedFolderType][key])}
                  />
                </a>
              ) : (
                <img
                  key={key}
                  src={sortedUrls[selectedFolder][selectedFolderType][key]}
                  alt={`Image ${key}`}
                  height='200'
                  onClick={() => {
                    props.setPicture(sortedUrls[selectedFolder][selectedFolderType][key]);
                    setpopup(true);
                    console.log("setpopup", popup);
                    setGetImageUrl(sortedUrls[selectedFolder][selectedFolderType][key])
                  }}
                />
              )}
            </div>
          );
        })
      ) : (
        <></>
      )}
    </div>
  );

  function handleFolderClick(folderName, FolderType) {
    setSelectedFolder(folderName);
    setselectedFolderType(FolderType)
  }
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };
  return (
    <div>
      <Button onClick={() => {
        props.sethandleClose(false)
        setpopup(false)
      }}>Close</Button>
      <h1>Gallery</h1>
      <div>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <ButtonGroup size="small" aria-label="Large button group">
            {folderNames.map((folderName) => (
              <div key={folderName}>
                <Button onClick={() =>
                  handleFolderClick(folderName, "pictures")} >
                  <ImageIcon />{folderName}
                </Button>
                <Button onClick={() =>
                  handleFolderClick(folderName, "audio")}>
                  <MusicNoteIcon /> {folderName}
                </Button>
              </div>
            ))}
          </ButtonGroup>
        </Box>
      </div>
      <div>
        {/* {storageConfigured && !uploading && DisplayForm()} */}
        {/* {storageConfigured && uploading && <div>Uploading</div>} */}
        <hr />
        {storageConfigured &&
          blobList.length > 0 &&
          DisplayImagesFromContainer(selectedFolder, selectedFolderType)}
        {!storageConfigured && <div>Storage is not configured.</div>}
      </div>
      {
        popup ? <AlertDialog GetImageUrl={GetImageUrl} setpopup={setpopup} sethandleClose={props.sethandleClose} /> : <></>
      }

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <Box sx={style}>
          <div>
            <ReactPlayer
              url={urlAudio}
              width='95%'
              height='50px'
              playing={false}
              controls={true}
            />
          </div>
        </Box>
      </Modal>
    </div>
  );
}

export default Gallery2;
