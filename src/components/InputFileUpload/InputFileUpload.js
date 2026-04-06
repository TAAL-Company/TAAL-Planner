import * as React from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useNotification } from '../Notification/NotificationProvider';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();

    const { showNotification } = useNotification();
    
    const isHeic = (file) => {
        const name = file.name?.toLowerCase() ?? '';
        return name.endsWith('.heic') || name.endsWith('.heif') ||
            file.type === 'image/heic' || file.type === 'image/heif';
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // HEIC/HEIF files cannot be rendered by the browser natively,
            // so skip the dimension check and accept them directly.
            if (isHeic(file)) {
                props.setPicture(file);
                return;
            }

            const reader = new FileReader();
            const img = new Image();

            reader.onload = (event) => {
                img.src = event.target.result;
                img.onload = () => {
                    // Always set the picture
                    props.setPicture(file);
                    // Show notification if dimensions are incorrect
                    if (img.width !== 952 || img.height !== 648) {
                        showNotification('error', t('plannerPage.Image_dimensions_must_be_952x648'));
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
                direction: t('Direction'),
            }}
        >
            {props.language !== 'English' ? (
                <>
                    {t('plannerPage.Upload_from_computer')} <CloudUploadIcon />
                </>
            ) : (
                <>
                    <CloudUploadIcon />. {t('plannerPage.Upload_from_computer')}
                </>
            )}
            <VisuallyHiddenInput type="file" accept="image/*,.heic,.heif" onChange={handleFileChange} />
        </Button>
    );
}
