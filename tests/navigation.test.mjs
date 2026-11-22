import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('hybrid build delegates legacy and studio routes without overlapping screens',()=>{
 const app=readFileSync(new URL('../dist/studio3/app.js',import.meta.url),'utf8');
 assert.match(app,/const match=location\.hash\.match\(\/\^#\\\/\(create\|archive\|edit\)/);
 assert.match(app,/base\.style\.display='none'/);
 assert.match(app,/root\.style\.display='flex'/);
 assert.match(app,/root\.style\.display='none'/);
 assert.match(app,/base\.style\.display='block'/);
 assert.match(app,/if\(section==='archive'\)await showArchive\(\)/);
});
