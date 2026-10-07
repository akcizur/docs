# AKCIZUR Docs — Chat Log

> Účel: průběžný pracovní záznam této konverzace k workspace projektu.
>
> Pravidlo: při každé další významné iteraci se tento soubor aktualizuje o nové uživatelské a asistentovy viditelné zprávy. Neobsahuje systémové instrukce, interní chain-of-thought ani neveřejné tool payloady.

## 2026-10-07 — Workspace redesign

### USER

> oprav

### ASSISTANT

Prověřím aktuální `akcizur/docs`, najdu poslední konkrétní chybu a opravím ji přímo v repozitáři. Potom znovu ověřím build a GitHub Pages workflow.

### USER

> [Screenshot workspace]
>
> neni to uzivatelsky privetive !! neni hezke

### ASSISTANT

Z obrázku je problém jasný: editor působí jako prázdný technický panel, obsah je příliš úzký, kontrast je slabý a BlockNote UI vizuálně „prosakuje“ do stránky. Přestavím workspace na čistší Notion-like layout: výraznější typografie, širší dokument, skutečný canvas místo rámečku, kultivovanější sidebar a jednodušší editor bez trvale zobrazeného toolbaru.

### USER

> lépe , navrhni rule plan

### ASSISTANT

Navržený základ: Workspace = pracovní plocha, ne dashboard. Primární pozornost je vždy stránka → titul → obsah → psaní. Zbytek je sekundární.

Pravidla zahrnují:

- document-first layout
- sidebar 260–280 px
- topbar 56–60 px
- document canvas přibližně 900–980 px
- žádný rámeček kolem dokumentu
- typografickou hierarchii
- monochromatické tokeny
- minimum borderů
- navigační sidebar místo administrativního panelu
- minimální topbar
- WYSIWYG canvas bez permanentního formatting toolbaru
- čistý empty state
- technická metadata mimo hlavní UI
- tři úrovně akcí
- jemný motion systém
- responsive desktop/tablet/mobile pravidla
- jednotný spacing systém
- vlastní AKCIZUR vizuální jazyk při zachování Notion-like chování
- Definition of Done pro každou větší UI změnu.

### USER

> ano , delej .md dokumentaci a komplet vzdy copy this chat messeges

## Working rule

Každá další významná změna workspace má současně:

1. upravit implementaci podle `docs/WORKSPACE-UX-RULES.md`
2. aktualizovat tento `docs/CHAT-LOG.md`
3. ověřit GitHub Pages build
4. nevracet zpět dokument-first princip

### ASSISTANT — current implementation

Implementováno a zapsáno do repozitáře:

- redesign workspace podle UX rules
- editor jako transparentní document canvas
- odstranění permanentního formatting toolbaru
- širší dokumentová plocha
- jednodušší sidebar a topbar
- výraznější title hierarchy
- odstranění technického footeru z dokumentu
- jemnější metadata
- nové UX dokumenty
- průběžný chat log jako závazná součást workflow

Dokumentace:
- `docs/WORKSPACE-UX-RULES.md`
- `docs/WORKSPACE-ROADMAP.md`
- `docs/CHAT-LOG.md`

Aktuální GitHub Pages workflow pro poslední commit je spuštěný; před zveřejněním je nutné ověřit zelený build.
