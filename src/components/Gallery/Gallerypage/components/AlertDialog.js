import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function AlertDialog({ open, onClose, onConfirm, imageUrl }) {
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
                {"Confirm Delete"}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    Are you sure you want to delete ?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>NO, CANCEL</Button>
                <Button onClick={handleDelete} color="primary">
                    YES, DELETE
                </Button>
            </DialogActions>
        </Dialog>
    );
}