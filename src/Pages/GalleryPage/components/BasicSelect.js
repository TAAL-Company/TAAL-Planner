import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useTranslation } from 'react-i18next';

export default function BasicSelect({ open, handleTransfer, folder, setTargetFolder, handleDialogCloseTransfer, folderlist }) {
    const { t } = useTranslation();

    const handleClose = () => {
        setTargetFolder('');
        handleDialogCloseTransfer();
    };

    const handleChange = (event) => {
        setTargetFolder(event.target.value);
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                {t('GalleryPage.Transfer')}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {t('GalleryPage.Select_where_you_want_to_transfer_the_files')}
                </DialogContentText>
            </DialogContent>
            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">{t('GalleryPage.Select')}</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    // value={Folder}
                    value={folder}
                    label="Age"
                    onChange={handleChange}>
                    {folderlist.map((item, index) => <MenuItem key={index} value={item}>{item}</MenuItem>)}
                </Select>
            </FormControl>
            <DialogActions>
                <Button onClick={handleDialogCloseTransfer}>{t('GalleryPage.Cancel')}</Button>
                <Button onClick={handleTransfer} autoFocus>{t('GalleryPage.Transfer')}</Button>
            </DialogActions>
        </Dialog>
    );
}