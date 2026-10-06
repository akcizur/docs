# AKCIZUR / Docs

GitHub Pages-only dokumentační a poznámková platforma.

## Stack

- Next.js 16 + React + TypeScript
- Fumadocs pro veřejnou dokumentaci
- BlockNote 0.55 pro Notion-style editor
- Tailwind CSS
- IndexedDB jako primární lokální úložiště
- localStorage jako fallback a migrace
- GitHub Actions + GitHub Pages pro deployment
- bez Vercelu, serverového runtime, externí databáze a runtime secrets

## Workspace

Adresa: /workspace

Podporuje dokumenty a poddokumenty bez omezení hloubky, stromovou navigaci, hledání, BlockNote editor, autosave, trash, restore, trvalé odstranění podstromu, publikovaný stav, cover image, ikony, JSON import/export, responzivní sidebar a sdílené URL.

## Publikování

Publikovaný dokument se přenáší v komprimovaném URL fragmentu na /publish/#d=...

Fragment se neodesílá na server. GitHub Pages proto pouze servíruje statický soubor a obsah dokumentu se dekóduje až v prohlížeči.

## Data

Lokální workspace používá IndexedDB databázi akcizur-docs a object store documents. Existující legacy localStorage data se při prvním spuštění migrují.

Kompletní záloha workspace lze exportovat do JSON a následně importovat na jiném zařízení.

## Deployment

Push do main spouští GitHub Actions: checkout → Node 22 → npm install → next build → upload Pages artifact → deploy Pages.

Next.js používá static export a výsledkem je složka out/.

## Lokální vývoj

npm install
npm run dev

Production build:

npm run build
npm run start

## Omezení static-only architektury

GitHub Pages nemá serverový runtime. Tato verze proto neposkytuje centrální cloudovou databázi, multi-user realtime synchronizaci, serverovou autentizaci ani serverové zápisy do repozitáře.

Místo toho poskytuje robustní browser workspace, přenositelné JSON zálohy a URL-based publikování.