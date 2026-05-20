import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, LinearProgress, Slider, IconButton,
  ToggleButtonGroup, ToggleButton, Tooltip, Chip, CircularProgress,
} from '@mui/material';
import VideoFileIcon    from '@mui/icons-material/VideoFile';
import CloseIcon        from '@mui/icons-material/Close';
import DownloadIcon     from '@mui/icons-material/Download';
import WhatsAppIcon     from '@mui/icons-material/WhatsApp';
import ReplayIcon       from '@mui/icons-material/Replay';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloudUploadIcon  from '@mui/icons-material/CloudUpload';
import CheckCircleIcon  from '@mui/icons-material/CheckCircle';
import { useTranslation } from 'react-i18next';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../VideoGenerate/videoCanvasUtils';
import { mp4NativeSupport } from '../VideoGenerate/videoFormatUtils';
import { useVideoGenerate } from '../VideoGenerate/useVideoGenerate';

const DEFAULT_COLORS = {
  backgroundSecondary : '#2b2b2b',
  backgroundTertiary  : '#3a3a3a',
  text                : '#ffffff',
  textSecondary       : '#cccccc',
  textMuted           : 'gray',
  border              : '#4a4a4a',
  primary             : '#4a9eff',
  primaryHover        : '#3a8eef',
  accent              : '#ff6b35',
};

/**
 * General-purpose video-slideshow dialog.
 *
 * Props:
 *   isOpen       {boolean}  - Whether the dialog is open
 *   onClose      {Function} - Called when the dialog should close
 *   tasks        {Array}    - Task objects with { title, subtitle, picture_url, station? }
 *   theme        {object}   - Optional colour overrides (matches DEFAULT_COLORS shape)
 *   isRTL        {boolean}  - Right-to-left layout flag
 *   routeId      {string}   - Route ID; required for saving the video link to the backend
 *   onVideoSaved {Function} - Called with the uploaded Azure URL after saving (optional)
 */
export default function VideoGenerateDialog({ isOpen, onClose, tasks, theme, isRTL, routeId, routeName, onVideoSaved }) {
  const { t } = useTranslation();
  const colors = theme || DEFAULT_COLORS;

  const {
    canvasRef, videoRef,
    stage, progress, currentLabel, error,
    secondsPerSlide, setSecondsPerSlide,
    fadeDuration,    setFadeDuration,
    format,          setFormat,
    videoUrl,        actualExt,
    tasksWithImages,
    isSaving, savedVideoUrl, saveError,
    handleClose, handleReset, handleGenerate, handleDownload, handleWhatsAppShare, handleSaveToCloud,
  } = useVideoGenerate({ tasks, isRTL, onClose, routeId, routeName, onVideoSaved });

  const mp4WillFallback  = format === 'mp4' && !mp4NativeSupport;
  const estimatedSeconds = tasksWithImages.length * secondsPerSlide;

  return (
    <Dialog
      open={isOpen}
      onClose={stage !== 'generating' ? handleClose : undefined}
      maxWidth="md"
      fullWidth
      PaperProps={{
        dir: isRTL ? 'rtl' : 'ltr',
        sx: { bgcolor: colors.backgroundSecondary, color: colors.text, borderRadius: '12px' },
      }}
    >
      {/* ── Title ── */}
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <VideoFileIcon sx={{ color: colors.primary }} />
          <Typography variant="h6">
            {stage === 'preview'
              ? (t('VideoGenerate.preview') || 'Video Preview')
              : (t('VideoGenerate.title') || 'Create Slideshow Video')}
          </Typography>
          {stage === 'preview' && (
            <Chip
              label={`.${actualExt}`}
              size="small"
              sx={{ bgcolor: colors.primary, color: '#fff', fontFamily: 'monospace', fontSize: '0.75rem' }}
            />
          )}
        </Box>
        {stage !== 'generating' && (
          <IconButton onClick={handleClose} sx={{ color: colors.textMuted }}>
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {/* Off-screen canvas — always rendered so ref is stable */}
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{ display: 'none' }}
        />

        {/* ──────────── PREVIEW STAGE ──────────── */}
        {stage === 'preview' && videoUrl && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box
              sx={{
                borderRadius : '10px',
                overflow     : 'hidden',
                border       : `1px solid ${colors.border}`,
                bgcolor      : '#000',
                aspectRatio  : '16/9',
                width        : '100%',
              }}
            >
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                autoPlay
                style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: colors.textMuted, textAlign: 'center', direction: 'ltr' }}>
              {tasksWithImages.length} {t('VideoGenerate.slides')} · ~{estimatedSeconds}s · {actualExt.toUpperCase()}
            </Typography>
          </Box>
        )}

        {/* ──────────── SETTINGS STAGE ──────────── */}
        {stage === 'settings' && (
          <>
            {/* Task summary */}
            <Box sx={{ bgcolor: colors.backgroundTertiary, borderRadius: '8px', p: 2, mb: 3 }}>
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                {t('VideoGenerate.tasksIncluded', { count: tasksWithImages.length, total: tasks?.length || 0 })}
              </Typography>
              {tasksWithImages.length === 0 && (
                <Typography variant="body2" sx={{ color: colors.accent, mt: 0.5 }}>
                  {t('VideoGenerate.noImagesHint')}
                </Typography>
              )}
            </Box>

            {/* Format selector */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
                {t('VideoGenerate.format') || 'Format'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <ToggleButtonGroup
                  value={format}
                  exclusive
                  onChange={(_, v) => { if (v) setFormat(v); }}
                  size="small"
                  sx={{
                    bgcolor: colors.backgroundTertiary,
                    '& .MuiToggleButton-root': {
                      color      : colors.textSecondary,
                      borderColor: colors.border,
                      px         : 3,
                      fontWeight : 'bold',
                      '&.Mui-selected': {
                        bgcolor  : colors.primary,
                        color    : '#fff',
                        '&:hover': { bgcolor: colors.primaryHover },
                      },
                    },
                  }}
                >
                  <ToggleButton value="mp4">MP4</ToggleButton>
                  <ToggleButton value="webm">WebM</ToggleButton>
                </ToggleButtonGroup>

                {mp4WillFallback && (
                  <Tooltip title={t('VideoGenerate.mp4FallbackTooltip')}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'help' }}>
                      <InfoOutlinedIcon sx={{ fontSize: 15, color: colors.accent }} />
                      <Typography variant="caption" sx={{ color: colors.accent }}>
                        {t('VideoGenerate.savedAsWebm')}
                      </Typography>
                    </Box>
                  </Tooltip>
                )}
              </Box>
            </Box>

            {/* Seconds per slide */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
                {t('VideoGenerate.secondsPerSlide') || 'Seconds per slide'}:{' '}
                <strong style={{ color: colors.primary }}>{secondsPerSlide}s</strong>
              </Typography>
              <Slider
                value={secondsPerSlide}
                onChange={(_, v) => setSecondsPerSlide(v)}
                min={1}
                max={12}
                step={0.5}
                marks={[
                  { value: 1,  label: '1s'  },
                  { value: 3,  label: '3s'  },
                  { value: 6,  label: '6s'  },
                  { value: 12, label: '12s' },
                ]}
                sx={{ color: colors.primary, '& .MuiSlider-markLabel': { color: colors.textMuted } }}
              />
            </Box>

            {/* Fade duration */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
                {t('VideoGenerate.fadeDuration') || 'Transition fade'}:{' '}
                <strong style={{ color: colors.primary }}>{fadeDuration}s</strong>
              </Typography>
              <Slider
                value={fadeDuration}
                onChange={(_, v) => setFadeDuration(v)}
                min={0}
                max={1}
                step={0.1}
                marks={[
                  { value: 0,   label: 'none' },
                  { value: 0.5, label: '0.5s' },
                  { value: 1,   label: '1s'   },
                ]}
                sx={{ color: colors.primary, '& .MuiSlider-markLabel': { color: colors.textMuted } }}
              />
            </Box>

            {tasksWithImages.length > 0 && (
              <Typography variant="body2" sx={{ color: colors.textMuted, mb: 1, textAlign: isRTL ? 'right' : 'left' }}>
                {t('VideoGenerate.estimatedLength', { seconds: estimatedSeconds, format: mp4WillFallback ? 'WebM' : format.toUpperCase() })}
              </Typography>
            )}

            {error && (
              <Typography variant="body2" sx={{ color: colors.accent, mt: 1 }}>
                Error: {error}
              </Typography>
            )}
          </>
        )}

        {/* ──────────── GENERATING STAGE ──────────── */}
        {stage === 'generating' && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
              {currentLabel || t('VideoGenerate.rendering')}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                borderRadius                : 4,
                bgcolor                     : colors.border,
                '& .MuiLinearProgress-bar' : { bgcolor: colors.primary, borderRadius: 4 },
              }}
            />
            <Typography variant="caption" sx={{ color: colors.textMuted, mt: 0.5, display: 'block', direction: 'ltr', textAlign: isRTL ? 'right' : 'left' }}>
              {progress}%
            </Typography>
          </Box>
        )}
      </DialogContent>

      {/* ── Actions ── */}
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        {stage === 'settings' && (
          <>
            <Button onClick={handleClose} sx={{ color: colors.textMuted }}>
              {t('VideoGenerate.cancel') || 'Cancel'}
            </Button>
            <Button
              variant="contained"
              startIcon={<VideoFileIcon />}
              onClick={handleGenerate}
              disabled={tasksWithImages.length === 0}
              sx={{
                bgcolor      : colors.primary,
                '&:hover'    : { bgcolor: colors.primaryHover },
                '&:disabled' : { bgcolor: colors.border, color: colors.textMuted },
                minWidth     : '160px',
              }}
            >
              {t('VideoGenerate.generate') || 'Generate Video'}
            </Button>
          </>
        )}

        {stage === 'preview' && (
          <>
            <Button
              startIcon={<ReplayIcon />}
              onClick={handleReset}
              sx={{ color: colors.textSecondary }}
            >
              {t('VideoGenerate.regenerate') || 'Change Settings'}
            </Button>

            <Box sx={{ flex: 1 }} />

            {/* Save to Cloud */}
            {routeId && (
              savedVideoUrl ? (
                <Button
                  variant="outlined"
                  startIcon={<CheckCircleIcon />}
                  disabled
                  sx={{ color: '#4caf50', borderColor: '#4caf50', minWidth: '160px' }}
                >
                  {t('VideoGenerate.saved') || 'Saved'}
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={isSaving ? <CircularProgress size={18} color="inherit" /> : <CloudUploadIcon />}
                  onClick={handleSaveToCloud}
                  disabled={isSaving}
                  sx={{
                    color       : colors.primary,
                    borderColor : colors.primary,
                    minWidth    : '160px',
                    '&:hover'   : { bgcolor: 'rgba(74,158,255,0.1)' },
                  }}
                >
                  {isSaving
                    ? (t('VideoGenerate.saving') || 'Saving...')
                    : (t('VideoGenerate.saveToRoute') || 'Save to Route')}
                </Button>
              )
            )}

            {saveError && (
              <Typography variant="caption" sx={{ color: colors.accent, alignSelf: 'center' }}>
                {saveError}
              </Typography>
            )}

            <Button
              variant="outlined"
              startIcon={<WhatsAppIcon />}
              onClick={handleWhatsAppShare}
              sx={{
                color       : '#25D366',
                borderColor : '#25D366',
                '&:hover'   : { bgcolor: 'rgba(37,211,102,0.1)', borderColor: '#1ebe5b' },
                minWidth    : '160px',
              }}
            >
              {t('VideoGenerate.shareWhatsapp') || 'Share on WhatsApp'}
            </Button>

            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              sx={{
                bgcolor    : colors.primary,
                '&:hover'  : { bgcolor: colors.primaryHover },
                minWidth   : '160px',
              }}
            >
              {t('VideoGenerate.download') || `Download .${actualExt}`}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
