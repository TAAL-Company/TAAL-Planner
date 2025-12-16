import React, { useState, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import "./ImageUploader.css";

const MAX_FILE_SIZE = 1000000; // 1MB in bytes
const MAX_FILES = 1;

const ImageUploader = () => {
  const [files, setFiles] = useState([]);

  const onDrop = (acceptedFiles) => {
    // filter only image files
    const filteredFiles = acceptedFiles.filter((file) =>
      file.type.startsWith("image/")
    );
    if (filteredFiles.length === 0) {
      alert("Only image files are accepted!");
    } else if (filteredFiles.length > MAX_FILES) {
      alert("Cannot upload more than 1 file");
    } else {
      // check file size
      const filesUnderMaxSize = filteredFiles.filter(
        (file) => file.size <= MAX_FILE_SIZE
      );
      if (filesUnderMaxSize.length === 0) {
        alert("No files above 1MB size!");
      } else {
        setFiles(filesUnderMaxSize);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: "image/*",
  });

  const clearFiles = (e) => {
    e.preventDefault();
    setFiles([]);
  };

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isDragActive ? activeStyle : {}),
    }),
    [isDragActive]
  );

  const filePreview =
    files.length > 0 &&
    files.map((file, index) => {
      return (
        <div key={index} style={{ marginTop: "10px" }}>
          <img src={URL.createObjectURL(file)} style={{ width: "200px" }} />
          <button className="ImageXBtn" onClick={clearFiles}>
            X
          </button>
        </div>
      );
    });

  return (
    <div
      style={{
        border: "1px solid grey",
        padding: "20px",
        backgroundColor: "none",
        width: "500pxs",
        borderRadius: "56px",
        borderWidth: "5px",
      }}
    >
      <div
        className="textAreaDragNDrop"
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p>To select an image from file explorer </p>
        <p>
          <a
            onClick={() => {
              document.getElementById("fileInputImage").click();
            }}
          >
            Click Here
          </a>
        </p>
        <p>or drag a file to below </p>
      </div>
      <div {...getRootProps({ style })}>
        <input
          {...getInputProps()}
          id="fileInputImage"
          style={{ display: "none" }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isDragActive ? (
            <p>Drop the image here ...</p>
          ) : (
            <p>Drop File Here</p>
          )}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {filePreview}
      </div>
    </div>
  );
};

const baseStyle = {
  width: "100%",
  height: "100%",
  borderWidth: 2,
  borderColor: "#666",
  borderStyle: "dotted",
  borderRadius: 5,
  textAlign: "center",
  marginTop: "10px",
  paddingTop: "25px",
  paddingBottom: "25px",
};
const activeStyle = {
  borderStyle: "solid",
  borderColor: "#6c6",
  backgroundColor: "#eee",
};

export default ImageUploader;
