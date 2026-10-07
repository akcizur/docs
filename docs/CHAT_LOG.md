# AKCIZUR Docs — Chat Log

> Persistent conversation log for the workspace redesign.
>
> Rule: every subsequent design/implementation turn must append the exact user message and the assistant's corresponding visible response. Tool calls, hidden reasoning and internal metadata are not copied.

## 2026-10-07

### User

oprav

### Assistant

Prověřím aktuální `akcizur/docs`, najdu poslední konkrétní chybu a opravím ji přímo v repozitáři. Potom znovu ověřím build a GitHub Pages workflow.

### Assistant

Předchozí zápis se kvůli syntaktické chybě vůbec neprovedl. Opakuji jej opraveně, bez změny cíle.

### Assistant

Oprava je v `main`. Teď ověřím nový Actions build a zkontroluji, že změny skutečně prošly TypeScript/Next buildem bez regresí.

### Assistant

Opraveno přímo v `akcizur/docs` na `main`.

Změny:
- `Ctrl+K` / `⌘K` nyní okamžitě aktivuje vyhledávání.
- Share odkazy jsou robustnější:
  - velký cover se nevkládá do URL,
  - obrázky v share payloadu jsou validovány,
  - příliš velký dokument odmítne nefunkční share URL místo vytvoření rozbitého odkazu.
- Dokument se označí jako publikovaný až po úspěšném vytvoření share URL.

Commity:
- `ffb655e` — search shortcut
- `67022b1` — hardened share links
- `158b331` — oprava pořadí publikace

GitHub Actions pro poslední commit zpracovává build a deployment.

---

### User

[Screenshot workspace stránky]

neni to uzivatelsky privetive !! neni hezke

### Assistant

Z obrázku je problém jasný: editor působí jako prázdný technický panel, obsah je příliš úzký, kontrast je slabý a BlockNote UI vizuálně „prosakuje“ do stránky. Přestavím workspace na čistší Notion-like layout: výraznější typografie, širší dokument, skutečný canvas místo rámečku, kultivovanější sidebar a jednodušší editor bez trvale zobrazeného toolbaru.

### User

lépe , navrhni rule plan

### Assistant

## RULE PLAN — AKCIZUR DOCS Workspace

Současný směr bych už dál „nekrášlil“ po jednotlivých prvcích. Potřebuje pevná pravidla pro celý workspace, aby UI působilo jako jeden produkt.

### 1. Základní princip

**Workspace = pracovní plocha, ne dashboard.**

Primární pozornost musí být vždy:

**stránka → titul → obsah → psaní**

Vše ostatní je sekundární.

### 2. Layout rule

Použít 3 jasné vrstvy:

~~~
┌──────────────────────────────────────────────────────────────┐
│ topbar                                                       │
├──────────────┬───────────────────────────────────────────────┤
│              │                                               │
│   sidebar    │              document canvas                 │
│   260–280px  │                                               │
│              │          icon                                 │
│              │          title                                │
│              │          content                              │
└──────────────┴───────────────────────────────────────────────┘
~~~

- sidebar: 260–280 px
- topbar: 56–60 px
- document canvas: maximálně 900–980 px
- žádný obří tmavý panel uvnitř dokumentu
- editor musí vizuálně splývat s canvasem
- prostor okolo dokumentu je záměrný „breathing room“

### 3. Visual hierarchy

- title: 48–60 px / 600 / tracking -0.04em
- body: 16–17 px / line-height 1.7–1.8
- navigation: 12–13 px
- metadata: 10–11 px / opacity 0.25–0.45

### 4. Color rules

~~~
Canvas       #0B0B0C
Sidebar      #101011
Elevated     #151516
White        #F5F5F5
Secondary    rgba(255,255,255,.62)
Muted        rgba(255,255,255,.32)
Subtle       rgba(255,255,255,.12)
Hairline     rgba(255,255,255,.07)
~~~

Barva má určovat hierarchii, ne dekoraci.

### 5. Borders rule

Border pouze tam, kde rozděluje funkce.

Používat pro sidebar separator, topbar separator, input, dropdown, modal a důležitá tlačítka.

Nepoužívat kolem dokumentu, editoru, každého metadata bloku, každého odstavce a každé karty.

### 6. Document rule

Dokument musí působit jako skutečná stránka, nikoli jako editor uvnitř rámečku.

### 7. Sidebar rule

Sidebar je navigation tree, ne administrace.

Má obsahovat zejména:

~~~
+ Nová stránka
⌕ Hledat

STRÁNKY
  Architektura
    Frontend
    Backend
  Projekt
  Poznámky

Koš
~~~

Technické informace typu IndexedDB, GitHub Pages nebo storage stav nemají být trvale viditelné.

### 8. Topbar rule

Vlevo:

~~~
☰   Workspace / Architektura
~~~

Vpravo:

~~~
Publikovat   ···
~~~

### 9. Editing rule

Editor musí být WYSIWYG canvas.

Základní interakce:

- click anywhere
- type
- Enter
- /
- drag block
- select text
- keyboard shortcuts

Toolbar se zobrazí **contextually**, ne permanentně.

### 10. Metadata rule

Použít pouze jemné metadata typu:

~~~
◇   Koncept · upraveno dnes
~~~

Technické diagnostické údaje patří mimo hlavní dokument.

### 11. Action rule

Primary:
- Nová stránka
- Publikovat

Secondary:
- Hledat
- Sdílet

Tertiary:
- ···
- Koš
- Import
- Export

### 12. Motion rule

Používat 120–180 ms, ease-out, pouze pro menu, hover, selection a panely.

### 13. Responsive rule

Desktop: sidebar + document.

Tablet: collapsed sidebar + document.

Mobile: topbar + document + overlay navigation.

Dokument musí zůstat hlavním objektem.

### 14. Typography rule

Jedna hlavní rodina, doporučeně Inter.

~~~
Title       58 / 600
H1          32 / 600
H2          24 / 600
Body        16 / 400
Navigation  13 / 500
Meta        11 / 400
~~~

### 15. Spacing rule

Používat:

~~~
4
8
12
16
24
32
48
64
~~~

### 16. Interaction rule

Každá obrazovka musí mít jasnou odpověď na „Co mám udělat právě teď?“

Workspace: psát.

Search: najít stránku.

Trash: obnovit nebo smazat.

Publish: publikovat.

### 17. Notion model

Inspirace Notionem pouze v chování:

~~~
New page
→ child page
→ nested tree
→ search
→ /
→ publish
→ trash
→ restore
~~~

Vizuální jazyk: **AKCIZUR / monochrome / editorial / minimal.**

### 18. Technical information

Technické informace nemají dominovat UI.

### 19. Empty state

Prázdná stránka má působit připraveně k psaní:

> Začni psát. Pro nové bloky můžeš použít `/`.

### 20. Definition of done

Změna je hotová, když dokument zůstane vizuálně dominantní, navigace je okamžitě pochopitelná, editace nevyžaduje technické znalosti, UI nepůsobí jako admin panel, border je strukturální a desktop/tablet/mobile zůstávají konzistentní.

### User

ano , delej .md dokumentaci a komplet vzdy copy this chat messeges

## Persistent implementation rule

This repository now treats the conversation as part of the project record.

For every future workspace redesign turn:

1. implement the requested change;
2. update the relevant Markdown documentation;
3. append the exact visible user message to this file;
4. append the exact visible assistant response;
5. record resulting commit SHA(s) and verification state.

Do not copy internal tool calls, hidden reasoning, credentials, tokens or private system information.
