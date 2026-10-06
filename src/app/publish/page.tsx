'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { decodeSharedDocument } from '@/lib/workspace/share';
import type { WorkspaceDocument } from '@/lib/workspace/types';

const BlockEditor = dynamic(() => import('@/components/workspace/BlockEditor'), {
  ssr: false,
  loading: () => <div className="min-h-[52vh] rounded-xl border border-white/10 bg-[#070707]" />,
});

export default function PublishPage() {
  const [document, setDocument] = useState<Partial<WorkspaceDocument> | null>(null);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    const read = () => {
      const hash = window.location.hash;
      if (!hash.startsWith('#d=')) {
        setInvalid(true);
        return;
      }

      const token = decodeURIComponent(hash.slice(3));
      const decoded = decodeSharedDocument(token);

      if (!decoded) {
        setInvalid(true);
        return;
      }

      setDocument(decoded);
    };

    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, []);

  if (invalid) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-white">
        <div className="max-w-md text-center">
          <div className="mb-3 text-xs uppercase tracking-[0.22em] text-white/30">PUBLIC PAGE</div>
          <h1 className="text-2xl font-semibold">Neplatný nebo neúplný odkaz</h1>
          <p className="mt-3 text-sm leading-6 text-white/45">
            Publikované dokumenty jsou v této GitHub Pages-only verzi přenášeny přímo v URL fragmentu.
          </p>
          <Link
            href="/workspace"
            className="mt-6 inline-flex rounded-md border border-white/15 px-4 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
          >
            Otevřít workspace
          </Link>
        </div>
      </main>
    );
  }

  if (!document) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] text-sm text-white/40">
        Načítám dokument…
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xs font-semibold tracking-[0.2em] text-white/50">
            AKCIZUR / DOCS
          </Link>
          <Link href="/workspace" className="text-xs text-white/35 hover:text-white">
            Workspace
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-4xl px-6 py-16 md:px-12 md:py-24">
        <div className="mb-5 flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-white/30">
          <span>{document.icon ?? '·'}</span>
          <span>Publikovaný dokument</span>
        </div>

        {document.coverDataUrl && (
          <div className="mb-8 overflow-hidden rounded-2xl border border-white/10">
            <img src={document.coverDataUrl} alt="" className="max-h-[360px] w-full object-cover" />
          </div>
        )}

        <h1 className="mb-4 text-4xl font-semibold tracking-tight md:text-6xl">
          {document.title ?? 'Bez názvu'}
        </h1>

        <div className="mb-10 text-xs text-white/30">
          Aktualizováno{' '}
          {document.updatedAt
            ? new Date(document.updatedAt).toLocaleString('cs-CZ')
            : 'neznámý čas'}
        </div>

        <BlockEditor
          value={document.content ?? ''}
          editable={false}
          onChange={() => undefined}
        />
      </article>
    </main>
  );
}
