'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import WorkspaceShell from '@/components/workspace/WorkspaceShell';
import { createShareUrl } from '@/lib/workspace/share';
import { loadWorkspace, saveWorkspace } from '@/lib/workspace/db';
import type { WorkspaceDocument } from '@/lib/workspace/types';

const createDocument = (parentId: string | null): WorkspaceDocument => {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    title: 'Nový dokument',
    content: '',
    parentId,
    icon: '·',
    archived: false,
    published: false,
    createdAt: now,
    updatedAt: now,
  };
};

const collectSubtree = (documents: WorkspaceDocument[], id: string) => {
  const result = new Set([id]);
  const queue = [id];

  while (queue.length) {
    const current = queue.shift()!;
    for (const document of documents) {
      if (document.parentId === current && !result.has(document.id)) {
        result.add(document.id);
        queue.push(document.id);
      }
    }
  }

  return result;
};

function normalizeImportedDocuments(input: WorkspaceDocument[]): WorkspaceDocument[] {
  const ids = new Set(input.map((document) => document.id));

  return input.map((document) => ({
    ...document,
    parentId: document.parentId && ids.has(document.parentId) ? document.parentId : null,
    icon: document.icon || '·',
    title: document.title || 'Bez názvu',
    content: typeof document.content === 'string' ? document.content : '',
    archived: Boolean(document.archived),
    published: Boolean(document.published),
    createdAt: document.createdAt || new Date().toISOString(),
    updatedAt: document.updatedAt || new Date().toISOString(),
  }));
}

export default function WorkspacePage() {
  const [documents, setDocuments] = useState<WorkspaceDocument[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [ready, setReady] = useState(false);
  const saveTimer = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadWorkspace().then((loaded) => {
      if (cancelled) return;

      setDocuments(loaded);
      const requested = new URLSearchParams(window.location.search).get('id');
      const selected =
        requested && loaded.some((document) => document.id === requested)
          ? requested
          : loaded.find((document) => !document.archived)?.id ?? loaded[0]?.id ?? '';

      setSelectedId(selected);
      setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;

    if (saveTimer.current) window.clearTimeout(saveTimer.current);

    saveTimer.current = window.setTimeout(() => {
      void saveWorkspace(documents);
    }, 350);

    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [documents, ready]);

  useEffect(() => {
    if (!ready) return;

    const syncSelection = () => {
      const requested = new URLSearchParams(window.location.search).get('id');
      if (requested && documents.some((document) => document.id === requested)) {
        setSelectedId(requested);
      }
    };

    window.addEventListener('popstate', syncSelection);
    return () => window.removeEventListener('popstate', syncSelection);
  }, [documents, ready]);

  const selectDocument = useCallback((id: string) => {
    setSelectedId(id);

    const url = new URL(window.location.href);
    url.searchParams.set('id', id);
    window.history.replaceState({}, '', url);
  }, []);

  const updateDocument = useCallback((id: string, patch: Partial<WorkspaceDocument>) => {
    setDocuments((current) =>
      current.map((document) =>
        document.id === id
          ? {
              ...document,
              ...patch,
              updatedAt: new Date().toISOString(),
            }
          : document,
      ),
    );
  }, []);

  const addDocument = useCallback(
    (parentId: string | null) => {
      const next = createDocument(parentId);
      setDocuments((current) => [...current, next]);
      selectDocument(next.id);
    },
    [selectDocument],
  );

  const archiveDocument = useCallback((id: string) => {
    setDocuments((current) => {
      const subtree = collectSubtree(current, id);
      return current.map((document) =>
        subtree.has(document.id)
          ? {
              ...document,
              archived: true,
              published: false,
              updatedAt: new Date().toISOString(),
            }
          : document,
      );
    });

    setSelectedId('');
  }, []);

  const restoreDocument = useCallback((id: string) => {
    setDocuments((current) => {
      const subtree = collectSubtree(current, id);
      return current.map((document) =>
        subtree.has(document.id)
          ? {
              ...document,
              archived: false,
              updatedAt: new Date().toISOString(),
            }
          : document,
      );
    });
  }, []);

  const deleteDocument = useCallback(
    (id: string) => {
      setDocuments((current) => {
        const subtree = collectSubtree(current, id);
        return current.filter((document) => !subtree.has(document.id));
      });
      setSelectedId('');
    },
    [],
  );

  const publishDocument = useCallback((id: string, published: boolean) => {
    setDocuments((current) =>
      current.map((document) =>
        document.id === id
          ? {
              ...document,
              published,
              updatedAt: new Date().toISOString(),
            }
          : document,
      ),
    );
  }, []);

  const importDocuments = useCallback(
    (incoming: WorkspaceDocument[]) => {
      const normalized = normalizeImportedDocuments(incoming);
      setDocuments(normalized);
      selectDocument(normalized.find((document) => !document.archived)?.id ?? normalized[0]?.id ?? '');
    },
    [selectDocument],
  );

  const exportDocuments = useCallback(() => {
    const payload = {
      app: 'AKCIZUR Docs',
      version: 2,
      exportedAt: new Date().toISOString(),
      documents,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download =
      'akcizur-docs-backup-' +
      new Date().toISOString().slice(0, 10) +
      '.json';
    anchor.click();
    URL.revokeObjectURL(url);
  }, [documents]);

  const shareDocument = useCallback(
    async (document: WorkspaceDocument) => {
      const published = {
        ...document,
        published: true,
        updatedAt: new Date().toISOString(),
      };

      updateDocument(document.id, {
        published: true,
        updatedAt: published.updatedAt,
      });

      return createShareUrl(published);
    },
    [updateDocument],
  );

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] text-sm text-white/40">
        Načítám workspace…
      </main>
    );
  }

  return (
    <WorkspaceShell
      documents={documents}
      selectedId={selectedId}
      onSelect={selectDocument}
      onCreate={addDocument}
      onUpdate={updateDocument}
      onArchive={archiveDocument}
      onRestore={restoreDocument}
      onDelete={deleteDocument}
      onPublish={publishDocument}
      onImport={importDocuments}
      onExport={exportDocuments}
      onShare={shareDocument}
    />
  );
}
