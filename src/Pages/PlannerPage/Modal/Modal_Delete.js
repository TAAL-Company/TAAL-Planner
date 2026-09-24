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
import I18nHoverText from '../../../components/I18nHoverText/I18nHoverText';
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
        <DialogTitle id="alert-dialog-title">
          <I18nHoverText translationKey={props.DialogTitle}>{t(props.DialogTitle)}</I18nHoverText>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <I18nHoverText translationKey={props.DialogContent}>{t(props.DialogContent)}</I18nHoverText>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.handleCloseRemove}><I18nHoverText translationKey="plannerPage.Cancel">{t('plannerPage.Cancel')}</I18nHoverText></Button>
          <Button onClick={props.handleCloseRemoveConfirm} autoFocus>
            <I18nHoverText translationKey="plannerPage.Delete">{t('plannerPage.Delete')}</I18nHoverText>
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
export default Modal_Delete;
