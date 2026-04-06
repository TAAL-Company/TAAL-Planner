// ── Canvas constants ──────────────────────────────────────────────────────────

export const CANVAS_WIDTH  = 1280;
export const CANVAS_HEIGHT = 720;
export const FPS           = 30;

// ── Generic helpers ───────────────────────────────────────────────────────────

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const loadImageSrc = (src) =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

// ── Drawing primitives ────────────────────────────────────────────────────────

/** Cover-fit: like CSS object-fit:cover */
export function drawCover(ctx, img, w, h) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const imgAspect    = iw / ih;
  const canvasAspect = w  / h;
  let sx = 0, sy = 0, sw = iw, sh = ih;
  if (imgAspect > canvasAspect) {
    sw = ih * canvasAspect;
    sx = (iw - sw) / 2;
  } else {
    sh = iw / canvasAspect;
    sy = (ih - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
}

/** Simple manual roundRect polyfill */
export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/** Wrap text into lines that fit maxWidth, return array (capped at maxLines). */
export function getWrappedLines(ctx, text, maxWidth, maxLines = 2) {
  if (!text) return [];
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
      if (lines.length >= maxLines) break;
    } else {
      line = test;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines;
}

// ── Frame renderers ───────────────────────────────────────────────────────────

/** Draw a single task frame onto the canvas. */
export function drawTaskFrame(ctx, task, img, isRTL) {
  const w = CANVAS_WIDTH;
  const h = CANVAS_HEIGHT;

  ctx.fillStyle = '#111111';
  ctx.fillRect(0, 0, w, h);

  if (img) drawCover(ctx, img, w, h);

  // Bottom gradient overlay for text legibility
  const grad = ctx.createLinearGradient(0, h * 0.42, 0, h);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.88)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Station badge (top corner)
  if (task.station) {
    const label  = task.station.toString();
    const padX   = 20;
    const badgeH = 40;
    const badgeW = 200;
    const badgeY = 24;
    const badgeX = isRTL ? w - padX - badgeW : padX;

    ctx.fillStyle = 'rgba(74, 158, 255, 0.80)';
    roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 8);
    ctx.fill();

    ctx.fillStyle   = '#ffffff';
    ctx.font        = 'bold 20px Arial, sans-serif';
    ctx.direction   = isRTL ? 'rtl' : 'ltr';
    ctx.textAlign   = isRTL ? 'right' : 'left';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur  = 0;
    const labelX    = isRTL ? (badgeX + badgeW - 14) : (badgeX + 14);
    ctx.fillText(label, labelX, badgeY + 27);
  }

  // Task number badge (top-right / top-left)
  const numLabel  = `${(task._slideIndex || 0) + 1} / ${task._slideTotal || 1}`;
  const numBadgeW = 90;
  const numBadgeH = 36;
  const numBadgeX = isRTL ? 20 : w - 20 - numBadgeW;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  roundRect(ctx, numBadgeX, 28, numBadgeW, numBadgeH, 8);
  ctx.fill();
  ctx.fillStyle = '#cccccc';
  ctx.font      = '16px Arial, sans-serif';
  ctx.direction = 'ltr';
  ctx.textAlign = 'center';
  ctx.fillText(numLabel, numBadgeX + numBadgeW / 2, 28 + 23);

  // Title
  ctx.direction   = isRTL ? 'rtl' : 'ltr';
  ctx.textAlign   = isRTL ? 'right' : 'left';
  ctx.fillStyle   = '#ffffff';
  ctx.font        = 'bold 52px Arial, sans-serif';
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur  = 10;

  const textX      = isRTL ? w - 48 : 48;
  const titleLines = getWrappedLines(ctx, task.title || '', w - 96, 2);
  const subtitleStart = h - 58;
  const titleStart    = subtitleStart - titleLines.length * 64 - 10;

  titleLines.forEach((line, i) => {
    ctx.fillText(line, textX, titleStart + i * 64);
  });

  // Subtitle
  if (task.subtitle) {
    ctx.fillStyle   = 'rgba(210,210,210,0.92)';
    ctx.font        = '30px Arial, sans-serif';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur  = 6;
    const subLines  = getWrappedLines(ctx, task.subtitle, w - 96, 2);
    subLines.forEach((line, i) => {
      ctx.fillText(line, textX, subtitleStart + i * 38);
    });
  }

  ctx.shadowBlur  = 0;
  ctx.shadowColor = 'transparent';
}

/** Draw a black fade frame with given alpha (0=transparent, 1=solid black). */
export function drawFade(ctx, alpha) {
  ctx.fillStyle = `rgba(0,0,0,${alpha})`;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

/** Draw the "Made with TAAL" outro frame. */
export function drawOutroFrame(ctx, logoImg, text, isRTL) {
  const w = CANVAS_WIDTH;
  const h = CANVAS_HEIGHT;

  ctx.fillStyle = '#0d1117';
  ctx.fillRect(0, 0, w, h);

  const glow = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, 380);
  glow.addColorStop(0, 'rgba(74,158,255,0.10)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  const maxSize = 260;
  const ar = logoImg ? logoImg.naturalWidth / logoImg.naturalHeight : 1;
  const lw = ar > 1 ? maxSize : maxSize * ar;
  const lh = ar > 1 ? maxSize / ar : maxSize;

  if (logoImg) {
    ctx.drawImage(logoImg, (w - lw) / 2, h / 2 - lh / 2 - 55, lw, lh);
  }

  ctx.font        = 'bold 44px Arial, sans-serif';
  ctx.fillStyle   = '#ffffff';
  ctx.textAlign   = 'center';
  ctx.direction   = isRTL ? 'rtl' : 'ltr';
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur  = 10;
  ctx.fillText(text, w / 2, h / 2 + lh / 2 - 55 + 82);
  ctx.shadowBlur  = 0;
  ctx.shadowColor = 'transparent';
}
