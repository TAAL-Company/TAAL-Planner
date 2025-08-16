import React, { useState, useEffect } from 'react';
import '../Gallery/Gallery.css';
import { BlobServiceClient } from '@azure/storage-blob';
import { getBlobsInContainer } from '../azureBlob';
import uploadFileToBlob from '../azureBlob';
import { isStorageConfigured } from '../azureBlob';
import { FileIcon, defaultStyles } from 'react-file-icon';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ReactPlayer from 'react-player';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { deleteFileByUrl } from '../../api/api';

import ImageIcon from '@mui/icons-material/Image';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ButtonGroup from '@mui/material/ButtonGroup';

import { uploadFiles } from '../../api/api';
import BasicSelect from './BasicSelect';
import MediaControlCard from './MediaControlCard';

const storageConfigured = isStorageConfigured();

function Gallery(props) {
  const [images, setImages] = useState([]);
  const [imageToDelete, setImageToDelete] = useState('');
  const [offset, setOffset] = useState(0);
  const [uploadMessage, setUploadMessage] = useState('');
  const [sortedUrls, setSortedUrls] = useState([]);
  const [fileTypeFolder, setfileTypeFolder] = useState('');
  const [open, setOpen] = React.useState(false);

  const [selectedFolderType, setselectedFolderType] = useState('pictures');
  const [selectedFolder, setSelectedFolder] = useState('general');

  const [urlAudio, setUrlAudio] = useState('');
  // all blobs in container
  const [blobList, setBlobList] = useState([]);

  // current file to upload into container
  const [fileSelected, setFileSelected] = useState(null);

  // UI/form management
  const [uploading, setUploading] = useState(false);
  const [inputKey, setInputKey] = useState(Math.random().toString(36));
  const [folderNames, setFolderNames] = useState([]);

  const [Foldersite, setFoldersite] = useState('general');

  const handleOpen = (url) => {
    setOpen(true);
    setUrlAudio(url);
  };
  const handleClose = () => {
    setOpen(false);
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
    console.log("sortedUrls", Object.keys(sortedUrls));
    console.log("sortedUrls- 2", sortedUrls);

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

  const onFileUpload2 = async () => {
    // prepare UI
    setUploading(true);
    await uploadFiles(fileSelected, 'general', Foldersite);
    setUploading(false);
  };
  // display form
  // const DisplayForm = () => (
  //   <div>
  //     <input type='file' onChange={onFileChange} key={inputKey || ''} />
  //     <button type='submit' onClick={onFileUpload}>
  //       Upload!
  //     </button>
  //   </div>
  // );

  const DisplayForm = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      padding: '5px',
      width: '500px'
    }} >
      <input type='file' onChange={onFileChange} key={inputKey || ''} />
      <BasicSelect setFoldersite={setFoldersite} folderlist={folderNames} />
      <button type='submit' onClick={onFileUpload2}>
        click to Upload!
      </button>
    </div>
  );

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
                // <a onClick={() => handleOpen(sortedUrls[selectedFolder][selectedFolderType][key])}>
                //   <FileIcon
                //     extension={getFileType(sortedUrls[selectedFolder][selectedFolderType][key])}
                //   />
                // </a>

                <MediaControlCard url={sortedUrls[selectedFolder][selectedFolderType][key]}
                  setAudio={props.setAudio}
                  sethandleClose={props.sethandleClose}
                />
              ) : (
                <img
                  key={key}
                  src={sortedUrls[selectedFolder][selectedFolderType][key]}
                  alt={`Image ${key}`}
                  height='200'
                  onClick={() => {
                    setImageToDelete(sortedUrls[selectedFolder][selectedFolderType][key]);
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
  // );

  useEffect(() => {
    async function fetchImages() {
      const response = await fetch(
        `https://taal.tech/wp-json/wp/v2/media?per_page=100&offset=${offset}`
      );
      const data = await response.json();
      setImages((prevImages) => [...prevImages, ...data]);
    }

    fetchImages();
  }, [offset]);

  const loadMoreImages = () => {
    setOffset(offset + 100);
  };
  //   async function fetchImages() {
  //     const containerName = "images"; // The name of your container in Azure Blob Storage
  //     const containerClient = blobServiceClient.getContainerClient(containerName);

  //     const blobItems = [];
  //     for await (const blob of containerClient.listBlobsFlat()) {
  //       blobItems.push(blob);
  //     }

  //     return blobItems;
  //   }
  //   useEffect(() => {
  //     async function getImages() {
  //       const fetchedImages = await fetchImages();
  //       setImages(fetchedImages);
  //     }
  //     getImages();
  //   }, []);
  //   const handleUpload = async (e) => {
  //     e.preventDefault();

  //     const file = e.target.elements.file.files[0];
  //     const formData = new FormData();
  //     formData.append("file", file);
  //     formData.append("title", file.name);
  //     formData.append("caption", "Uploaded using the Gallery component");
  //     formData.append("alt_text", "Image uploaded to the Gallery");

  //     const response = await fetch(`https://taal.tech/wp-json/wp/v2/media`, {
  //       method: "POST",
  //       headers: {
  //         Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
  //       },
  //       body: formData,
  //     });
  // const data = await response.json();
  // if (response.ok) {
  //   setImages((prevImages) => [data, ...prevImages]);
  //   setUploadMessage("Image uploaded successfully!");
  // } else {
  // }

  // const containerName = "files"; // The name of your container in Azure Blob Storage
  // const containerClient = blobServiceClient.getContainerClient(containerName);
  // await containerClient.createIfNotExists({ access: "container" });

  // const blobName = formData.title;
  // const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  //     await blockBlobClient.uploadData(file);
  //   };
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
        console.log("clicked", imageToDelete)
        deleteFileByUrl(imageToDelete)
      }}>DELETE</Button>
      <h1>Gallery</h1>
      <div>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          {folderNames.map((folderName, index) => (
            <div key={folderName} style={{ flex: '1 0 21%', maxWidth: '21%' }}>
              <ButtonGroup size="small" aria-label="Large button group">
                <Button onClick={() => handleFolderClick(folderName, "pictures")}>
                  <ImageIcon />{folderName}
                </Button>
                <Button onClick={() => handleFolderClick(folderName, "audio")}>
                  <MusicNoteIcon /> {folderName}
                </Button>
              </ButtonGroup>
            </div>
          ))}
        </Box>
        {/* {folderNames.map((folderName) => (
          <div key={folderName}>
            <button onClick={() =>
              handleFolderClick(folderName, "pictures")} style={{ marginRight: '10px' }}>
              {folderName + "pictures"}
            </button>
            <button onClick={() =>
              handleFolderClick(folderName, "audio")} style={{ marginRight: '10px' }} >
              {folderName + "audio"}
            </button>
          </div>
        ))} */}
      </div>
      {/* <form onSubmit={handleUpload}>
        <input type="file" name="file" accept="image/*" required />
        <button type="submit">Upload</button>
      </form>
      {uploadMessage && <p>{uploadMessage}</p>} */}
      <div>
        {storageConfigured && !uploading && DisplayForm()}
        {storageConfigured && uploading && <div>Uploading</div>}
        <hr />
        {storageConfigured &&
          blobList.length > 0 &&
          DisplayImagesFromContainer(selectedFolder, selectedFolderType)}
        {!storageConfigured && <div>Storage is not configured.</div>}
      </div>
      {/* <div className="gallery">
        {images.map((image) => (
          <img
            className="galleryImg"
            key={image.id}
            src={image.source_url}
            alt={image.alt_text}
          />
        ))}
      </div> */}
      {/* <button className="loadMoreButton" onClick={loadMoreImages}>
        Load More Images
      </button> */}

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

export default Gallery;
