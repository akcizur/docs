# AKCIZUR Docs — Workspace UX Rules

## Purpose

Tento dokument je závazný vizuální a UX základ pro `/workspace`.

Workspace není administrace ani dashboard. Je to klidná pracovní plocha pro psaní, organizaci stránek a publikování.

## 1. Primární hierarchie

Priorita UI:

1. dokument
2. nadpis dokumentu
3. obsah
4. navigace
5. akce
6. metadata
7. technické informace

Dokument nesmí vizuálně soupeřit se sidebarem ani toolbarovými prvky.

## 2. Layout

```text
┌──────────────────────────────────────────────────────────────┐
│ topbar                                                       │
├──────────────┬───────────────────────────────────────────────┤
│              │                                               │
│   sidebar    │             document canvas                  │
│   260–280px  │                                               │
│              │          icon                                 │
│              │          title                                │
│              │          content                              │
└──────────────┴───────────────────────────────────────────────┘
```

- sidebar: 260–280 px
- topbar: 56–60 px
- document canvas: přibližně 900–980 px
- dokument nemá rámeček
- editor je součást canvasu
- velké plochy mají dýchat

## 3. Document-first

Dokument je hlavní objekt aplikace.

Nepoužívat velký samostatný editor panel.

```text
◇

Architektura

Koncept · upraveno dnes

Text dokumentu...
```

## 4. Typography

Použít jednu hlavní font family: Inter.

| Role | Velikost | Váha |
|---|---:|---:|
| document title | 48–60 px | 600 |
| H1 | 32 px | 600 |
| H2 | 24 px | 600 |
| body | 16–17 px | 400 |
| navigation | 12–13 px | 500 |
| metadata | 10–11 px | 400 |

## 5. Color tokens

```text
canvas       #0B0B0C
sidebar      #101011
elevated     #151516
text         #F5F5F5
secondary    rgba(255,255,255,.62)
muted        rgba(255,255,255,.32)
subtle       rgba(255,255,255,.12)
hairline     rgba(255,255,255,.07)
```

Workspace nepoužívá barevné akcenty. Barva je pouze hierarchický nástroj.

## 6. Borders

Border pouze pro funkční oddělení sidebaru, topbaru, inputu, menu, modalu a buttonů.

Nedávat border kolem celého dokumentu, editoru ani každého informačního bloku.

## 7. Sidebar

Sidebar je navigační strom.

```text
+ Nová stránka

⌕ Hledat

STRÁNKY
  Architektura
    Frontend
    Backend
  Projekty
  Poznámky

Koš
Záloha
Import
Dokumentace
```

Technické informace typu IndexedDB, GitHub Pages nebo storage fallback nepatří do hlavního sidebaru.

## 8. Topbar

Topbar je minimální.

Vlevo: `☰ Workspace / Architektura`.

Vpravo: `Publikovat ···`.

Topbar nesmí být výraznější než dokument.

## 9. Editor

Editor je WYSIWYG canvas.

Primární interakce: click, type, Enter, `/`, drag block, selection a keyboard shortcuts.

Formatting toolbar se nezobrazuje permanentně. Kontextové menu se objeví pouze při práci s konkrétním blokem nebo textem.

## 10. Empty state

Prázdná stránka musí působit jako začátek práce:

> Začni psát. Pro nové bloky použij `/`.

Hint zmizí po vložení obsahu.

## 11. Metadata

Metadata jsou sekundární.

Preferovaný model: `Koncept · 6. 10. 2026 21:05`.

Technické informace patří do nastavení nebo dokumentace.

## 12. Actions

Primary: Nová stránka, Publikovat.

Secondary: Hledat, Sdílet.

Tertiary: menu, Koš, Import, Export.

Nevystavovat všechny akce současně.

## 13. Motion

Pouze jemný pohyb: 120–180 ms, ease-out.

## 14. Responsive

Desktop = sidebar + document canvas.

Tablet = sidebar lze skrýt.

Mobile = dokument zůstává prioritou, navigace je overlay / collapsed.

## 15. Spacing

Používat pouze 4, 8, 12, 16, 24, 32, 48, 64.

## 16. Language

Primární UI je v češtině. Labels mají být krátké a jednoznačné.

## 17. Notion inspiration

Notion je inspirační zdroj pro chování, nikoli vizuální kopie.

Požadované chování: nested pages, page tree, search, child pages, slash commands, trash, restore, publish, export/import.

Vizuální jazyk AKCIZUR Docs zůstává vlastní: monochrome, editorial, minimal, quiet.

## 18. Product feeling

`QUIET · EDITORIAL · PRECISE · FAST · PREMIUM`

Nevytvářet admin panel, CMS demo ani technical form.

## 19. Definition of Done

- dokument je stále hlavním objektem
- obsah je čitelnější než před změnou
- nepřibyly zbytečné rámečky
- technická metadata nejsou v hlavním UI
- je jasné, co má uživatel právě udělat
- desktop, tablet i mobile zůstávají použitelné
- cesta k psaní je rychlá bez hledání ovladačů

## 20. Implementation rule

Neřešit UI po jednotlivých komponentách izolovaně.

Každá změna respektuje celý systém: canvas → navigation → typography → interaction → responsive.
