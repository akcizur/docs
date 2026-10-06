'use client';

import Link from 'next/link';
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react';
import {
  Archive,
  ChevronRight,
  FileText,
  ExternalLink,
  Menu,
  Plus,
  RotateCcw,
  Search,
  Send,
  Settings2,
  Trash2,
  X,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';

const BlockEditor = dynamic(() => import('@/components/workspace/BlockEditor'), {
  ssr: false,
  loading: () => <div className="min-h-[50vh] rounded-xl border border-white/10 bg-[#070707]" />,
});

export type WorkspaceDocument = {
  id: string;
  title: string;
  content: string;
  parentId: string | null;
  icon: string;
  archived: boolean;
  published: boolean;
  updatedAt: string;
};

type WorkspaceShellProps = {
  documents: WorkspaceDocument[];
  selectedId: string;
  onSelect: (id: string) => void;
  onCreate: (parentId: string | null) => void;
  onUpdate: (id: string, patch: Partial<WorkspaceDocument>) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onPublish: (id: string, published: boolean) => void;
};

export default function WorkspaceShell({
  documents,
  selectedId,
  onSelect,
  onCreate,
  onUpdate,
  onArchive,
  onRestore,
  onPublish,
}: WorkspaceShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [trashOpen, setTrashOpen] = useState(false);
  const [search, setSearch] = useState('');

  const visibleDocuments = useMemo(
    () =>
      documents
        .filter((doc) => (trashOpen ? doc.archived : !doc.archived))
        .filter((doc) => doc.title.toLowerCase().includes(search.toLowerCase())),
    [documents, search, trashOpen],
  );

  const selected = documents.find((doc) => doc.id === selectedId) ?? null;

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="flex h-screen overflow-hidden border border-white/10">
        {sidebarOpen && (
          <aside className="flex w-[290px] shrink-0 flex-col border-r border-white/10 bg-[#090909]">
            <div className="flex h-14 items-center justify-between border-b border-white/10 px-3">
              <Link href="/docs" className="text-sm font-semibold tracking-tight hover:text-white/70">
                AKCIZUR / DOCS
              </Link>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="rounded-md p-2 text-white/50 hover:bg-white/5 hover:text-white"
                aria-label="Skrýt sidebar"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex gap-2 border-b border-white/10 p-3">
              <button
                type="button"
                onClick={() => onCreate(selected?.id ?? null)}
                className="flex flex-1 items-center justify-center gap-2 rounded-md border border-white/15 bg-white px-3 py-2 text-xs font-semibold text-black hover:bg-white/90"
              >
                <Plus size={14} /> Nový
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
                  placeholder="Hledat"
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/25"
                />
              </label>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              <div className="px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">
                {trashOpen ? 'Koš' : 'Dokumenty'}
              </div>
              <div className="space-y-0.5">
                {visibleDocuments.map((doc) => (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => onSelect(doc.id)}
                    className={
                      'group flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm ' +
                      (selectedId === doc.id
                        ? 'bg-white/10 text-white'
                        : 'text-white/55 hover:bg-white/[0.04] hover:text-white')
                    }
                  >
                    <span className="w-5 shrink-0 text-center text-xs">{doc.icon}</span>
                    <span className="min-w-0 flex-1 truncate">{doc.title || 'Bez názvu'}</span>
                    {doc.published && !doc.archived && <Send size={12} className="text-white/30" />}
                    {!trashOpen && <ChevronRight size={12} className="text-white/15" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-white/10 p-3">
              <div className="flex items-center gap-2 px-1 text-xs text-white/30">
                <Settings2 size={14} />
                <span className="min-w-0 flex-1">Realtime / local fallback</span>
              </div>
              {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && (
                <div className="mt-3 flex items-center justify-between gap-2 px-1">
                  <Show when="signed-out">
                    <div className="flex gap-2">
                      <SignInButton>
                        <button
                          type="button"
                          className="rounded-md border border-white/10 px-2.5 py-1.5 text-[11px] text-white/60 hover:bg-white/5 hover:text-white"
                        >
                          Přihlásit
                        </button>
                      </SignInButton>
                      <SignUpButton>
                        <button
                          type="button"
                          className="rounded-md bg-white px-2.5 py-1.5 text-[11px] font-medium text-black hover:bg-white/90"
                        >
                          Registrace
                        </button>
                      </SignUpButton>
                    </div>
                  </Show>
                  <Show when="signed-in">
                    <UserButton />
                  </Show>
                </div>
              )}
            </div>
          </aside>
        )}

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 items-center justify-between border-b border-white/10 bg-[#070707]/95 px-4">
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
              <span className="max-w-[42vw] truncate text-sm text-white/45">
                {selected?.parentId ? 'Dokument / ' : 'Workspace / '}
                <strong className="text-white/80">{selected?.title || 'Vyber dokument'}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {selected && !selected.archived && (
                <>
                  <button
                    type="button"
                    onClick={() => onPublish(selected.id, !selected.published)}
                    className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-white/60 hover:bg-white/5 hover:text-white"
                  >
                    {selected.published ? 'Zrušit publikaci' : 'Publikovat'}
                  </button>
                  {selected.published && (
                    <Link
                      href={'/publish?slug=' + encodeURIComponent(selected.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md border border-white/10 p-2 text-white/45 hover:bg-white/5 hover:text-white"
                      aria-label="Otevřít publikovaný dokument"
                    >
                      <ExternalLink size={15} />
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => onArchive(selected.id)}
                    className="rounded-md p-2 text-white/35 hover:bg-white/5 hover:text-white"
                    aria-label="Archivovat"
                  >
                    <Archive size={16} />
                  </button>
                </>
              )}

              {selected?.archived && (
                <button
                  type="button"
                  onClick={() => onRestore(selected.id)}
                  className="flex items-center gap-2 rounded-md border border-white/10 px-3 py-1.5 text-xs text-white/65 hover:bg-white/5 hover:text-white"
                >
                  <RotateCcw size={13} /> Obnovit
                </button>
              )}
            </div>
          </header>

          {selected ? (
            <article className="flex-1 overflow-y-auto">
              <div className="mx-auto w-full max-w-4xl px-6 py-14 md:px-12 md:py-20">
                <div className="mb-8 flex items-center gap-3 text-xs text-white/25">
                  <FileText size={15} />
                  <span>
                    {selected.archived ? 'V koši' : selected.published ? 'Publikováno' : 'Koncept'}
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
                />

                <BlockEditor
                  key={selected.id}
                  value={selected.content}
                  editable={!selected.archived}
                  onChange={(value) => onUpdate(selected.id, { content: value })}
                />

                <div className="mt-12 grid gap-3 border-t border-white/10 pt-6 md:grid-cols-3">
                  <div className="rounded-lg border border-white/10 p-4 text-xs text-white/30">
                    <div className="mb-2 text-white/50">Hierarchie</div>
                    <div>{selected.parentId ? 'Vnořený dokument' : 'Kořenový dokument'}</div>
                  </div>
                  <div className="rounded-lg border border-white/10 p-4 text-xs text-white/30">
                    <div className="mb-2 text-white/50">Publikace</div>
                    <div>{selected.published ? 'Veřejný' : 'Soukromý koncept'}</div>
                  </div>
                  <div className="rounded-lg border border-white/10 p-4 text-xs text-white/30">
                    <div className="mb-2 text-white/50">Synchronizace</div>
                    <div>{process.env.NEXT_PUBLIC_CONVEX_URL ? 'Convex realtime' : 'Local browser storage'}</div>
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
                <p className="mt-2 text-sm text-white/35">Vytvoř první stránku pomocí tlačítka Nový.</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
