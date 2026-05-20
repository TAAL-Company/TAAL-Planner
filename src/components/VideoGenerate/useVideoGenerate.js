import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import taalLogo from '../../Pictures/loginLogoTaal.svg';
import {
  FPS,
  sleep,
  loadImageSrc,
  drawTaskFrame,
  drawFade,
  drawOutroFrame,
} from './videoCanvasUtils';
import { getMimeTypeForFormat } from './videoFormatUtils';
import { uploadVideoToAzure } from '../azureBlob';
import { updateRoute } from '../../api/api';

/**
 * Encapsulates all state and generation logic for VideoGenerateDialog.
 *
 * @param {object}   params
 * @param {Array}    params.tasks        - Full task list (must have picture_url, title, subtitle, station)
 * @param {boolean}  params.isRTL        - Whether the UI is right-to-left
 * @param {Function} params.onClose      - Dialog close callback
 * @param {string}   [params.routeId]    - Route ID used when saving the video link
 * @param {Function} [params.onVideoSaved] - Called with the uploaded video URL after saving
 */
export function useVideoGenerate({ tasks, isRTL, onClose, routeId, routeName, onVideoSaved }) {
  const { t } = useTranslation();

  const canvasRef = useRef(null);
  const videoRef  = useRef(null);

  // stage: 'settings' | 'generating' | 'preview'
  const [stage,           setStage          ] = useState('settings');
  const [progress,        setProgress       ] = useState(0);
  const [currentLabel,    setCurrentLabel   ] = useState('');
  const [error,           setError          ] = useState(null);
  const [secondsPerSlide, setSecondsPerSlide] = useState(3);
  const [fadeDuration,    setFadeDuration   ] = useState(0.4);
  const [format,          setFormat         ] = useState('mp4');
  const [videoBlob,       setVideoBlob      ] = useState(null);
  const [videoUrl,        setVideoUrl       ] = useState(null);
  const [actualExt,       setActualExt      ] = useState('mp4');

  // Save-to-cloud state
  const [isSaving,        setIsSaving       ] = useState(false);
  const [savedVideoUrl,   setSavedVideoUrl  ] = useState(null);
  const [saveError,       setSaveError      ] = useState(null);

  // Sync video element when blob URL changes
  useEffect(() => {
    if (videoRef.current && videoUrl) videoRef.current.load();
  }, [videoUrl]);

  const tasksWithImages = (tasks || []).filter((t) => t?.picture_url);

  // ── URL lifecycle ─────────────────────────────────────────────────────────

  const cleanupUrl = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
  };

  // ── Dialog handlers ───────────────────────────────────────────────────────

  const handleClose = () => {
    if (stage === 'generating') return;
    cleanupUrl();
    setStage('settings');
    setVideoBlob(null);
    setVideoUrl(null);
    setError(null);
    setSavedVideoUrl(null);
    setSaveError(null);
    onClose();
  };

  const handleReset = () => {
    cleanupUrl();
    setStage('settings');
    setVideoBlob(null);
    setVideoUrl(null);
    setError(null);
    setSavedVideoUrl(null);
    setSaveError(null);
  };

  // ── Generation ────────────────────────────────────────────────────────────

  const handleGenerate = async () => {
    if (!canvasRef.current || tasksWithImages.length === 0) return;
    cleanupUrl();
    setVideoBlob(null);
    setVideoUrl(null);
    setStage('generating');
    setProgress(0);
    setError(null);
    setCurrentLabel('');

    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');

    try {
      const { mimeType, ext } = getMimeTypeForFormat(format);
      setActualExt(ext);

      const stream   = canvas.captureStream(FPS);
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 6_000_000 });
      const chunks   = [];

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      const recordingDone = new Promise((resolve) => { recorder.onstop = resolve; });
      recorder.start(100);

      const total = tasksWithImages.length;
      for (let i = 0; i < total; i++) {
        const task = { ...tasksWithImages[i], _slideIndex: i, _slideTotal: total };
        setCurrentLabel(`${task.title} (${i + 1}/${total})`);
        setProgress(Math.round((i / total) * 90));

        const img = task.picture_url ? await loadImageSrc(task.picture_url) : null;

        // Fade-in on first slide
        if (i === 0) {
          const fadeFrames = Math.round(FPS * fadeDuration);
          for (let f = 0; f <= fadeFrames; f++) {
            drawTaskFrame(ctx, task, img, isRTL);
            drawFade(ctx, 1 - f / fadeFrames);
            await sleep(1000 / FPS);
          }
        }

        drawTaskFrame(ctx, task, img, isRTL);
        const holdMs = secondsPerSlide * 1000 - fadeDuration * 2 * 1000;
        await sleep(Math.max(holdMs, 200));

        if (i < total - 1) {
          // Cross-fade to next slide
          const nextTask = { ...tasksWithImages[i + 1], _slideIndex: i + 1, _slideTotal: total };
          const nextImg  = tasksWithImages[i + 1]?.picture_url
            ? await loadImageSrc(tasksWithImages[i + 1].picture_url)
            : null;
          const fadeFrames = Math.round(FPS * fadeDuration);
          for (let f = 0; f <= fadeFrames; f++) {
            drawTaskFrame(ctx, task,     img,     isRTL);
            ctx.globalAlpha = f / fadeFrames;
            drawTaskFrame(ctx, nextTask, nextImg, isRTL);
            ctx.globalAlpha = 1;
            await sleep(1000 / FPS);
          }
        } else {
          // Fade-out on last slide
          const fadeFrames = Math.round(FPS * fadeDuration);
          for (let f = 0; f <= fadeFrames; f++) {
            drawTaskFrame(ctx, task, img, isRTL);
            drawFade(ctx, f / fadeFrames);
            await sleep(1000 / FPS);
          }
        }
      }

      // Outro: "Made with TAAL"
      setCurrentLabel(t('VideoGenerate.rendering'));
      setProgress(92);
      const taalLogoImg = await loadImageSrc(taalLogo);
      const outroText   = t('VideoGenerate.madeWithTaal') || 'Made with TAAL';
      const oFadeFrames = Math.round(FPS * Math.max(fadeDuration, 0.3));

      for (let f = 0; f <= oFadeFrames; f++) {
        drawOutroFrame(ctx, taalLogoImg, outroText, isRTL);
        drawFade(ctx, 1 - f / oFadeFrames);
        await sleep(1000 / FPS);
      }
      drawOutroFrame(ctx, taalLogoImg, outroText, isRTL);
      await sleep(2500);
      for (let f = 0; f <= oFadeFrames; f++) {
        drawOutroFrame(ctx, taalLogoImg, outroText, isRTL);
        drawFade(ctx, f / oFadeFrames);
        await sleep(1000 / FPS);
      }

      recorder.stop();
      await recordingDone;

      setProgress(100);
      const blob = new Blob(chunks, { type: mimeType });
      const url  = URL.createObjectURL(blob);
      setVideoBlob(blob);
      setVideoUrl(url);
      setStage('preview');
    } catch (err) {
      console.error('Video generation error:', err);
      setError(err.message || 'Failed to generate video');
      setStage('settings');
    } finally {
      setProgress(0);
      setCurrentLabel('');
    }
  };

  // ── Download / share ──────────────────────────────────────────────────────

  const handleDownload = () => {
    if (!videoUrl) return;
    const a    = document.createElement('a');
    a.href     = videoUrl;
    a.download = `taal-tasks.${actualExt}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleWhatsAppShare = () => {
    if (!videoUrl) return;
    // WhatsApp Web cannot receive files via URL scheme; download first, then open chat.
    handleDownload();
    const text = encodeURIComponent(t('VideoGenerate.whatsappText') || 'Check out this TAAL task slideshow video!');
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  // ── Save to Azure & backend ───────────────────────────────────────────────

  const handleSaveToCloud = async () => {
    if (!videoBlob || !routeId) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const url = await uploadVideoToAzure(videoBlob, routeName, actualExt);
      await updateRoute(routeId, { name: routeName, video_link: url });
      setSavedVideoUrl(url);
      if (onVideoSaved) onVideoSaved(url);
    } catch (err) {
      console.error('Save to cloud error:', err);
      setSaveError(err.message || 'Failed to save video');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    // refs
    canvasRef,
    videoRef,
    // state
    stage,
    progress,
    currentLabel,
    error,
    secondsPerSlide, setSecondsPerSlide,
    fadeDuration,    setFadeDuration,
    format,          setFormat,
    videoBlob,
    videoUrl,
    actualExt,
    // save-to-cloud
    isSaving,
    savedVideoUrl,
    saveError,
    // derived
    tasksWithImages,
    // handlers
    handleClose,
    handleReset,
    handleGenerate,
    handleDownload,
    handleWhatsAppShare,
    handleSaveToCloud,
  };
}
