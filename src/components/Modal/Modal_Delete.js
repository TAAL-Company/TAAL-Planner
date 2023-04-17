import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
} from "@mui/material";
//--------------------------

//--------------------------
function Modal_Delete(props) {
  return (
    <>
      <Dialog
        open={props.openRemove}
        // onClose={props.handleCloseRemove}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{props.DialogTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {props.DialogContent}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.handleCloseRemove}>cancel</Button>
          <Button onClick={props.handleCloseRemoveConfirm} autoFocus>
            מחיקה
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
export default Modal_Delete;
