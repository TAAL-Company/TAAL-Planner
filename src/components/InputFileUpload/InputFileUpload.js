import * as React from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useNotification } from '../Notification/NotificationProvider';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

export default function InputFileUpload(props) {

    const { showNotification } = useNotification();
    
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            const img = new Image();

            reader.onload = (event) => {
                img.src = event.target.result;
                img.onload = () => {
                    // Always set the picture
                    props.setPicture(file);
                    // Show notification if dimensions are incorrect
                    if (img.width !== 952 || img.height !== 648) {
                        showNotification('error', props.language !== "English" ? 'Image dimensions must be 952x648.' : 'ממדי התמונה חייבים להיות 952*648.');
                    }
                };
            };

            reader.readAsDataURL(file);
        }
    };

    return (
        <Button
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
            style={{
                textAlign: 'right',
                height: '38px',
                direction: props.language === 'English' ? 'rtl' : 'ltr',
            }}
        >
            {props.language !== 'English' ? (
                <>
                    Upload from computer .<CloudUploadIcon />
                </>
            ) : (
                <>
                    <CloudUploadIcon />. העלה מהמחשב
                </>
            )}
            <VisuallyHiddenInput type="file" onChange={handleFileChange} />
        </Button>
    );
}
