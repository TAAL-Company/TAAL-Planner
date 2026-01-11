import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useTranslation } from 'react-i18next';

export default function AlertDialog({ open, onClose, onConfirm, imageUrl }) {
    const { t } = useTranslation();
    const handleDelete = () => {
        onConfirm(imageUrl);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                {t('GalleryPage.Confirm_Delete')}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {t('Are_you_sure_you_want_to_delete')}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('GalleryPage.No')}</Button>
                <Button onClick={handleDelete} color="primary">
                    {t('GalleryPage.Yes')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}