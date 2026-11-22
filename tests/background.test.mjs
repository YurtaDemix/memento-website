import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

for (const file of ['public/studio3/style.css', 'dist/studio3/style.css']) {
  test(`${file}: paper texture is a subtle overlay, not an opaque background`, () => {
    const css = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
    assert.match(css, /body\{margin:0;background:#f6efe2\}/);
    assert.match(css, /body::before\s*\{/);
    assert.match(css, /opacity:\.12/);
    assert.match(css, /pointer-events:none/);
    assert.doesNotMatch(css, /background:#f6efe2 url\('\/studio3\/paper\.png'\)/);
    assert.doesNotMatch(css, /background-size:460px/);
  });
}
