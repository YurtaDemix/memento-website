import { spawn } from 'node:child_process';
import { createReadStream, createWriteStream, existsSync } from 'node:fs';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { Transform } from 'node:stream';

const MAX_INPUT = 120 * 1024 * 1024; // Limits memory and unexpected uploads.
const MAX_OUTPUT = 120 * 1024 * 1024;

function ffmpegExecutable(env) {
  if (env.FFMPEG_PATH) return env.FFMPEG_PATH;
  // macOS Finder shells often omit Homebrew directories from PATH.
  for (const candidate of ['/opt/homebrew/bin/ffmpeg', '/usr/local/bin/ffmpeg']) {
    if (existsSync(candidate)) return candidate;
  }
  return 'ffmpeg';
}

export function ffmpegArgs(input, output) {
  return [
    '-hide_banner', '-loglevel', 'error', '-nostdin', '-y', '-i', input,
    '-map', '0:v:0', '-map', '0:a?',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '24', '-pix_fmt', 'yuv420p',
    '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
    '-c:a', 'aac', '-b:a', '128k',
    '-movflags', '+faststart', '-f', 'mp4', output,
  ];
}

function failure(res, status, code, message) {
  if (res.headersSent) return res.destroy();
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(JSON.stringify({ code, message }));
}

function runFfmpeg(input, output, env, timeout = 180_000) {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegExecutable(env), ffmpegArgs(input, output), {
      timeout, windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'],
    });
    let stderr = '';
    child.stderr.on('data', buf => { stderr = (stderr + buf.toString()).slice(-1600); });
    child.on('error', reject);
    child.on('close', (code, signal) => {
      if (code === 0) resolve();
      else reject(Object.assign(Error(stderr || `ffmpeg exit ${code ?? signal}`), {code:'TRANSCODE_FAILED'}));
    });
  });
}

/** Accepts a local WebM blob and returns an MP4 attachment for smartphones. */
export async function handleMp4Request(req, res, env = process.env) {
  if (req.method !== 'POST') return failure(res, 405, 'METHOD', 'Use POST');
  if (!(req.headers['content-type'] || '').startsWith('video/webm')) {
    return failure(res, 415, 'FORMAT', 'Expected a WebM video recording');
  }
  if (Number(req.headers['content-length'] || 0) > MAX_INPUT) {
    return failure(res, 413, 'TOO_LARGE', 'Video is too large for MP4 conversion');
  }
  const dir = await mkdtemp(path.join(os.tmpdir(), 'memento-mp4-'));
  const src = path.join(dir, 'source.webm');
  const dest = path.join(dir, 'MEMENTO.mp4');
  try {
    let bytes = 0;
    const limit = new Transform({ transform(chunk, enc, cb) {
      bytes += chunk.length;
      if (bytes > MAX_INPUT) cb(Object.assign(Error('File exceeds 120 MB'), { code: 'TOO_LARGE' }));
      else cb(null, chunk);
    } });
    try { await pipeline(req, limit, createWriteStream(src)); }
    catch (err) { return failure(res, err.code === 'TOO_LARGE' ? 413 : 400, err.code || 'UPLOAD_ERROR', err.message); }
    if (!bytes) return failure(res, 400, 'EMPTY', 'Recording is empty');
    try { await runFfmpeg(src, dest, env); }
    catch (err) {
      if (err.code === 'ENOENT') return failure(res, 503, 'FFMPEG_MISSING', 'FFmpeg is not installed. On Mac, install FFmpeg with Homebrew: brew install ffmpeg. Then generate the video again.');
      return failure(res, 422, 'TRANSCODE_FAILED', 'MP4 conversion failed. Try a shorter recording or a different browser.');
    }
    const { size } = await stat(dest);
    if (!size || size > MAX_OUTPUT) return failure(res, 422, 'OUTPUT_SIZE', 'MP4 output is empty or too large');
    res.writeHead(200, {
      'Content-Type': 'video/mp4',
      'Content-Disposition': 'attachment; filename="MEMENTO.mp4"',
      'Content-Length': size,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    await pipeline(createReadStream(dest), res);
  } catch (error) {
    if (!res.headersSent) failure(res, 500, 'SERVER_ERROR', 'Could not convert video');
  } finally { await rm(dir, { recursive: true, force: true }).catch(() => {}); }
}
