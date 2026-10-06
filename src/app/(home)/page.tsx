import Link from 'next/link';

const features = [
  {
    title: 'Notion workspace',
    description: 'Block editor, hierarchie stránek, podstránky, koš, obnova a autosave.',
  },
  {
    title: 'Lokální databáze',
    description: 'IndexedDB jako primární úložiště a localStorage jako fallback. Bez serveru.',
  },
  {
    title: 'Sdílené stránky',
    description: 'Publikuj dokument do komprimovaného share URL. Otevře se přímo na GitHub Pages.',
  },
  {
    title: 'Záloha a import',
    description: 'Kompletní workspace lze kdykoli exportovat do JSON a obnovit z jednoho souboru.',
  },
  {
    title: 'Fumadocs',
    description: 'Veřejná dokumentace zůstává staticky generovaná při buildu.',
  },
  {
    title: 'GitHub Pages only',
    description: 'Žádný Vercel, server API, externí databáze ani runtime secrets.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <section className="flex flex-col items-center justify-center px-6 py-24 text-center md:py-36">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 text-xs uppercase tracking-[0.28em] text-white/35">AKCIZUR / DOCS</div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
            Dokumentace
            <br />
            <span className="text-white/55">jako workspace.</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-white/55 md:text-xl">
            Fumadocs pro veřejnou dokumentaci a plnohodnotný Notion-like editor,
            který běží kompletně v prohlížeči a hostuje se pouze přes GitHub Pages.
          </p>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/workspace"
              className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white px-6 py-3 font-medium text-black transition hover:bg-white/90"
            >
              Otevřít workspace
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center justify-center rounded-lg border border-white/15 px-6 py-3 font-medium text-white transition hover:bg-white/10"
            >
              Dokumentace
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12">
            <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">Static-first platforma</h2>
            <p className="max-w-2xl text-base text-white/45">
              Celý frontend se sestaví do statických souborů. Workspace data jsou lokální
              a sdílení funguje bez backendového runtime.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-6 transition hover:bg-white/[0.06]"
              >
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm leading-6 text-white/45">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-6 text-sm text-white/35 md:flex-row">
          <span>© 2026 RJ</span>
          <span>Next.js · Fumadocs · BlockNote · GitHub Pages</span>
        </div>
      </footer>
    </div>
  );
}
