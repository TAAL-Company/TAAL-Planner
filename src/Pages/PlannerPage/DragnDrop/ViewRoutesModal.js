import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import I18nHoverText from '../../../components/I18nHoverText/I18nHoverText';
function ViewRoutesModal({ open, onClose, routes, onSave }) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth style={{ direction: routes.language === 'English' ? 'ltr' : 'rtl' }}>
      <DialogTitle>
        <I18nHoverText translationKey="plannerPage.View_All_Routes">{t('plannerPage.View_All_Routes')}</I18nHoverText>
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
          <I18nHoverText translationKey="plannerPage.Close">{t('plannerPage.Close')}</I18nHoverText>
        </Button>
        <Button onClick={onSave} color="primary">
          <I18nHoverText translationKey="plannerPage.Save_Routes">{t('plannerPage.Save_Routes')}</I18nHoverText>
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ViewRoutesModal;