import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recordingFormats, makeRecorder } from '../public/studio3/render.js';
import { phoneReadyMp4, safeVideoName } from '../public/studio3/export-mp4.js';
import { ffmpegArgs } from '../server/mp4.mjs';

test('MP4 is preferred over WebM and includes mobile video/audio codecs', () => {
  assert.match(recordingFormats(true)[0], /^video\/mp4/);
  assert.match(recordingFormats(true)[0], /avc1/);
  assert.match(recordingFormats(true)[0], /mp4a\.40\.2/);
  assert.ok(recordingFormats(true).findIndex(x => x.includes('webm')) > recordingFormats(true).findIndex(x => x === 'video/mp4'));
});

test('recorder selects MP4 even if browser reports WebM also supported', () => {
  class StubRecorder {
    static isTypeSupported(mime) { return mime === 'video/mp4' || mime === 'video/webm'; }
    constructor(stream, options) { this.mimeType = options.mimeType; }
  }
  globalThis.MediaRecorder = StubRecorder;
  assert.equal(makeRecorder({}, false).mimeType, 'video/mp4');
  delete globalThis.MediaRecorder;
});

test('native browser MP4 is kept and needs no network call', async () => {
  const input = { blob:new Blob(['abcd'], {type:'video/mp4'}), extension:'mp4', seconds:20 };
  const res = await phoneReadyMp4(input);
  assert.strictEqual(res.blob, input.blob);
  assert.equal(res.extension, 'mp4');
  assert.equal(res.converted, false);
});

test('WebM conversion requests same-origin endpoint and verifies MP4 response', async () => {
  let posted = false;
  globalThis.fetch = async (uri, options) => {
    posted = true;
    assert.equal(uri, '/api/convert-mp4');
    assert.equal(options.method,'POST');
    assert.equal(options.body.type, 'video/webm');
    return new Response(new Blob(['0000ftypisom'],{type:'video/mp4'}), { headers:{ 'Content-Type':'video/mp4' } });
  };
  const result = await phoneReadyMp4({blob:new Blob(['raw'],{type:'video/webm'}),extension:'webm',seconds:30});
  assert.equal(posted,true);
  assert.equal(result.extension,'mp4');
  assert.equal(result.converted,true);
  delete globalThis.fetch;
});

test('download names have a real .mp4 extension', () => {
  assert.equal(safeVideoName('Спартакиада 2026'), 'MEMENTO-Спартакиада-2026.mp4');
  assert.equal(safeVideoName('../../file.webm'), 'MEMENTO-file-webm.mp4');
});

test('FFmpeg transcodes into widely playable H264/AAC MP4 with faststart', () => {
  const args = ffmpegArgs('a.webm','b.mp4');
  assert.ok(args.includes('libx264'));
  assert.ok(args.includes('aac'));
  assert.ok(args.includes('yuv420p'));
  assert.ok(args.includes('+faststart'));
});
