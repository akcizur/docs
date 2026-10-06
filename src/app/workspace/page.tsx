'use client';

import { anyApi } from 'convex/server';
import { useMutation, useQuery } from 'convex/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import WorkspaceShell, {
  type WorkspaceDocument,
} from '@/components/workspace/WorkspaceShell';

const STORAGE_KEY = 'akcizur-docs-workspace-v1';
const CONVEX_ENABLED =
  Boolean(process.env.NEXT_PUBLIC_CONVEX_URL) &&
  Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

const seed: WorkspaceDocument[] = [
  {
    id: 'welcome',
    title: 'Vítej v AKCIZUR Docs',
    content:
      'Toto je Notion-like workspace. Obsah se ukládá lokálně; po připojení Convexu se stejný model synchronizuje realtime.',
    parentId: null,
    icon: '✦',
    archived: false,
    published: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'architecture',
    title: 'Architektura',
    content:
      'Fumadocs zůstává veřejnou dokumentací. Workspace je samostatná React vrstva a Convex běží jako externí realtime backend.',
    parentId: null,
    icon: '◇',
    archived: false,
    published: false,
    updatedAt: new Date().toISOString(),
  },
];

function makeDocument(title = 'Nový dokument', parentId: string | null = null): WorkspaceDocument {
  return {
    id: crypto.randomUUID(),
    title,
    content: '',
    parentId,
    icon: '·',
    archived: false,
    published: false,
    updatedAt: new Date().toISOString(),
  };
}

function LocalWorkspace() {
  const [documents, setDocuments] = useState<WorkspaceDocument[]>([]);
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as WorkspaceDocument[]) : seed;
      setDocuments(parsed);
      const fromUrl = new URLSearchParams(window.location.search).get('id');
      setSelectedId(
        fromUrl && parsed.some((doc) => doc.id === fromUrl) ? fromUrl : parsed[0]?.id ?? '',
      );
    } catch {
      setDocuments(seed);
      setSelectedId(seed[0]?.id ?? '');
    }
  }, []);

  useEffect(() => {
    if (documents.length > 0) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    }
  }, [documents]);

  const update = (id: string, patch: Partial<WorkspaceDocument>) => {
    setDocuments((current) =>
      current.map((doc) =>
        doc.id === id
          ? { ...doc, ...patch, updatedAt: new Date().toISOString() }
          : doc,
      ),
    );
  };

  const create = (parentId: string | null) => {
    const next = makeDocument('Nový dokument', parentId);
    setDocuments((current) => [...current, next]);
    setSelectedId(next.id);
  };

  return (
    <WorkspaceShell
      documents={documents}
      selectedId={selectedId}
      onSelect={setSelectedId}
      onCreate={create}
      onUpdate={update}
      onArchive={(id) => update(id, { archived: true, published: false })}
      onRestore={(id) => update(id, { archived: false })}
      onPublish={(id, published) => update(id, { published })}
    />
  );
}

function toWorkspaceDocument(document: any): WorkspaceDocument {
  return {
    id: String(document._id),
    title: document.title,
    content: document.content,
    parentId: document.parentId ?? null,
    icon: document.icon ?? '·',
    archived: document.archived,
    published: document.published,
    updatedAt: new Date(document.updatedAt).toISOString(),
  };
}

function ConvexWorkspace() {
  const remote = useQuery(anyApi.documents.list, { includeArchived: true });
  const createDocument = useMutation(anyApi.documents.create);
  const updateDocument = useMutation(anyApi.documents.update);
  const archiveDocument = useMutation(anyApi.documents.archive);
  const restoreDocument = useMutation(anyApi.documents.restore);
  const publishDocument = useMutation(anyApi.documents.publish);

  const [selectedId, setSelectedId] = useState('');
  const [drafts, setDrafts] = useState<Record<string, Partial<WorkspaceDocument>>>({});
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const documents = useMemo(() => {
    const base = ((remote ?? []) as any[]).map(toWorkspaceDocument);
    return base.map((document) => ({
      ...document,
      ...(drafts[document.id] ?? {}),
    }));
  }, [remote, drafts]);

  useEffect(() => {
    if (!selectedId && documents[0]) setSelectedId(documents[0].id);
  }, [documents, selectedId]);

  useEffect(() => {
    return () => {
      Object.values(timers.current).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const scheduleUpdate = (id: string, patch: Partial<WorkspaceDocument>) => {
    setDrafts((current) => ({
      ...current,
      [id]: { ...(current[id] ?? {}), ...patch },
    }));

    if (timers.current[id]) clearTimeout(timers.current[id]);

    timers.current[id] = setTimeout(async () => {
      const data = {
        id,
        ...(patch.title !== undefined ? { title: patch.title } : {}),
        ...(patch.content !== undefined ? { content: patch.content } : {}),
        ...(patch.icon !== undefined ? { icon: patch.icon } : {}),
        ...(patch.published !== undefined ? { published: patch.published } : {}),
        ...(patch.parentId !== undefined && patch.parentId !== null
          ? { parentId: patch.parentId }
          : {}),
      };

      try {
        await updateDocument(data as any);
        setDrafts((current) => {
          const next = { ...current };
          delete next[id];
          return next;
        });
      } catch {
        // Keep the draft locally when the network mutation fails.
      }
    }, 500);
  };

  const create = async (parentId: string | null) => {
    const id = await createDocument({
      title: 'Nový dokument',
      content: '',
      ...(parentId ? { parentId } : {}),
      icon: '·',
    });
    setSelectedId(String(id));
  };

  const archive = async (id: string) => {
    await archiveDocument({ id: id as any });
    if (selectedId === id) setSelectedId(documents.find((doc) => doc.id !== id)?.id ?? '');
  };

  const restore = async (id: string) => {
    await restoreDocument({ id: id as any });
  };

  const publish = async (id: string, published: boolean) => {
    await publishDocument({
      id: id as any,
      published,
      ...(published ? { publicSlug: id } : {}),
    });
  };

  if (remote === undefined) {
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
      onSelect={setSelectedId}
      onCreate={create}
      onUpdate={scheduleUpdate}
      onArchive={archive}
      onRestore={restore}
      onPublish={publish}
    />
  );
}

export default function WorkspacePage() {
  return CONVEX_ENABLED ? <ConvexWorkspace /> : <LocalWorkspace />;
}
