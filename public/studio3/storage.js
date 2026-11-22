// Version 2 adds first-class albums while keeping all version-1 memories.
export function openArchive() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('memento', 2);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('memories')) db.createObjectStore('memories', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('folders')) db.createObjectStore('folders', { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function transaction(stores, mode, cb) {
  const db = await openArchive();
  return new Promise((resolve, reject) => {
    let result;
    const tx = db.transaction(stores, mode);
    try { result = cb(tx); } catch (err) { tx.abort(); reject(err); }
    tx.oncomplete = () => { db.close(); resolve(result); };
    tx.onabort = () => { db.close(); reject(tx.error || Error('Transaction was aborted')); };
    tx.onerror = () => {}; // onabort reports the actual failure
  });
}
function getAll(store) {
  return new Promise((resolve, reject) => {
    const req = store.getAll(); req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error);
  });
}
export async function listFolders() {
  const db = await openArchive();
  try { return (await getAll(db.transaction('folders', 'readonly').objectStore('folders'))).sort((a,b) => a.name.localeCompare(b.name)); }
  finally { db.close(); }
}
export async function listMemories() {
  const db = await openArchive();
  try { return (await getAll(db.transaction('memories', 'readonly').objectStore('memories'))).sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0)); }
  finally { db.close(); }
}
export async function getMemory(id) {
  const db = await openArchive();
  try { return await new Promise((resolve, reject) => { const r = db.transaction('memories','readonly').objectStore('memories').get(id); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); }); }
  finally { db.close(); }
}
export function makeId() { return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`; }
export async function saveStory(memory, folderSettings) {
  const folders = await listFolders();
  const mode = folderSettings.mode;
  const selected = mode === 'existing' ? folders.find(f => f.id === folderSettings.id) : null;
  if (mode === 'existing' && !selected) throw Error('Selected folder no longer exists');
  const freshFolder = mode === 'new' ? {
    id: makeId(), name: String(folderSettings.name || memory.title || 'Мои воспоминания').trim().slice(0,100) || 'Мои воспоминания',
    createdAt: Date.now()
  } : null;
  const record = { ...memory, folderId: freshFolder?.id || selected?.id || null,
    folder: freshFolder?.name || selected?.name || '' };
  await transaction(['folders','memories'], 'readwrite', tx => {
    if (freshFolder) tx.objectStore('folders').add(freshFolder);
    tx.objectStore('memories').put(record);
  });
  return record;
}
export async function addFolder(name) {
  const record = { id: makeId(), name: name.trim().slice(0, 100), createdAt: Date.now() };
  if (!record.name) throw Error('Folder name is empty');
  await transaction('folders', 'readwrite', tx => tx.objectStore('folders').add(record));
  return record;
}
export async function renameFolder(id, name) {
  const clean = name.trim().slice(0,100);
  if (!clean) throw Error('Folder name is empty');
  const db = await openArchive();
  return new Promise((resolve,reject) => {
    const tx = db.transaction(['folders','memories'],'readwrite');
    const req = tx.objectStore('folders').get(id);
    req.onsuccess = () => {
      if (!req.result) { tx.abort(); return; }
      tx.objectStore('folders').put({ ...req.result, name: clean });
      const cursor = tx.objectStore('memories').openCursor();
      cursor.onsuccess = () => { const c = cursor.result; if (!c) return;
        if (c.value.folderId === id) c.update({ ...c.value, folder: clean }); c.continue(); };
    };
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onabort = () => { db.close(); reject(tx.error || Error('Folder not found')); };
  });
}
// Deleting an album never deletes its memories. They become unfiled.
export async function deleteFolder(id) {
  const db = await openArchive();
  return new Promise((resolve,reject) => {
    const tx = db.transaction(['folders','memories'],'readwrite');
    tx.objectStore('folders').delete(id);
    const cursor = tx.objectStore('memories').openCursor();
    cursor.onsuccess = () => { const c = cursor.result; if (!c) return;
      if (c.value.folderId === id) c.update({ ...c.value, folderId: null, folder: '' }); c.continue(); };
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onabort = () => { db.close(); reject(tx.error); };
  });
}
export async function deleteMemory(id) {
  await transaction('memories','readwrite', tx => tx.objectStore('memories').delete(id));
}
