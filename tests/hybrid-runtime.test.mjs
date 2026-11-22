import { test } from 'node:test';
import assert from 'node:assert/strict';

// Smoke-test Studio client routing in an isolated Node realm with a minimal
// DOM + empty IndexedDB. Original React presentation is verified separately.
test('live Studio router shows original React only for home/stories, editor for create/archive', async () => {
  const handlers = {};
  const nodes = new Map();
  const createNode = () => ({style:{}, value:'', textContent:'', disabled:false, addEventListener(){}, append(){}, querySelectorAll(){return []}, querySelector(){return createNode()} });
  const root = createNode(), base=createNode();
  const classes = new Set();
  globalThis.localStorage={getItem:()=>null,setItem(){}};
  globalThis.location={hash:'#/'};
  globalThis.document={
    body:{append(){},classList:{add(x){classes.add(x)},remove(x){classes.delete(x)}}},
    createElement(){return base},
    getElementById(id){return id==='root'?root:(nodes.has(id)?nodes.get(id):nodes.set(id,createNode()).get(id))},
    querySelectorAll(){return []},
  };
  globalThis.window={addEventListener(name, cb){handlers[name]=cb},scrollTo(){}};
  const stores = new Set();
  const db = {
    objectStoreNames:{contains(n){return stores.has(n)}},
    createObjectStore(n){stores.add(n)},
    transaction(n){assert.ok(stores.has(n));return{objectStore(){return{getAll(){const req={};queueMicrotask(()=>{req.result=[];req.onsuccess?.()});return req}}}}},
    close(){}
  };
  globalThis.indexedDB={open(name,version){assert.equal(name,'memento');assert.equal(version,2);const req={};queueMicrotask(()=>{req.result=db;if(stores.size===0)req.onupgradeneeded?.();req.onsuccess?.()});return req}};
  await import('../public/studio3/app.js');
  assert.equal(base.style.display,'none');
  assert.equal(root.style.display,'flex');
  assert.ok(classes.has('is-legacy'));
  location.hash='#/archive';
  await handlers.hashchange();
  assert.equal(root.style.display,'none');
  assert.ok(base.innerHTML.includes('Твой архив'));
  assert.ok(base.innerHTML.includes('Новая папка'));
  assert.ok(classes.has('is-studio'));
  location.hash='#/create';
  await handlers.hashchange();
  assert.ok(base.innerHTML.includes('Новое воспоминание'));
  assert.ok(base.innerHTML.includes('id="v3-footage"'));
  assert.ok(base.innerHTML.includes('max="40"'));
  location.hash='#/stories/horseFolder';
  await handlers.hashchange();
  assert.equal(base.style.display,'none');
  assert.equal(root.style.display,'flex');
  assert.ok(classes.has('is-legacy'));
});
