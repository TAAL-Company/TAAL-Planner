import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

/**
 * Renders a QR code locally (no external API → no CORS) onto a <canvas>
 * and overlays the logo on top.
 *
 * Props
 * ─────
 * data          {string}   – JSON/string to encode
 * size          {number}   – px size (default 500)
 * logoSrc       {string}   – logo URL (optional)
 * logoRatio     {number}   – logo width as fraction of QR size (default 0.40)
 * margin        {number}   – white padding around logo in px (default 6)
 * onEcLevelUsed {function} – called with 'H'
 */
const QRCodeWithLogo = ({
  data,
  size = 500,
  logoSrc,
  logoRatio = 0.40,
  margin = 6,
  onEcLevelUsed,
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (onEcLevelUsed) onEcLevelUsed('H');
  }, [onEcLevelUsed]);

  useEffect(() => {
    if (!data || !canvasRef.current) return;
    const canvas = canvasRef.current;

    QRCode.toCanvas(canvas, data, { width: size, errorCorrectionLevel: 'H', margin: 2 }, (err) => {
      if (err || !logoSrc) return;
      const ctx = canvas.getContext('2d');
      const logoImg = new Image();
      logoImg.onload = () => {
        const logoW = Math.round(size * logoRatio);
        const logoH = Math.round((logoImg.height / logoImg.width) * logoW);
        const logoX = Math.round((size - logoW) / 2);
        const logoY = Math.round((size - logoH) / 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(logoX - margin, logoY - margin, logoW + margin * 2, logoH + margin * 2);
        ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);
      };
      logoImg.src = logoSrc;
    });
  }, [data, size, logoSrc, logoRatio, margin]);

  if (!data) return null;
  return <canvas ref={canvasRef} style={{ display: 'block' }} />;
};

export default QRCodeWithLogo;
