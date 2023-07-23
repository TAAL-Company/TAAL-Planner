import React, { useState, useEffect } from "react";
import "../Gallery/Gallery.css";
import { BlobServiceClient } from "@azure/storage-blob";
import { getBlobsInContainer } from "../azureBlob";
import uploadFileToBlob from "../azureBlob";
import { isStorageConfigured } from "../azureBlob";
import { FileIcon, defaultStyles } from "react-file-icon";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import ReactPlayer from "react-player";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";

const storageConfigured = isStorageConfigured();

function Gallery(props) {
  const [images, setImages] = useState([]);
  const [offset, setOffset] = useState(0);
  const [uploadMessage, setUploadMessage] = useState("");
  const [sortedUrls, setSortedUrls] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState("general");
  const [open, setOpen] = React.useState(false);

  const [urlAudio, setUrlAudio] = useState("");
  // all blobs in container
  const [blobList, setBlobList] = useState([]);

  // current file to upload into container
  const [fileSelected, setFileSelected] = useState(null);

  // UI/form management
  const [uploading, setUploading] = useState(false);
  const [inputKey, setInputKey] = useState(Math.random().toString(36));
  const [folderNames, setFolderNames] = useState([]);

  const handleOpen = (url) => {
    console.log("url", url);
    setOpen(true);
    setUrlAudio(url);
  };
  const handleClose = () => {
    setOpen(false);
  };

  useEffect(async () => {
    console.log("blobList", blobList);

    // prepare UI for results
    setBlobList(await getBlobsInContainer());
  }, []);
  useEffect(() => {
    console.log("blobList", blobList);

    // console.log("folderNames", folderNames);

    // const sortedUrls = {};

    for (const key in blobList) {
      const url = blobList[key];
      const parts = url.split("/");
      let folderName = "general";

      for (let i = 0; i < parts.length; i++) {
        if (parts[i] === "images") {
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

    console.log("sortedUrls", sortedUrls);
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
      <input type="file" onChange={onFileChange} key={inputKey || ""} />
      <button type="submit" onClick={onFileUpload}>
        Upload!
      </button>
    </div>
  );

  const getFileType = (url) => {
    const parts = url.split(".");
    const extension = parts[parts.length - 1];
    const fileType = extension.toLowerCase();

    console.log("url: ", url);
    console.log("fileType: ", fileType);

    return fileType;
  };
  // display file name and image
  const DisplayImagesFromContainer = (selectedFolder) => (
    // sortedUrls.length === 0 ? (
    //   <div></div>
    // ) : (
    <div className="galleryImages">
      {sortedUrls[selectedFolder] ? (
        Object.keys(sortedUrls[selectedFolder]).map((key) => {
          return (
            <div key={key}>
              {/* {Path.basename(item)} */}
              <br />
              {["aac", "mp3", "wav"].includes(
                getFileType(sortedUrls[selectedFolder][key])
              ) ? (
                <a onClick={() => handleOpen(sortedUrls[selectedFolder][key])}>
                  <FileIcon
                    extension={getFileType(sortedUrls[selectedFolder][key])}
                  />
                </a>
              ) : (
                <img
                  // style={{ borderRadius: "30px" }}
                  key={key}
                  src={sortedUrls[selectedFolder][key]}
                  alt={`Image ${key}`}
                  height="200"
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
  //   console.log("yyy data", data);
  //   console.log("yyy images", images);
  //   setImages((prevImages) => [data, ...prevImages]);
  //   setUploadMessage("Image uploaded successfully!");
  // } else {
  //   console.log(data);
  // }

  // const containerName = "files"; // The name of your container in Azure Blob Storage
  // const containerClient = blobServiceClient.getContainerClient(containerName);
  // await containerClient.createIfNotExists({ access: "container" });

  // const blobName = formData.title;
  // const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  //     await blockBlobClient.uploadData(file);
  //     console.log("Image uploaded successfully.");
  //   };
  function handleFolderClick(folderName) {
    setSelectedFolder(folderName);
  }
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };
  return (
    <div>
      <h1>Gallery</h1>
      <div>
        {folderNames.map((folderName) => (
          <button
            key={folderName}
            onClick={() => handleFolderClick(folderName)}
            style={{ marginRight: "10px" }}
          >
            {folderName}
          </button>
        ))}
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
          DisplayImagesFromContainer(selectedFolder)}
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
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <div>
            <ReactPlayer
              url={urlAudio}
              width="95%"
              height="50px"
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
