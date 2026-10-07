'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  FileJson,
  FileText,
  FolderPlus,
  Menu,
  MoreHorizontal,
  RotateCcw,
  Search,
  Share2,
  Settings2,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  type ChangeEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { WorkspaceDocument } from '@/lib/workspace/types';

const BlockEditor = dynamic(() => import('@/components/workspace/BlockEditor'), {
  ssr: false,
  loading: () => <div className="min-h-[52vh]" />,
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
  onPublish: _onPublish,
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
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = documents.find((document) => document.id === selectedId) ?? null;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }

      if (event.key === 'Escape') {
        setMenuOpen(false);
        setIconOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const byId = useMemo(
    () => new Map(documents.map((document) => [document.id, document])),
    [documents],
  );

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
        .filter((document) =>
          document.title.toLowerCase().includes(search.trim().toLowerCase()),
        ),
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

  const renderNode = (
    document: WorkspaceDocument,
    depth = 0,
    visited = new Set<string>(),
  ): ReactNode => {
    if (visited.has(document.id)) return null;

    const nextVisited = new Set(visited).add(document.id);
    const children = childrenOf.get(document.id) ?? [];
    const isExpanded = expanded.has(document.id);
    const isSelected = selectedId === document.id;

    return (
      <div key={document.id}>
        <div
          className={
            'group flex items-center gap-1 rounded-lg px-1 py-0.5 transition-colors ' +
            (isSelected
              ? 'bg-white/[0.08] text-white'
              : 'text-white/55 hover:bg-white/[0.045] hover:text-white')
          }
          style={{ paddingLeft: 4 + depth * 14 }}
        >
          <button
            type="button"
            onClick={() => children.length && toggleExpanded(document.id)}
            className="flex h-7 w-6 shrink-0 items-center justify-center rounded-md text-white/25 hover:text-white/65"
            aria-label={
              children.length ? (isExpanded ? 'Sbalit' : 'Rozbalit') : 'Bez podstránek'
            }
          >
            {children.length ? (
              isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />
            ) : (
              <span className="h-1 w-1 rounded-full bg-white/15" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onSelect(document.id)}
            className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left text-[13px]"
          >
            <span className="w-5 shrink-0 text-center text-[12px] text-white/45">
              {document.icon}
            </span>
            <span className="min-w-0 flex-1 truncate">
              {document.title || 'Bez názvu'}
            </span>
          </button>

          {document.published && (
            <Share2
              size={12}
              className="mr-1 shrink-0 text-white/20"
              aria-label="Publikováno"
            />
          )}
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

      try {
        await navigator.clipboard.writeText(url);
        setShareState('Odkaz zkopírován');
      } catch {
        setShareState('Odkaz vytvořen');
      }
    } catch (error) {
      setErrorState(error instanceof Error ? error.message : 'Sdílení selhalo.');
      setShareState('');
    }

    window.setTimeout(() => setShareState(''), 2600);
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

  const statusLabel = selected?.archived
    ? 'V koši'
    : selected?.published
      ? 'Publikováno'
      : 'Koncept';

  return (
    <main className="min-h-screen bg-[#0b0b0c] text-white">
      <div className="flex h-dvh min-h-[640px] overflow-hidden">
        {sidebarOpen && (
          <aside className="flex w-[286px] shrink-0 flex-col border-r border-white/[0.08] bg-[#101011]">
            <div className="flex h-16 items-center justify-between border-b border-white/[0.08] px-4">
              <Link href="/" className="group flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-[9px] border border-white/[0.12] bg-white/[0.04] text-[11px] font-semibold tracking-tight">
                  A
                </span>
                <span>
                  <span className="block text-[13px] font-semibold tracking-tight text-white/90">
                    AKCIZUR
                  </span>
                  <span className="block text-[10px] text-white/30">Docs workspace</span>
                </span>
              </Link>

              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-2 text-white/35 transition hover:bg-white/[0.05] hover:text-white"
                aria-label="Skrýt sidebar"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-3">
              <button
                type="button"
                onClick={createChild}
                className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-white px-3 py-2.5 text-[12px] font-semibold text-black shadow-sm transition hover:bg-white/90 active:scale-[0.99]"
              >
                <FolderPlus size={14} />
                Nová stránka
              </button>
            </div>

            <div className="px-3 pb-3">
              <label className="flex items-center gap-2 rounded-[10px] border border-white/[0.08] bg-white/[0.035] px-3 py-2.5 transition focus-within:border-white/[0.18] focus-within:bg-white/[0.05]">
                <Search size={14} className="shrink-0 text-white/30" />
                <input
                  ref={searchRef}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Hledat"
                  className="min-w-0 flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-white/25"
                  aria-label="Hledat v workspace"
                />
                <kbd className="hidden rounded-md border border-white/[0.08] px-1.5 py-0.5 text-[9px] text-white/25 sm:block">
                  {typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform)
                    ? '⌘ K'
                    : 'Ctrl K'}
                </kbd>
              </label>
            </div>

            <div className="flex items-center justify-between px-4 pb-2">
              <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/25">
                Stránky
              </span>
              <span className="text-[10px] text-white/20">{normalDocuments.length}</span>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
              {!trashOpen ? (
                <div className="space-y-0.5">
                  {roots.map((document) => renderNode(document))}
                  {roots.length === 0 && (
                    <div className="px-3 py-10 text-center">
                      <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.02]">
                        <FileText size={15} className="text-white/25" />
                      </div>
                      <p className="text-[12px] text-white/25">
                        {search ? 'Nic nenalezeno.' : 'Workspace je prázdný.'}
                      </p>
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
                        'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] ' +
                        (selectedId === document.id
                          ? 'bg-white/[0.08] text-white'
                          : 'text-white/45 hover:bg-white/[0.04] hover:text-white')
                      }
                    >
                      <Trash2 size={13} className="text-white/25" />
                      <span className="min-w-0 flex-1 truncate">
                        {document.title || 'Bez názvu'}
                      </span>
                    </button>
                  ))}

                  {trashDocuments.length === 0 && (
                    <div className="px-3 py-10 text-center text-[12px] text-white/25">
                      Koš je prázdný.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-white/[0.08] p-3">
              <button
                type="button"
                onClick={() => setTrashOpen((value) => !value)}
                className={
                  'mb-2 flex w-full items-center gap-2 rounded-[9px] px-3 py-2 text-left text-[12px] transition ' +
                  (trashOpen
                    ? 'bg-white/[0.07] text-white'
                    : 'text-white/35 hover:bg-white/[0.04] hover:text-white/70')
                }
              >
                <Trash2 size={13} />
                <span className="flex-1">Koš</span>
                <span>{documents.filter((document) => document.archived).length}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={onExport}
                  className="flex items-center justify-center gap-1.5 rounded-[9px] border border-white/[0.08] px-2 py-2 text-[11px] text-white/40 transition hover:bg-white/[0.04] hover:text-white/70"
                >
                  <Download size={12} />
                  Záloha
                </button>
                <button
                  type="button"
                  onClick={() => importRef.current?.click()}
                  className="flex items-center justify-center gap-1.5 rounded-[9px] border border-white/[0.08] px-2 py-2 text-[11px] text-white/40 transition hover:bg-white/[0.04] hover:text-white/70"
                >
                  <Upload size={12} />
                  Import
                </button>
              </div>

              <Link
                href="/docs"
                className="mt-2 flex items-center gap-2 rounded-[9px] px-2.5 py-2 text-[11px] text-white/30 transition hover:bg-white/[0.04] hover:text-white/65"
              >
                <Settings2 size={12} />
                Dokumentace
              </Link>

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

        <section className="flex min-w-0 flex-1 flex-col bg-[#0b0b0c]">
          <header className="relative z-20 flex h-16 shrink-0 items-center justify-between border-b border-white/[0.07] bg-[#0b0b0c]/95 px-4 backdrop-blur-xl md:px-6">
            <div className="flex min-w-0 items-center gap-2">
              {!sidebarOpen && (
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="mr-1 rounded-lg p-2 text-white/45 transition hover:bg-white/[0.05] hover:text-white"
                  aria-label="Zobrazit sidebar"
                >
                  <Menu size={16} />
                </button>
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[12px] text-white/30">
                  <span>{selected?.parentId ? 'Dokument' : 'Workspace'}</span>
                  <span className="text-white/15">/</span>
                  <strong className="max-w-[42vw] truncate font-medium text-white/65">
                    {selected?.title || 'Vyber dokument'}
                  </strong>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {shareState && (
                <span className="mr-1 hidden rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] text-white/45 sm:inline">
                  {shareState}
                </span>
              )}

              {selected && !selected.archived && (
                <button
                  type="button"
                  onClick={shareCurrent}
                  className="flex items-center gap-1.5 rounded-[9px] border border-white/[0.10] bg-white/[0.03] px-3 py-2 text-[11px] font-medium text-white/65 transition hover:bg-white/[0.07] hover:text-white"
                >
                  <Share2 size={13} />
                  {selected.published ? 'Sdílet' : 'Publikovat'}
                </button>
              )}

              {selected?.archived && (
                <>
                  <button
                    type="button"
                    onClick={() => onRestore(selected.id)}
                    className="flex items-center gap-1.5 rounded-[9px] border border-white/[0.10] bg-white/[0.03] px-3 py-2 text-[11px] text-white/65 transition hover:bg-white/[0.07] hover:text-white"
                  >
                    <RotateCcw size={13} />
                    Obnovit
                  </button>
                  <button
                    type="button"
                    onClick={deletePermanently}
                    className="rounded-[9px] p-2 text-white/30 transition hover:bg-white/[0.05] hover:text-white"
                    aria-label="Smazat natrvalo"
                  >
                    <Trash2 size={15} />
                  </button>
                </>
              )}

              {selected && (
                <button
                  type="button"
                  onClick={() => setMenuOpen((value) => !value)}
                  className="rounded-[9px] p-2 text-white/30 transition hover:bg-white/[0.05] hover:text-white"
                  aria-label="Další akce"
                >
                  <MoreHorizontal size={17} />
                </button>
              )}

              {menuOpen && selected && (
                <div className="absolute right-4 top-14 z-40 w-56 rounded-xl border border-white/[0.09] bg-[#151516] p-1.5 shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
                  <button
                    type="button"
                    onClick={shareCurrent}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12px] text-white/65 transition hover:bg-white/[0.06] hover:text-white"
                  >
                    <Copy size={13} />
                    Kopírovat share odkaz
                  </button>
                  <button
                    type="button"
                    onClick={() => coverRef.current?.click()}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12px] text-white/65 transition hover:bg-white/[0.06] hover:text-white"
                  >
                    <Upload size={13} />
                    Nastavit cover
                  </button>
                  {selected.coverDataUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        onUpdate(selected.id, { coverDataUrl: undefined });
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12px] text-white/65 transition hover:bg-white/[0.06] hover:text-white"
                    >
                      <Trash2 size={13} />
                      Odebrat cover
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
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12px] text-white/65 transition hover:bg-white/[0.06] hover:text-white"
                  >
                    <FileJson size={13} />
                    Export dokumentu
                  </button>
                </div>
              )}
            </div>
          </header>

          {selected ? (
            <article className="min-h-0 flex-1 overflow-y-auto">
              <div className="mx-auto w-full max-w-5xl px-6 pb-24 pt-10 sm:px-10 md:px-14 md:pt-14 lg:px-20">
                {selected.coverDataUrl && (
                  <div className="mb-9 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
                    <img
                      src={selected.coverDataUrl}
                      alt=""
                      className="max-h-[320px] w-full object-cover"
                    />
                  </div>
                )}

                <div className="relative mb-6 flex flex-wrap items-center gap-2 text-[11px] text-white/30">
                  <button
                    type="button"
                    onClick={() => setIconOpen((value) => !value)}
                    className="flex h-8 w-8 items-center justify-center rounded-[9px] border border-white/[0.09] bg-white/[0.03] text-sm text-white/70 transition hover:bg-white/[0.06] hover:text-white"
                    aria-label="Změnit ikonu"
                  >
                    {selected.icon}
                  </button>

                  {iconOpen && (
                    <div className="absolute left-0 top-10 z-30 grid grid-cols-5 gap-1 rounded-xl border border-white/[0.09] bg-[#151516] p-2 shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
                      {ICONS.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => {
                            onUpdate(selected.id, { icon });
                            setIconOpen(false);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-[13px] text-white/55 transition hover:bg-white/[0.07] hover:text-white"
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="rounded-full border border-white/[0.08] bg-white/[0.025] px-2.5 py-1">
                    {statusLabel}
                  </span>
                  <span className="text-white/15">•</span>
                  <time dateTime={selected.updatedAt}>
                    {new Date(selected.updatedAt).toLocaleString('cs-CZ')}
                  </time>
                </div>

                <input
                  value={selected.title}
                  onChange={(event) => onUpdate(selected.id, { title: event.target.value })}
                  disabled={selected.archived}
                  className="mb-5 w-full max-w-[980px] bg-transparent text-[42px] font-semibold leading-[1.08] tracking-[-0.045em] text-white outline-none placeholder:text-white/20 sm:text-[48px] md:text-[58px]"
                  placeholder="Bez názvu"
                  autoComplete="off"
                />

                {!selected.content.trim() && !selected.archived && (
                  <div className="mb-5 rounded-xl border border-dashed border-white/[0.07] bg-white/[0.015] px-4 py-3 text-[12px] text-white/25">
                    Začni psát. Pro nové bloky můžeš použít <span className="text-white/40">/</span>.
                  </div>
                )}

                <BlockEditor
                  key={selected.id}
                  value={selected.content}
                  editable={!selected.archived}
                  onChange={(value) => onUpdate(selected.id, { content: value })}
                />

                {errorState && (
                  <div className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-[12px] text-white/50">
                    {errorState}
                  </div>
                )}

                <div className="mt-10 border-t border-white/[0.07] pt-5">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-white/25">
                    <span>
                      {selected.parentId
                        ? `Umístění: ${byId.get(selected.parentId)?.title ?? 'Poddokument'}`
                        : 'Kořenová stránka'}
                    </span>
                    <span>{selected.published ? 'Veřejný share odkaz' : 'Pouze lokálně'}</span>
                    <span>Automaticky ukládáno</span>
                  </div>
                </div>
              </div>
            </article>
          ) : (
            <div className="flex flex-1 items-center justify-center px-6 py-12">
              <div className="max-w-sm text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.025]">
                  <FileText size={20} className="text-white/30" />
                </div>
                <h1 className="text-xl font-semibold tracking-tight text-white/85">
                  Začni novou stránku
                </h1>
                <p className="mt-2 text-sm leading-6 text-white/35">
                  Vytvoř stránku a piš přímo do workspace. Obsah se ukládá lokálně v prohlížeči.
                </p>
                <button
                  type="button"
                  onClick={() => onCreate(null)}
                  className="mt-6 inline-flex items-center gap-2 rounded-[10px] bg-white px-4 py-2.5 text-[12px] font-semibold text-black transition hover:bg-white/90"
                >
                  <FolderPlus size={14} />
                  Vytvořit stránku
                </button>
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
