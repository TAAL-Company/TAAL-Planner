import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
function ViewRoutesModal({ open, onClose, routes, onSave }) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth style={{ direction: routes.language === 'English' ? 'ltr' : 'rtl' }}>
      <DialogTitle>
        {t('plannerPage.View_All_Routes')}
      </DialogTitle>
      <DialogContent>
        <ul>
          {routes.map((route, index) => (
            <li key={route.id}>
              {index + 1}. {route.name}
            </li>
          ))}
        </ul>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          {t('plannerPage.Close')}
        </Button>
        <Button onClick={onSave} color="primary">
          {t('plannerPage.Save_Routes')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ViewRoutesModal;