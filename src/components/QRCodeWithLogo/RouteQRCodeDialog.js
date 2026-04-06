import React, { useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from '@mui/material';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import DownloadIcon from '@mui/icons-material/Download';
import { useTranslation } from 'react-i18next';
import QRCodeWithLogo from '../QRCodeWithLogo/QRCodeWithLogo';

// The TAAL logo served from /public/Pictures/logo_Taal.svg
const LOGO_SRC = `${process.env.PUBLIC_URL}/Pictures/logo.jpeg`;

/**
 * Dialog that displays a scannable QR code for a route.
 *
 * Props
 * ─────
 * open   {boolean}
 * onClose {function}
 * route   {object}   – the full route object from the data-grid
 */
const RouteQRCodeDialog = ({ open, onClose, route }) => {
  const { t } = useTranslation();

  const [ecLevel, setEcLevel] = useState('H');

  const qrPayload = useMemo(() => {
    if (!route) return '';
    return String(route.id);
  }, [route]);

  const handleDownload = () => {
    const wrapper = document.getElementById('route-qr-canvas');
    if (!wrapper) return;
    const canvas = wrapper.querySelector('canvas');
    if (!canvas) return;
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-${route?.name || 'route'}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth={false} fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <QrCode2Icon />
        {t('RoutePage.QRCode') || 'Route QR Code'}
      </DialogTitle>

      <DialogContent>
        {route ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              py: 1,
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              {route.name}
            </Typography>

            {/* Wrap canvas so we can find it by id for the download */}
            <Box
              id="route-qr-canvas"
              component="span"
              sx={{ lineHeight: 0, borderRadius: 1, overflow: 'hidden', boxShadow: 2 }}
            >
              <QRCodeWithLogo
                data={qrPayload}
                size={500}
                logoSrc={LOGO_SRC}
                logoRatio={0.40}
                onEcLevelUsed={setEcLevel}
              />
            </Box>

            <Typography variant="caption" color="text.secondary" align="center">
              {t('RoutePage.QRCodeHint') || `Scan to view this route (EC: ${ecLevel})`}
            </Typography>
          </Box>
        ) : null}
      </DialogContent>

      <DialogActions>
        <Button startIcon={<DownloadIcon />} onClick={handleDownload} variant="outlined">
          {t('RoutePage.DownloadQR') || 'Download PNG'}
        </Button>
        <Button onClick={onClose}>{t('close') || 'Close'}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RouteQRCodeDialog;
