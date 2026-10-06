'use client';

import { anyApi } from 'convex/server';
import { useQuery } from 'convex/react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const BlockEditor = dynamic(() => import('@/components/workspace/BlockEditor'), {
  ssr: false,
  loading: () => <div className="min-h-[50vh] rounded-xl border border-white/10 bg-[#070707]" />,
});
import Link from 'next/link';

export default function PublishPage() {
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    setSlug(new URLSearchParams(window.location.search).get('slug'));
  }, []);

  const document = useQuery(
    anyApi.documents.getPublished,
    slug ? { publicSlug: slug } : 'skip',
  );

  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-white">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold">Publikování není aktivní</h1>
          <p className="mt-3 text-sm leading-6 text-white/45">
            Pro veřejné stránky nejdřív připoj Convex deployment.
          </p>
          <Link href="/workspace" className="mt-6 inline-flex rounded-md border border-white/15 px-4 py-2 text-sm">
            Zpět do workspace
          </Link>
        </div>
      </main>
    );
  }

  if (!slug || document === undefined) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] text-sm text-white/40">
        Načítám stránku…
      </main>
    );
  }

  if (!document) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-white">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold">Stránka nebyla nalezena</h1>
          <p className="mt-3 text-sm text-white/45">
            Dokument neexistuje, není publikovaný nebo byl přesunut do koše.
          </p>
          <Link href="/workspace" className="mt-6 inline-flex rounded-md border border-white/15 px-4 py-2 text-sm">
            Workspace
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/docs" className="text-xs font-semibold tracking-[0.2em] text-white/50">
            AKCIZUR / DOCS
          </Link>
          <Link href="/workspace" className="text-xs text-white/35 hover:text-white">
            Workspace
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-4xl px-6 py-16 md:px-12 md:py-24">
        <div className="mb-5 text-xs uppercase tracking-[0.18em] text-white/30">
          Publikovaný dokument
        </div>
        <h1 className="mb-4 text-4xl font-semibold tracking-tight md:text-6xl">{document.title}</h1>
        <div className="mb-10 text-xs text-white/30">
          Aktualizováno {new Date(document.updatedAt).toLocaleString('cs-CZ')}
        </div>

        <BlockEditor value={document.content} editable={false} onChange={() => undefined} />
      </article>
    </main>
  );
}
