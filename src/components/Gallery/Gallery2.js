import React, { useState, useEffect } from 'react';
// import '../Gallery/Gallery.css';
import { getBlobsInContainer } from '../azureBlob';
import uploadFileToBlob from '../azureBlob';
import { isStorageConfigured } from '../azureBlob';
import { FileIcon } from 'react-file-icon';
import ReactPlayer from 'react-player';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import AlertDialog from './AlertDialog';


const storageConfigured = isStorageConfigured();

function Gallery2(props) {
  const [images, setImages] = useState([]);
  const [offset, setOffset] = useState(0);
  const [sortedUrls, setSortedUrls] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('general');
  const [open, setOpen] = React.useState(false);
  const [popup, setpopup] = useState(false);

  const [urlAudio, setUrlAudio] = useState('');
  // all blobs in container
  const [blobList, setBlobList] = useState([]);
  // current file to upload into container
  const [fileSelected, setFileSelected] = useState(null);

  // UI/form management
  const [uploading, setUploading] = useState(false);
  const [inputKey, setInputKey] = useState(Math.random().toString(36));
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

      for (let i = 0; i < parts.length; i++) {
        if (parts[i] === 'images') {
          if (i + 2 < parts.length) {
            folderName = parts[i + 1];
          }
          break;
        }
      }
      if (!sortedUrls[folderName]) {
        sortedUrls[folderName] = {};
      }

      sortedUrls[folderName][key] = url;
    }

    setFolderNames(Object.keys(sortedUrls));
  }, [blobList]);

  const onFileChange = (event) => {
    // capture file into state
    setFileSelected(event.target.files[0]);
  };

  const onFileUpload = async () => {
    // prepare UI
    setUploading(true);

    // *** UPLOAD TO AZURE STORAGE ***
    const blobsInContainer = await uploadFileToBlob(fileSelected);

    // prepare UI for results
    setBlobList(blobsInContainer);

    // reset state/form
    setFileSelected(null);
    setUploading(false);
    setInputKey(Math.random().toString(36));
  };

  // display form
  const DisplayForm = () => (
    <div>
      <input type='file' onChange={onFileChange} key={inputKey || ''} />
      <button type='submit' onClick={onFileUpload}>
        Upload!
      </button>
    </div>
  );

  const getFileType = (url) => {
    const parts = url.split('.');
    const extension = parts[parts.length - 1];
    const fileType = extension.toLowerCase();

    return fileType;
  };
  // display file name and image
  const DisplayImagesFromContainer = (selectedFolder) => (

    <div className='galleryImages'>
      {console.log(sortedUrls)}
      {sortedUrls[selectedFolder] ? (
        Object.keys(sortedUrls[selectedFolder]).map((key) => {
          return (
            <div key={key}>
              <br />
              {['aac', 'mp3', 'wav'].includes(
                getFileType(sortedUrls[selectedFolder][key])
              ) ? (
                <a onClick={() => handleOpen(sortedUrls[selectedFolder][key])}>
                  <FileIcon
                    extension={getFileType(sortedUrls[selectedFolder][key])}
                  />
                </a>
              ) : (
                <img
                  key={key}
                  src={sortedUrls[selectedFolder][key]}
                  alt={`Image ${key}`}
                  height='200'
                  onClick={() => {
                    props.setPicture(sortedUrls[selectedFolder][key]);
                    setpopup(true);
                    console.log("setpopup", popup);
                    // SelectOrDeleteImagepopup()
                    // props.sethandleClose(false)
                    setGetImageUrl(sortedUrls[selectedFolder][key])
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

  // useEffect(() => {
  //   async function fetchImages() {
  //     const response = await fetch(
  //       `https://taal.tech/wp-json/wp/v2/media?per_page=100&offset=${offset}`
  //     );
  //     const data = await response.json();
  //     setImages((prevImages) => [...prevImages, ...data]);
  //   }

  //   fetchImages();
  // }, [offset]);

  // const loadMoreImages = () => {
  //   setOffset(offset + 100);
  // };

  function handleFolderClick(folderName) {
    setSelectedFolder(folderName);
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
        {folderNames.map((folderName) => (
          <button
            key={folderName}
            onClick={() => handleFolderClick(folderName)}
            style={{ marginRight: '10px' }}
          >
            {folderName}
          </button>
        ))}
      </div>
      <div>
        {/* {storageConfigured && !uploading && DisplayForm()} */}
        {/* {storageConfigured && uploading && <div>Uploading</div>} */}
        <hr />
        {storageConfigured &&
          blobList.length > 0 &&
          DisplayImagesFromContainer(selectedFolder)}
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
