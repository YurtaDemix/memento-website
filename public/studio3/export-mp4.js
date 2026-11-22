/**
 * Convert browser-only WebM recordings to widely playable H.264/AAC MP4.
 * This request stays on the same local MEMENTO Node server (not an AI or cloud service).
 * Modern browsers that record MP4 natively never need this endpoint.
 */
export async function phoneReadyMp4(recorded, onConvert = () => {}) {
  if (!recorded?.blob || !recorded.extension) throw Error('No recorded video');
  if (recorded.extension === 'mp4' && recorded.blob.type.includes('mp4')) {
    return { ...recorded, converted: false };
  }
  onConvert();
  let response;
  try {
    response = await fetch('/api/convert-mp4', {
      method: 'POST',
      headers: { 'Content-Type': recorded.blob.type || 'video/webm' },
      body: recorded.blob,
    });
  } catch {
    throw Error('Could not reach local MP4 converter');
  }
  if (!response.ok) {
    const message = await response.json().catch(() => null);
    const error = new Error(message?.message || `MP4 converter error (${response.status})`);
    error.code = message?.code || 'CONVERT_ERROR';
    throw error;
  }
  const blob = await response.blob();
  if (!blob.size || !response.headers.get('Content-Type')?.startsWith('video/mp4')) {
    throw Error('The converter did not return a valid MP4 response');
  }
  return { blob: new Blob([blob], { type: 'video/mp4' }), extension: 'mp4', seconds: recorded.seconds, converted: true };
}

export function safeVideoName(title, extension = 'mp4') {
  const base = String(title || 'memory').replace(/[^\p{L}\p{N}-]+/gu, '-').replace(/^-|-$/g, '').slice(0, 45) || 'memory';
  return `MEMENTO-${base}.${extension === 'mp4' ? 'mp4' : 'webm'}`;
}
