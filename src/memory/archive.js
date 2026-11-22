function openArchive() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('memento', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('memories', { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function transact(mode, operation) {
  const database = await openArchive();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction('memories', mode);
      const request = operation(transaction.objectStore('memories'));
      transaction.oncomplete = () => resolve(request.result);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
}

export async function listMemories() {
  const memories = await transact('readonly', store => store.getAll());
  return memories.sort((left, right) => right.createdAt - left.createdAt);
}

export function saveMemory(memory) {
  return transact('readwrite', store => store.add(memory));
}

export function deleteMemory(id) {
  return transact('readwrite', store => store.delete(id));
}
