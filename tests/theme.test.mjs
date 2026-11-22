import test from 'node:test';
import assert from 'node:assert/strict';
import { themes, animationSpeed } from '../src/memory/themes.js';
import { localSuggestion, validateSuggestion } from '../src/memory/analyze.js';

test('exactly 12 team-owned design themes exist', () => {
  assert.equal(Object.keys(themes).length, 12);
  for (const theme of Object.values(themes)) {
    for (const key of ['bg', 'ink', 'accent', 'paper', 'texture', 'layout', 'speed']) assert.ok(theme[key]);
  }
});
test('local analyzer works without server', () => {
  const result = localSuggestion('Спартакиада, наша победа, мы гордимся третьим местом!', 'ru', 'evening');
  assert.ok(result.title.length <= 64);
  assert.ok(Object.keys(themes).includes(result.mood));
  assert.equal(result.provider, 'local');
});
test('invalid AI moods cannot create new themes', () => {
  const fallback = localSuggestion('Тихий и уютный день', 'ru');
  const result = validateSuggestion({ title: 'Hello', mood: 'neon-chaos', detail: 'test', provider: 'ai' }, fallback);
  assert.equal(result.mood, fallback.mood);
});
test('song energy changes motion within bounded range', () => {
  const slow = animationSpeed('calm', { energy: 'low' });
  const fast = animationSpeed('calm', { energy: 'high' });
  assert.ok(slow < fast);
  assert.ok(slow >= .55 && fast <= 1.7);
});
