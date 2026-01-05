import React from "react";
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  return (
    <>
      <Dialog
        open={props.openRemove}
        // onClose={props.handleCloseRemove}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{t(props.DialogTitle)}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {t(props.DialogContent)}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.handleCloseRemove}>{t('plannerPage.Cancel')}</Button>
          <Button onClick={props.handleCloseRemoveConfirm} autoFocus>
            {t('plannerPage.Delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
export default Modal_Delete;
