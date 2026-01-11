import React from "react";
import { Modal, Box } from "@mui/material";
import GalleryModalPopup from "../../GalleryModalPopup/GalleryModalPopup";

const AudioGalleryModal = ({
    openAudioGallery,
    handleCloseAudioGallery,
    handleSelectAudioFromGallery
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
            open={openAudioGallery}
            onClose={handleCloseAudioGallery}
            aria-labelledby="audio-gallery-modal-title"
            aria-describedby="audio-gallery-modal-description"
        >
            <Box sx={style2}>
                <GalleryModalPopup
                    sethandleClose={handleCloseAudioGallery}
                    setPicture={handleSelectAudioFromGallery}
                    showaudio={true}
                    showimage={false}
                />
            </Box>
        </Modal>
    );
};

export default AudioGalleryModal;