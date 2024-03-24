import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {deleteFileByUrl} from '../../api/api';


export default function AlertDialog(props) {
  const [open, setOpen] = React.useState(true);

  const handleClickOpen = () => {
    props.sethandleClose(false);
  };

  const handleClose = () => {
    // setOpen(false);
    console.log("clicked", props.GetImageUrl)
    deleteFileByUrl(props.GetImageUrl)

    props.setpopup(false);
  };

  return (
    // <React.Fragment>
    //   <Button variant="outlined" onClick={handleClickOpen}>
    //     Open alert dialog
    //   </Button>
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {"Use Google's location service?"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Let Google help apps determine location. This means sending anonymous
          location data to Google, even when no apps are running.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>DELETE</Button>
        <Button onClick={handleClickOpen} autoFocus>
          Agree
        </Button>
      </DialogActions>
    </Dialog>
    // </React.Fragment>
  );
}