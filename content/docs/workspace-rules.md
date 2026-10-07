---
title: Workspace UI Rules
description: Pravidla pro vizuální a UX systém AKCIZUR Docs Workspace
---

# AKCIZUR Docs Workspace

Workspace je pracovní plocha pro psaní, ne administrační dashboard.

## Hlavní hierarchie

**Stránka → titul → obsah → navigace → sekundární akce → technické informace**

Dokument je vždy hlavní vizuální objekt.

## Vizuální charakter

- monochrome
- editorial
- minimal
- quiet
- precise
- fast

Vyhnout se vzhledu CMS/admin panelu, přebytečným kartám, dekorativním gradientům a nadměrnému množství borderů.

## Layout

- sidebar: 260–280 px
- topbar: 56–60 px
- document canvas: 900–980 px maximum
- editor bez permanentního rámečku
- dostatek volného prostoru

## Typografie

~~~text
Title       58 / 600
H1          32 / 600
H2          24 / 600
Body        16 / 400
Navigation  13 / 500
Meta        11 / 400
~~~

Používat jednu hlavní typografickou rodinu: Inter.

## Barvy

~~~text
Canvas       #0B0B0C
Sidebar      #101011
Elevated     #151516
Primary      #F5F5F5
Secondary    rgba(255,255,255,.62)
Muted        rgba(255,255,255,.32)
Subtle       rgba(255,255,255,.12)
Hairline     rgba(255,255,255,.07)
~~~

Barva komunikuje hierarchii; neslouží jako dekorace.

## Editor

Editor musí působit jako součást stránky.

Povolené hlavní interakce:

- psaní
- Enter
- / block commands
- text selection
- block selection
- drag/move
- keyboard shortcuts

Formatting toolbar je **contextual**, nikoliv permanentní.

## Sidebar

Sidebar je navigation tree.

Obsahuje:

- Nová stránka
- Hledat
- strom stránek
- Koš
- Záloha / Import

Technické detaily jako IndexedDB, localStorage a GitHub Pages implementace nejsou součástí hlavní navigace.

## Topbar

Vlevo: Workspace / Název stránky

Vpravo: Publikovat a ···

Topbar musí zůstat vizuálně klidný.

## Responsive

### Desktop

Sidebar + dokument.

### Tablet

Collapsible sidebar + dokument.

### Mobile

Topbar + dokument + overlay navigation.

Dokument zůstává hlavním objektem na všech velikostech.

## Definition of Done

UI je přijatelné pouze tehdy, když:

- dokument je nejsilnější prvek
- editace je okamžitě pochopitelná
- rozhraní nepůsobí jako admin panel
- technické detaily nejsou v hlavní cestě
- border slouží ke struktuře
- layout funguje na desktopu, tabletu i mobilu
- vizuální rozhodnutí odpovídají pravidlům tohoto dokumentu
