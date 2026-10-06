'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  Archive,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  FileJson,
  FileText,
  FolderPlus,
  Menu,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Search,
  Share2,
  Settings2,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { ChangeEvent, useMemo, useRef, useState } from 'react';
import type { WorkspaceDocument } from '@/lib/workspace/types';

const BlockEditor = dynamic(() => import('@/components/workspace/BlockEditor'), {
  ssr: false,
  loading: () => <div className="min-h-[52vh] rounded-xl border border-white/10 bg-[#070707]" />,
});

type WorkspaceShellProps = {
  documents: WorkspaceDocument[];
  selectedId: string;
  onSelect: (id: string) => void;
  onCreate: (parentId: string | null) => void;
  onUpdate: (id: string, patch: Partial<WorkspaceDocument>) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  onPublish: (id: string, published: boolean) => void;
  onImport: (documents: WorkspaceDocument[]) => void;
  onExport: () => void;
  onShare: (document: WorkspaceDocument) => Promise<string>;
};

const ICONS = ['·', '✦', '◇', '□', '△', '○', '◆', '→', '✚', '⌁'];

function isDocument(value: unknown): value is WorkspaceDocument {
  if (!value || typeof value !== 'object') return false;
  const document = value as Partial<WorkspaceDocument>;
  return (
    typeof document.id === 'string' &&
    typeof document.title === 'string' &&
    typeof document.content === 'string' &&
    (typeof document.parentId === 'string' || document.parentId === null) &&
    typeof document.icon === 'string' &&
    typeof document.archived === 'boolean' &&
    typeof document.published === 'boolean' &&
    typeof document.updatedAt === 'string'
  );
}

function collectDescendants(documents: WorkspaceDocument[], id: string): Set<string> {
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
}

export default function WorkspaceShell({
  documents,
  selectedId,
  onSelect,
  onCreate,
  onUpdate,
  onArchive,
  onRestore,
  onDelete,
  onPublish,
  onImport,
  onExport,
  onShare,
}: WorkspaceShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [trashOpen, setTrashOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [iconOpen, setIconOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareState, setShareState] = useState('');
  const [errorState, setErrorState] = useState('');
  const importRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const selected = documents.find((document) => document.id === selectedId) ?? null;
  const byId = useMemo(() => new Map(documents.map((document) => [document.id, document])), [documents]);

  const normalDocuments = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return documents
      .filter((document) => !document.archived)
      .filter((document) => {
        if (!needle) return true;
        return (
          document.title.toLowerCase().includes(needle) ||
          document.content.toLowerCase().includes(needle)
        );
      });
  }, [documents, search]);

  const trashDocuments = useMemo(
    () =>
      documents
        .filter((document) => document.archived)
        .filter((document) => document.title.toLowerCase().includes(search.trim().toLowerCase())),
    [documents, search],
  );

  const childrenOf = useMemo(() => {
    const map = new Map<string, WorkspaceDocument[]>();
    for (const document of normalDocuments) {
      if (!document.parentId || !byId.has(document.parentId)) continue;
      const list = map.get(document.parentId) ?? [];
      list.push(document);
      map.set(document.parentId, list);
    }
    for (const [parent, list] of map) {
      map.set(parent, list.sort((a, b) => a.title.localeCompare(b.title, 'cs')));
    }
    return map;
  }, [normalDocuments, byId]);

  const roots = useMemo(
    () =>
      normalDocuments
        .filter(
          (document) =>
            !document.parentId ||
            !byId.has(document.parentId) ||
            byId.get(document.parentId)?.archived,
        )
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [normalDocuments, byId],
  );

  const toggleExpanded = (id: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderNode = (document: WorkspaceDocument, depth = 0, visited = new Set<string>()): JSX.Element | null => {
    if (visited.has(document.id)) return null;
    const nextVisited = new Set(visited).add(document.id);
    const children = childrenOf.get(document.id) ?? [];
    const isExpanded = expanded.has(document.id);

    return (
      <div key={document.id}>
        <div
          className={
            'group flex w-full items-center gap-1 rounded-md py-0.5 ' +
            (selectedId === document.id ? 'bg-white/10' : 'hover:bg-white/[0.04]')
          }
          style={{ paddingLeft: 4 + depth * 16, paddingRight: 4 }}
        >
          <button
            type="button"
            onClick={() => children.length && toggleExpanded(document.id)}
            className="flex h-7 w-6 shrink-0 items-center justify-center text-white/25 hover:text-white/60"
            aria-label={children.length ? (isExpanded ? 'Sbalit' : 'Rozbalit') : 'Bez podstránek'}
          >
            {children.length ? (
              isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />
            ) : null}
          </button>
          <button
            type="button"
            onClick={() => onSelect(document.id)}
            className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left text-sm"
          >
            <span className="w-5 shrink-0 text-center text-xs text-white/55">{document.icon}</span>
            <span className="min-w-0 flex-1 truncate text-white/65 group-hover:text-white">
              {document.title || 'Bez názvu'}
            </span>
          </button>
          {document.published && <Share2 size={12} className="mr-1 text-white/25" />}
        </div>
        {isExpanded &&
          children.map((child) => renderNode(child, depth + 1, nextVisited))}
      </div>
    );
  };

  const createChild = () => {
    if (selected) setExpanded((current) => new Set(current).add(selected.id));
    onCreate(selected?.id ?? null);
  };

  const handleImportChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const raw = JSON.parse(await file.text());
      const incoming = Array.isArray(raw) ? raw : raw.documents;
      if (!Array.isArray(incoming) || incoming.some((item) => !isDocument(item))) {
        throw new Error('Neplatná záloha JSON.');
      }

      if (!window.confirm('Nahradit aktuální workspace importovanou zálohou?')) return;
      onImport(incoming as WorkspaceDocument[]);
      setShareState('Workspace obnoven');
      setErrorState('');
    } catch (error) {
      setErrorState(error instanceof Error ? error.message : 'Import selhal.');
    }
  };

  const handleCoverChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !selected) return;
    if (!file.type.startsWith('image/')) {
      setErrorState('Cover musí být obrázek.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorState('Cover může mít maximálně 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUpdate(selected.id, { coverDataUrl: reader.result });
        setErrorState('');
      }
    };
    reader.readAsDataURL(file);
  };

  const shareCurrent = async () => {
    if (!selected) return;
    try {
      const url = await onShare(selected);
      await navigator.clipboard.writeText(url);
      setShareState('Odkaz zkopírován');
    } catch {
      setShareState('Odkaz vytvořen');
    }
    window.setTimeout(() => setShareState(''), 2200);
  };

  const deletePermanently = () => {
    if (!selected) return;
    const count = collectDescendants(documents, selected.id).size;
    const message =
      count > 1
        ? 'Trvale odstranit dokument a ' + (count - 1) + ' poddokumentů?'
        : 'Trvale odstranit tento dokument?';

    if (window.confirm(message)) onDelete(selected.id);
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="flex h-screen overflow-hidden border border-white/10">
        {sidebarOpen && (
          <aside className="flex w-[310px] shrink-0 flex-col border-r border-white/10 bg-[#090909]">
            <div className="flex h-14 items-center justify-between border-b border-white/10 px-3">
              <Link href="/" className="text-sm font-semibold tracking-tight hover:text-white/70">
                AKCIZUR / DOCS
              </Link>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="rounded-md p-2 text-white/45 hover:bg-white/5 hover:text-white"
                aria-label="Skrýt sidebar"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex gap-2 border-b border-white/10 p-3">
              <button
                type="button"
                onClick={createChild}
                className="flex flex-1 items-center justify-center gap-2 rounded-md border border-white/15 bg-white px-3 py-2 text-xs font-semibold text-black hover:bg-white/90"
              >
                <FolderPlus size={14} /> Nový
              </button>
              <button
                type="button"
                onClick={() => setTrashOpen((value) => !value)}
                className={
                  'rounded-md border px-3 py-2 text-xs ' +
                  (trashOpen
                    ? 'border-white/30 bg-white/10 text-white'
                    : 'border-white/10 text-white/50')
                }
                aria-label="Koš"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="border-b border-white/10 p-3">
              <label className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-2">
                <Search size={14} className="text-white/35" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Hledat názvy a obsah"
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/25"
                />
                <kbd className="hidden rounded border border-white/10 px-1.5 py-0.5 text-[9px] text-white/20 sm:block">
                  Ctrl K
                </kbd>
              </label>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {!trashOpen ? (
                <div className="space-y-0.5">
                  {roots.map((document) => renderNode(document))}
                  {roots.length === 0 && (
                    <div className="px-3 py-8 text-center text-xs text-white/25">
                      {search ? 'Nic nenalezeno.' : 'Workspace je prázdný.'}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-0.5">
                  {trashDocuments.map((document) => (
                    <button
                      key={document.id}
                      type="button"
                      onClick={() => onSelect(document.id)}
                      className={
                        'flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm ' +
                        (selectedId === document.id
                          ? 'bg-white/10 text-white'
                          : 'text-white/55 hover:bg-white/[0.04] hover:text-white')
                      }
                    >
                      <Trash2 size={13} className="text-white/25" />
                      <span className="min-w-0 flex-1 truncate">
                        {document.title || 'Bez názvu'}
                      </span>
                    </button>
                  ))}
                  {trashDocuments.length === 0 && (
                    <div className="px-3 py-8 text-center text-xs text-white/25">Koš je prázdný.</div>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-white/10 p-3">
              <div className="mb-2 flex items-center gap-2 px-1 text-xs text-white/30">
                <Settings2 size={14} />
                <span className="min-w-0 flex-1">GitHub Pages only</span>
                <span>{documents.length}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={onExport}
                  className="flex items-center justify-center gap-1 rounded-md border border-white/10 px-2 py-2 text-[10px] text-white/45 hover:bg-white/5 hover:text-white"
                >
                  <Download size={12} /> Záloha
                </button>
                <button
                  type="button"
                  onClick={() => importRef.current?.click()}
                  className="flex items-center justify-center gap-1 rounded-md border border-white/10 px-2 py-2 text-[10px] text-white/45 hover:bg-white/5 hover:text-white"
                >
                  <Upload size={12} /> Import
                </button>
                <Link
                  href="/docs"
                  className="flex items-center justify-center gap-1 rounded-md border border-white/10 px-2 py-2 text-[10px] text-white/45 hover:bg-white/5 hover:text-white"
                >
                  Docs
                </Link>
              </div>
              <input
                ref={importRef}
                type="file"
                accept="application/json,.json"
                onChange={handleImportChange}
                className="hidden"
              />
            </div>
          </aside>
        )}

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="relative flex h-14 items-center justify-between border-b border-white/10 bg-[#070707]/95 px-4">
            <div className="flex min-w-0 items-center gap-2">
              {!sidebarOpen && (
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="mr-1 rounded-md p-2 text-white/50 hover:bg-white/5 hover:text-white"
                  aria-label="Zobrazit sidebar"
                >
                  <Menu size={17} />
                </button>
              )}
              <span className="max-w-[45vw] truncate text-sm text-white/40">
                {selected?.parentId ? 'Dokument / ' : 'Workspace / '}
                <strong className="text-white/80">{selected?.title || 'Vyber dokument'}</strong>
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {shareState && <span className="mr-2 hidden text-xs text-white/40 sm:inline">{shareState}</span>}

              {selected && !selected.archived && (
                <button
                  type="button"
                  onClick={shareCurrent}
                  className="flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-xs text-white/60 hover:bg-white/5 hover:text-white"
                >
                  <Share2 size={13} /> {selected.published ? 'Sdílet' : 'Publikovat'}
                </button>
              )}

              {selected?.archived && (
                <>
                  <button
                    type="button"
                    onClick={() => onRestore(selected.id)}
                    className="flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-xs text-white/65 hover:bg-white/5 hover:text-white"
                  >
                    <RotateCcw size={13} /> Obnovit
                  </button>
                  <button
                    type="button"
                    onClick={deletePermanently}
                    className="rounded-md p-2 text-white/35 hover:bg-white/5 hover:text-white"
                    aria-label="Smazat natrvalo"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}

              {selected && (
                <button
                  type="button"
                  onClick={() => setMenuOpen((value) => !value)}
                  className="rounded-md p-2 text-white/35 hover:bg-white/5 hover:text-white"
                  aria-label="Další akce"
                >
                  <MoreHorizontal size={17} />
                </button>
              )}

              {menuOpen && selected && (
                <div className="absolute right-3 top-12 z-40 w-56 rounded-lg border border-white/10 bg-[#0d0d0d] p-1.5 shadow-2xl">
                  <button
                    type="button"
                    onClick={shareCurrent}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs text-white/65 hover:bg-white/5 hover:text-white"
                  >
                    <Copy size={13} /> Kopírovat share odkaz
                  </button>
                  <button
                    type="button"
                    onClick={() => coverRef.current?.click()}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs text-white/65 hover:bg-white/5 hover:text-white"
                  >
                    <Upload size={13} /> Nastavit cover
                  </button>
                  {selected.coverDataUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        onUpdate(selected.id, { coverDataUrl: undefined });
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs text-white/65 hover:bg-white/5 hover:text-white"
                    >
                      <Trash2 size={13} /> Odebrat cover
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(selected, null, 2)], {
                        type: 'application/json',
                      });
                      const url = URL.createObjectURL(blob);
                      const anchor = document.createElement('a');
                      anchor.href = url;
                      anchor.download = (selected.title || 'dokument') + '.json';
                      anchor.click();
                      URL.revokeObjectURL(url);
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs text-white/65 hover:bg-white/5 hover:text-white"
                  >
                    <FileJson size={13} /> Export dokumentu
                  </button>
                </div>
              )}
            </div>
          </header>

          {selected ? (
            <article className="flex-1 overflow-y-auto">
              <div className="mx-auto w-full max-w-4xl px-6 py-12 md:px-12 md:py-16">
                {selected.coverDataUrl && (
                  <div className="mb-8 overflow-hidden rounded-2xl border border-white/10">
                    <img src={selected.coverDataUrl} alt="" className="max-h-[340px] w-full object-cover" />
                  </div>
                )}

                <div className="mb-6 flex items-center gap-3 text-xs text-white/25">
                  <button
                    type="button"
                    onClick={() => setIconOpen((value) => !value)}
                    className="rounded-md border border-white/10 px-2 py-1 text-sm text-white/65 hover:bg-white/5"
                    aria-label="Změnit ikonu"
                  >
                    {selected.icon}
                  </button>

                  {iconOpen && (
                    <div className="absolute z-30 mt-28 flex max-w-xs flex-wrap gap-1 rounded-lg border border-white/10 bg-[#0d0d0d] p-2 shadow-2xl">
                      {ICONS.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => {
                            onUpdate(selected.id, { icon });
                            setIconOpen(false);
                          }}
                          className="h-8 w-8 rounded-md text-sm text-white/60 hover:bg-white/10 hover:text-white"
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  )}

                  <span>
                    {selected.archived
                      ? 'V koši'
                      : selected.published
                        ? 'Publikováno'
                        : 'Koncept'}
                  </span>
                  <span>•</span>
                  <time dateTime={selected.updatedAt}>
                    {new Date(selected.updatedAt).toLocaleString('cs-CZ')}
                  </time>
                </div>

                <input
                  value={selected.title}
                  onChange={(event) => onUpdate(selected.id, { title: event.target.value })}
                  disabled={selected.archived}
                  className="mb-8 w-full bg-transparent text-4xl font-semibold tracking-tight outline-none placeholder:text-white/20 md:text-5xl"
                  placeholder="Bez názvu"
                  autoComplete="off"
                />

                <BlockEditor
                  key={selected.id}
                  value={selected.content}
                  editable={!selected.archived}
                  onChange={(value) => onUpdate(selected.id, { content: value })}
                />

                {errorState && (
                  <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/45">
                    {errorState}
                  </div>
                )}

                <div className="mt-12 grid gap-3 border-t border-white/10 pt-6 md:grid-cols-3">
                  <div className="rounded-lg border border-white/10 p-4 text-xs text-white/30">
                    <div className="mb-2 text-white/50">Hierarchie</div>
                    <div>
                      {selected.parentId
                        ? byId.get(selected.parentId)?.title ?? 'Poddokument'
                        : 'Kořenový dokument'}
                    </div>
                  </div>
                  <div className="rounded-lg border border-white/10 p-4 text-xs text-white/30">
                    <div className="mb-2 text-white/50">Sdílení</div>
                    <div>{selected.published ? 'Share URL připravené' : 'Pouze lokální'}</div>
                  </div>
                  <div className="rounded-lg border border-white/10 p-4 text-xs text-white/30">
                    <div className="mb-2 text-white/50">Uložení</div>
                    <div>IndexedDB + localStorage fallback</div>
                  </div>
                </div>
              </div>
            </article>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-center">
              <div>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
                  <FileText size={18} className="text-white/35" />
                </div>
                <h1 className="text-base font-medium">Žádný dokument</h1>
                <p className="mt-2 text-sm text-white/35">
                  Vytvoř první stránku pomocí tlačítka Nový.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

      <input
        ref={coverRef}
        type="file"
        accept="image/*"
        onChange={handleCoverChange}
        className="hidden"
      />
    </main>
  );
}
