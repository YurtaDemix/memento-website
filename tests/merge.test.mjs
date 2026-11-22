import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const read=(p)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('production shell includes original React home/demo and Studio 3.3 create/archive',()=>{
 const html=read('dist/index.html');
 assert.match(html, /index-DTa2egxD\.js/);
 assert.match(html, /index-CbDkrmhS\.css/);
 assert.match(html, /studio3\/app\.js/);
 assert.match(html, /id="root"/);
});
test('original demo folders, complete media and React components preserved',()=>{
 const demo=read('src/media/demo.js');
 for(const name of ['school-morning','dombra-break','school-evening','sunset-walk','horse-ride','horse-august']) assert.match(demo,new RegExp(name));
 const stories=read('src/pages/Demo.jsx');
 assert.match(stories,/folder-grid/);
 assert.match(stories,/folderId/);
 const homepage=read('src/pages/Home.jsx');
 assert.match(homepage,/href="#\/stories"/);
 for(const file of [
  'media/school-day/dombra-break.jpg','media/school-day/the-feeling.mp3',
  'media/school-day/spartakiad.mp4', 'media/horse-ride/horse-august.mp4',
  'media/horse-ride/country-roads.mp3', 'media/horse-ride/horse-photo.jpg',
  'media/horse-ride/ride-1.mp4', 'media/horse-ride/ride-2.mp4',
 ]) assert.ok(existsSync(new URL('../dist/'+file,import.meta.url)),file);
});
test('Studio source owns only create/archive/edit, keeps MP4 and editor',()=>{
 const app=read('public/studio3/app.js');
 assert.match(app, /const section=match\?\.\[1\] \|\| 'legacy'/);
 assert.match(app, /section === 'legacy'/);
 assert.match(app, /base\.style\.display='none'/);
 assert.match(app, /root\.style\.display='flex'/);
 assert.match(app,/showArchive\(\)/);
 assert.match(app,/showEditor\(/);
 const html=read('index.html');
 assert.match(html,/src="\/src\/main\.jsx"/);
 assert.match(html,/src="\/studio3\/app\.js"/);
});

test('home / story pages preserve original background; Studio overlay remains subtle',()=>{
 const css=read('dist/studio3/style.css');
 assert.match(css,/body\.is-legacy::before\{opacity:\.17/);
 assert.match(css,/body\.is-studio::before\{opacity:\.12/);
});
