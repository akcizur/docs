# Workspace / Editor Setup

AKCIZUR Docs používá pro GitHub Pages-only režim čistě browserový editor.

## Spuštění

```bash
npm install
npm run dev
```

Editor otevři na:

`http://localhost:3000/docs/workspace`

## Editor

Workspace používá BlockNote.

Podporuje:

- blokové odstavce
- nadpisy
- seznamy
- inline formátování
- undo / redo
- drag & drop bloků
- slash menu
- keyboard shortcuts editoru
- dark UI
- read-only veřejný režim

## Ukládání

Primární úložiště je IndexedDB:

`akcizur-docs / documents`

Záložní cesta je localStorage.

Uložení probíhá automaticky po změně dokumentů s krátkým debounce intervalem.

## Dokumenty

Každý dokument obsahuje:

- `id`
- `title`
- `content`
- `parentId`
- `icon`
- `archived`
- `published`
- `coverDataUrl`
- `createdAt`
- `updatedAt`

Poddokumenty mohou být vnořené do libovolné hloubky.

## Koš

Archivace přesune dokument a celý jeho podstrom do koše.

V koši je možné:

- obnovit dokument,
- obnovit celý podstrom,
- trvale odstranit dokument a jeho podstrom.

## Záloha

Workspace lze exportovat jako JSON:

`Záloha → JSON`

Import:

`Import → vyber .json`

Při importu se ověří základní struktura dokumentů a rozbijí se neplatné parent vazby na kořen.

## Publikování

Publikace nepotřebuje server.

Dokument se zabalí do URL fragmentu:

`/docs/publish/#d=<payload>`

Payload je komprimovaný pomocí `fflate`.

Fragment se neodesílá na server, takže GitHub Pages může dokument zobrazit z čistě statické stránky.

### Omezení share URL

URL má praktický limit velikosti. Proto je URL publikování vhodné hlavně pro běžné dokumenty.

Velké přílohy nebo velmi dlouhé dokumenty mají zůstat v lokálním workspace a měly by se přenášet přes JSON zálohu.

## Cover

Cover obrázek lze nastavit z lokálního souboru.

UI limit:

`5 MB`

Cover se ukládá jako Data URL do lokální databáze. U velmi velkých obrázků se doporučuje před importem obrázek zmenšit.

## GitHub Pages

Produkční build:

```bash
npm run build
```

Next.js používá:

`output: 'export'`

Výstup:

`out/`

Deployment:

`main → GitHub Actions → Pages artifact → GitHub Pages`

## Důležité

Tato architektura záměrně nepoužívá:

- Vercel runtime
- Convex
- Clerk
- Next.js API routes pro workspace
- serverové filesystem zápisy
- runtime secrets

Celý workspace musí být schopen fungovat pouze ze statických souborů a browser API.
