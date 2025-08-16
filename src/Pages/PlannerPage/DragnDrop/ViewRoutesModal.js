import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

function ViewRoutesModal({ open, onClose, routes, onSave }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth style={{ direction: routes.language === 'English' ? 'ltr' : 'rtl' }}>
      <DialogTitle>
        {routes.language === 'English' ? 'View All Routes' : 'צפייה בכל המסלולים'}
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
          {routes.language === 'English' ? 'Close' : 'סגור'}
        </Button>
        <Button onClick={onSave} color="primary">
          {routes.language === 'English' ? 'Save Routes' : 'שמור מסלולים'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ViewRoutesModal;