import type { WorkspaceDocument } from './types';
import { WORKSPACE_STORAGE_KEY } from './types';

const DB_NAME = 'akcizur-docs';
const DB_VERSION = 1;
const STORE = 'documents';

const seed: WorkspaceDocument[] = [
  {
    id: 'welcome',
    title: 'Vítej v AKCIZUR Docs',
    content:
      'Toto je GitHub Pages-only workspace. Dokumenty se ukládají přímo v tomto prohlížeči pomocí IndexedDB. Žádný Vercel, server ani externí databáze nejsou potřeba.',
    parentId: null,
    icon: '✦',
    archived: false,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'architecture',
    title: 'Architektura',
    content:
      'Next.js + Fumadocs generují statické stránky. Workspace běží kompletně v browseru. GitHub Pages hostuje celý výstup.',
    parentId: null,
    icon: '◇',
    archived: false,
    published: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function getLegacyDocuments(): WorkspaceDocument[] | null {
  try {
    const raw = window.localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as WorkspaceDocument[]) : null;
  } catch {
    return null;
  }
}

function writeLegacyDocuments(documents: WorkspaceDocument[]) {
  try {
    window.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(documents));
  } catch {
    // Quota or privacy mode: IndexedDB remains authoritative.
  }
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error ?? new Error('IndexedDB open failed'));
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
  });
}

async function getAll(db: IDBDatabase): Promise<WorkspaceDocument[]> {
  return new Promise((resolve, reject) => {
    const request = db
      .transaction(STORE, 'readonly')
      .objectStore(STORE)
      .getAll();

    request.onerror = () => reject(request.error ?? new Error('IndexedDB read failed'));
    request.onsuccess = () => resolve((request.result as WorkspaceDocument[]) ?? []);
  });
}

async function replaceAll(db: IDBDatabase, documents: WorkspaceDocument[]): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    const store = transaction.objectStore(STORE);

    store.clear();
    for (const document of documents) store.put(document);

    transaction.onerror = () =>
      reject(transaction.error ?? new Error('IndexedDB write failed'));
    transaction.oncomplete = () => resolve();
  });
}

export async function loadWorkspace(): Promise<WorkspaceDocument[]> {
  if (typeof window === 'undefined') return seed;

  if (!window.indexedDB) {
    return getLegacyDocuments() ?? seed;
  }

  try {
    const db = await openDatabase();
    const existing = await getAll(db);

    if (existing.length > 0) {
      db.close();
      return existing.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }

    const legacy = getLegacyDocuments();
    const initial = legacy?.length ? legacy : seed;
    await replaceAll(db, initial);
    db.close();
    writeLegacyDocuments(initial);
    return initial;
  } catch {
    return getLegacyDocuments() ?? seed;
  }
}

export async function saveWorkspace(documents: WorkspaceDocument[]): Promise<void> {
  if (typeof window === 'undefined') return;

  writeLegacyDocuments(documents);

  if (!window.indexedDB) return;

  try {
    const db = await openDatabase();
    await replaceAll(db, documents);
    db.close();
  } catch {
    // localStorage fallback has already been updated.
  }
}
