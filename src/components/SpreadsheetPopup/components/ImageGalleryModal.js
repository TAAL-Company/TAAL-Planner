
import React from "react";
import { Modal, Box } from "@mui/material";
import GalleryModalPopup from "../../GalleryModalPopup/GalleryModalPopup";

const ImageGalleryModal = ({
    openImageGallery,
    handleCloseImageGallery,
    handleSelectImageFromGallery
}) => {
    const style2 = {
        position: 'absolute',
        top: '5%',
        left: '5%',
        width: '90%',
        height: '90%',
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
    };

    return (
        <Modal
            open={openImageGallery}
            onClose={handleCloseImageGallery}
            aria-labelledby="audio-gallery-modal-title"
            aria-describedby="audio-gallery-modal-description"
        >
            <Box sx={style2}>
                <GalleryModalPopup sethandleClose={handleCloseImageGallery} setPicture={handleSelectImageFromGallery} showaudio={false} showimage={true}/>
            </Box>
        </Modal>
    );
};

export default ImageGalleryModal;