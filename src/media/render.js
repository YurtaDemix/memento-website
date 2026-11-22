import { animationSpeed, themeFor } from '../memory/themes';
import { getTrack } from '../memory/tracks';

const W = 540;
const H = 960;
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

function objectSource(item, disposables) {
  if (!item) return null;
  if (typeof item === 'string') return item;
  if (item instanceof Blob) {
    const url = URL.createObjectURL(item);
    disposables.push(() => URL.revokeObjectURL(url));
    return url;
  }
  return null;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function loadVideo(src) {
  return new Promise(resolve => {
    if (!src) return resolve(null);
    const el = document.createElement('video');
    el.muted = true;
    el.playsInline = true;
    el.preload = 'auto';
    let finished = false;
    const done = video => { if (!finished) { finished = true; clearTimeout(timeout); resolve(video); } };
    const timeout = setTimeout(() => done(null), 6500);
    el.onloadeddata = () => done(el);
    el.onerror = () => done(null);
    el.src = src;
    el.load();
  });
}

function roundedRect(ctx, x, y, w, h, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.fill();
}

function drawCover(ctx, img, x, y, w, h, zoom = 1, dx = 0, dy = 0) {
  if (!img || !img.videoWidth && !img.naturalWidth) return;
  const iw = img.videoWidth || img.naturalWidth;
  const ih = img.videoHeight || img.naturalHeight;
  const scale = Math.max(w / iw, h / ih) * zoom;
  const sw = w / scale; const sh = h / scale;
  const sx = clamp((iw - sw) / 2 + dx * (iw - sw) * .2, 0, Math.max(0, iw - sw));
  const sy = clamp((ih - sh) / 2 + dy * (ih - sh) * .2, 0, Math.max(0, ih - sh));
  ctx.drawImage(img, sx, sy, Math.min(sw, iw), Math.min(sh, ih), x, y, w, h);
}

function linesFor(ctx, text, maxWidth, maxLines = 2) {
  const words = String(text || '').replace(/\s+/g, ' ').split(' ').filter(Boolean);
  const lines = [];
  let current = '';
  for (const word of words) {
    if (ctx.measureText((current ? current + ' ' : '') + word).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else current += (current ? ' ' : '') + word;
    if (lines.length === maxLines) break;
  }
  if (current && lines.length < maxLines) lines.push(current);
  if (lines.length === maxLines && words.length > lines.join(' ').split(' ').length) {
    let last = lines[maxLines - 1];
    while (last.length && ctx.measureText(last + '…').width > maxWidth) last = last.slice(0, -1);
    lines[maxLines - 1] = last + '…';
  }
  return lines;
}

function drawTexture(ctx, theme, tick) {
  const style = theme.texture;
  ctx.save();
  ctx.globalAlpha = .12;
  ctx.strokeStyle = theme.ink;
  ctx.fillStyle = theme.accent;
  if (style === 'grid') {
    for (let x = 25; x < W; x += 38) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 25; y < H; y += 38) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  } else if (style === 'stripes' || style === 'rain') {
    for (let x = -H; x < W + H; x += style === 'rain' ? 43 : 72) {
      ctx.lineWidth = style === 'rain' ? 2 : 12;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + H * .33, H); ctx.stroke();
    }
  } else if (style === 'confetti' || style === 'stars' || style === 'petals') {
    for (let i = 0; i < 50; i++) {
      const x = (i * 113 + 37) % W;
      const y = (i * 193 + 62) % H;
      const r = style === 'stars' ? 2 : style === 'petals' ? 5 : 4;
      ctx.fillRect(x + Math.sin(tick + i) * 3, y, r, style === 'petals' ? 11 : r);
    }
  } else if (style === 'rays') {
    ctx.translate(W / 2, 180);
    for (let i = 0; i < 20; i++) { ctx.rotate(Math.PI / 10); ctx.fillRect(-6, 60, 12, 700); }
  } else if (style === 'contours') {
    for (let i = 0; i < 14; i++) { ctx.beginPath(); ctx.ellipse(W / 2, H / 2, 60 + i * 31, 75 + i * 43, -.2, 0, Math.PI * 2); ctx.stroke(); }
  } else {
    for (let i = 0; i < 60; i++) ctx.fillRect((i * 87) % W, (i * 149) % H, 2, 2);
  }
  ctx.restore();
}

function label(ctx, text, x, y, color, size = 20) {
  ctx.fillStyle = color;
  ctx.font = `600 ${size}px system-ui, sans-serif`;
  ctx.fillText(text, x, y);
}

function titleText(ctx, text, x, y, maxWidth, color, size = 46) {
  ctx.fillStyle = color;
  ctx.font = `600 ${size}px Georgia, 'Times New Roman', serif`;
  const lines = linesFor(ctx, text, maxWidth, 3);
  lines.forEach((line, index) => ctx.fillText(line, x, y + index * (size + 9)));
}

function drawScene(ctx, memory, photos, footage, theme, seconds, duration, speed) {
  const photo = photos.length ? photos[Math.min(photos.length - 1, Math.floor(Math.max(0, seconds - 1.4) / (footage ? 3.7 : duration - 3.2) * photos.length))] : null;
  const progress = seconds / duration;
  const main = seconds > 1.4 && seconds < duration - 1.8;
  const showVideo = Boolean(footage && footage.readyState >= 2 && seconds > 5.1 && seconds < duration - 1.8);
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, W, H);
  drawTexture(ctx, theme, seconds * .25);
  ctx.save();
  // Small animation rules vary by mood + soundtrack energy.
  const drift = Math.sin(seconds * speed * 0.55) * 7;
  ctx.translate(0, drift);
  roundedRect(ctx, 26, 38, W - 52, H - 76, 13, theme.paper);
  roundedRect(ctx, 40, 51, W - 80, H - 104, 8, theme.bg);
  if (main && (photo || showVideo)) {
    ctx.save();
    const angle = theme.layout === 'collage' ? -.025 : theme.layout === 'film' ? .014 : 0;
    ctx.translate(W / 2, 407); ctx.rotate(angle);
    roundedRect(ctx, -223, -302, 446, 607, 9, theme.paper);
    ctx.beginPath(); ctx.roundRect(-208, -287, 416, 532, 5); ctx.clip();
    drawCover(ctx, showVideo ? footage : photo, -208, -287, 416, 532, 1.025 + Math.min(.09, seconds * speed * .006), Math.sin(seconds * .28), 0);
    ctx.restore();
    label(ctx, memory.date || '', 61, 742, theme.ink, 19);
    label(ctx, '✦  MEMENTO', 61, 780, theme.accent, 19);
    titleText(ctx, memory.title, 61, 821, 410, theme.ink, 31);
  } else {
    roundedRect(ctx, 73, 182, W - 146, 4, 1, theme.accent);
    label(ctx, '✦  MEMENTO · MEMORY FILM', 75, 158, theme.accent, 19);
    titleText(ctx, memory.title, 73, 323, W - 148, theme.ink, 48);
    ctx.font = '23px system-ui, sans-serif';
    const textLines = linesFor(ctx, memory.text || '', W - 152, 3);
    textLines.forEach((line, idx) => ctx.fillText(line, 76, 535 + idx * 38));
    label(ctx, memory.date || '', 76, 765, theme.ink, 22);
    label(ctx, '✧', 75, 835, theme.accent, 45);
  }
  ctx.restore();
  // Timeline is a piece of the MEMENTO design language.
  roundedRect(ctx, 55, H - 89, W - 110, 3, 1, theme.accent + '55');
  roundedRect(ctx, 55, H - 89, (W - 110) * progress, 3, 1, theme.accent);
}

function recorderFormat() {
  const candidates = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
  return candidates.find(type => MediaRecorder.isTypeSupported(type)) || '';
}

/**
 * User clicks "Make video" -> create real 540x960 video on the user's device.
 * Media, including audio, remains local; the remote AI sees story text only.
 */
export async function renderMemory(memory, progress = () => {}) {
  if (typeof MediaRecorder === 'undefined' || !HTMLCanvasElement.prototype.captureStream) throw Error('Browser does not support video export');
  const cleanup = [];
  let recorder; let canvasStream; let audioContext; let audioNode; let footage;
  try {
    const photoItems = memory.photos?.length ? memory.photos : [memory.photo];
    const photoSources = photoItems.slice(0, 5).map(item => objectSource(item, cleanup)).filter(Boolean);
    if (!photoSources.length) throw Error('Please add a photo before exporting');
    const videoSource = Array.isArray(memory.footage) ? memory.footage[0] : memory.footage;
    const footageSrc = objectSource(videoSource, cleanup);
    const track = getTrack(memory.trackId);
    const audioSrc = objectSource(memory.music || track.src, cleanup);
    const theme = themeFor(memory.mood);
    const speed = animationSpeed(memory.mood, track);
    // Unlock Web Audio during the user-initiated click, before decoding media.
    if (audioSrc && (window.AudioContext || window.webkitAudioContext)) {
      try { audioContext = new (window.AudioContext || window.webkitAudioContext)(); await audioContext.resume(); }
      catch { audioContext = null; }
    }
    const photos = await Promise.all(photoSources.map(loadImage));
    footage = footageSrc ? await loadVideo(footageSrc) : null;
    const duration = footage ? 13 : 9;

    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw Error('Canvas unavailable');
    drawScene(ctx, memory, photos, footage, theme, 0, duration, speed);
    canvasStream = canvas.captureStream(24);
    const streams = [...canvasStream.getVideoTracks()];
    if (audioSrc && audioContext) {
      try {
        const response = await fetch(audioSrc);
        if (!response.ok) throw Error('Audio file unavailable');
        const buffer = await audioContext.decodeAudioData(await response.arrayBuffer());
        const destination = audioContext.createMediaStreamDestination();
        audioNode = audioContext.createBufferSource();
        audioNode.buffer = buffer;
        audioNode.loop = true;
        const gain = audioContext.createGain(); gain.gain.value = 0.7;
        audioNode.connect(gain).connect(destination);
        streams.push(...destination.stream.getAudioTracks());
      } catch { /* Export the video without music if the codec is unsupported. */ }
    }
    const type = recorderFormat();
    const chunks = [];
    recorder = new MediaRecorder(new MediaStream(streams), { ...(type ? { mimeType: type } : {}), videoBitsPerSecond: 1_900_000 });
    const done = new Promise((resolve, reject) => {
      recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
      recorder.onerror = () => reject(Error('Media recorder failed'));
      recorder.onstop = () => chunks.length ? resolve(new Blob(chunks, { type: recorder.mimeType || type || 'video/webm' })) : reject(Error('No video output'));
    });
    recorder.start(350);
    if (audioNode) { try { audioNode.start(0); } catch { /* Silent fallback. */ } }
    const started = performance.now();
    let videoStarted = false;
    while (true) {
      const seconds = Math.min(duration, (performance.now() - started) / 1000);
      if (footage && seconds >= 5.1 && !videoStarted) {
        videoStarted = true;
        try { footage.currentTime = 0; await footage.play(); } catch { /* Keep photo instead. */ }
      }
      drawScene(ctx, memory, photos, footage, theme, seconds, duration, speed);
      progress(Math.round(seconds / duration * 100));
      if (seconds >= duration) break;
      await new Promise(requestAnimationFrame);
    }
    recorder.stop();
    const blob = await done;
    const ext = blob.type.includes('mp4') ? 'mp4' : 'webm';
    return { blob, extension: ext, seconds: duration };
  } finally {
    try { if (recorder?.state === 'recording') recorder.stop(); } catch { /* ignore */ }
    try { audioNode?.stop(); } catch { /* ignore */ }
    try { footage?.pause(); } catch { /* ignore */ }
    try { await audioContext?.close(); } catch { /* ignore */ }
    canvasStream?.getTracks().forEach(track => track.stop());
    cleanup.forEach(fn => fn());
  }
}
