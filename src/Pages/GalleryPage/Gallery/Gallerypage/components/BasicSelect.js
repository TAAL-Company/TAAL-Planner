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

export default function BasicSelect({ open, handleTransfer, folder, setTargetFolder, handleDialogCloseTransfer, folderlist }) {

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
                {"Transfer"}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    Select where you want to transfer the file
                </DialogContentText>
            </DialogContent>
            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">select</InputLabel>
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
                <Button onClick={handleDialogCloseTransfer}>Cancel</Button>
                <Button onClick={handleTransfer} autoFocus>transfer</Button>
            </DialogActions>
        </Dialog>
    );
}