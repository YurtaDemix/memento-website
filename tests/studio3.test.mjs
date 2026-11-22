import test from 'node:test';
import assert from 'node:assert/strict';
import {filmLength, maxClipLength, clipRange, videoWindow} from '../public/studio3/timeline.js';

test('final movie length stays between five and forty seconds',()=>{
  assert.equal(filmLength(400),40); assert.equal(filmLength(-5),5);
  assert.equal(filmLength(29),29);
});
test('user-picked video clip obeys movie duration',()=>{
  const chosen=clipRange(31,38,60,15);
  assert.equal(chosen.start,31);
  assert.ok(chosen.end-chosen.start<=maxClipLength(15));
  const timeline=videoWindow(15,chosen.start,chosen.end,true);
  assert.ok(timeline.start>=1.4);
  assert.ok(timeline.end<=15-1.8);
  assert.ok(Math.abs(timeline.clipLength-(chosen.end-chosen.start))<.01);
});
test('old data defaults to a safe render length',()=>{
  assert.equal(filmLength(undefined),12);
  assert.equal(videoWindow(12,0,0,false).clipLength,0);
});
