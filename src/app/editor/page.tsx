import Link from 'next/link';

export default function EditorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <div className="max-w-lg text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.24em] text-white/30">EDITOR</p>
        <h1 className="text-3xl font-semibold tracking-tight">Editor byl přesunut</h1>
        <p className="mt-4 text-sm leading-6 text-white/45">
          Nový editor je součástí statického workspace. Serverové filesystem API bylo odstraněno,
          protože GitHub Pages neposkytuje runtime server.
        </p>
        <Link
          href="/workspace"
          className="mt-7 inline-flex rounded-lg border border-white/15 bg-white px-5 py-2.5 text-sm font-medium text-black hover:bg-white/90"
        >
          Otevřít workspace
        </Link>
      </div>
    </main>
  );
}
