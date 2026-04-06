// Detect MP4 support once at module load time
export const mp4NativeSupport = (() => {
  try {
    return ['video/mp4;codecs=h264', 'video/mp4;codecs=avc1', 'video/mp4']
      .some((t) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t));
  } catch {
    return false;
  }
})();

/**
 * Returns { mimeType, ext, native } for the requested format.
 * Falls back to WebM when native MP4 encoding is unavailable.
 */
export function getMimeTypeForFormat(format) {
  if (format === 'mp4' && mp4NativeSupport) {
    const type = ['video/mp4;codecs=h264', 'video/mp4;codecs=avc1', 'video/mp4']
      .find((t) => MediaRecorder.isTypeSupported(t));
    return { mimeType: type || 'video/mp4', ext: 'mp4', native: true };
  }
  const type = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']
    .find((t) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t))
    || 'video/webm';
  return { mimeType: type, ext: 'webm', native: format === 'webm' };
}
