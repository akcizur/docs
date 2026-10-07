# AKCIZUR Docs — Workspace UI Rules

## Purpose

This document is the product rulebook for the `/workspace` interface.

The workspace is a writing environment, not an administration dashboard.

Primary hierarchy:

1. Page
2. Title
3. Content
4. Navigation
5. Secondary actions
6. Technical information

The document must always remain the dominant visual object.

---

## 1. Product character

Target:

- quiet
- editorial
- precise
- fast
- premium
- monochrome

Avoid:

- CMS/admin-panel appearance
- dense control panels
- decorative gradients
- excessive glass effects
- excessive borders
- permanent editor toolbars
- technical implementation details in primary UI

---

## 2. Layout

~~~text
┌──────────────────────────────────────────────────────────────┐
│ topbar                                                       │
├──────────────┬───────────────────────────────────────────────┤
│              │                                               │
│   sidebar    │             document canvas                  │
│   260–280px  │                                               │
│              │          icon                                 │
│              │          title                                │
│              │          content                              │
│              │                                               │
└──────────────┴───────────────────────────────────────────────┘
~~~

Rules:

- sidebar: 260–280 px
- topbar: 56–60 px
- document canvas: 900–980 px maximum
- document canvas has no permanent card border
- editor must visually merge with the document canvas
- whitespace is intentional

---

## 3. Visual hierarchy

### Document title

- 48–60 px
- weight 600
- tracking approximately -0.04em

### Body

- 16–17 px
- line-height 1.7–1.8

### Navigation

- 12–13 px

### Metadata

- 10–11 px
- opacity 0.25–0.45

Metadata must never compete with the title or body.

---

## 4. Color tokens

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

No colorful accent system is used inside the workspace.

Color communicates hierarchy rather than decoration.

---

## 5. Border rule

Borders are structural only.

Use them for:

- sidebar separator
- topbar separator
- input
- dropdown
- modal
- important button

Do not use borders around:

- the whole document
- the editor surface
- every metadata item
- every paragraph
- every card-like area

---

## 6. Document rule

The document should feel like a real page.

Preferred:

~~~text
        ◇

        Architektura

        6. 10. 2026

        Next.js + Fumadocs...
        ...
~~~

Not:

~~~text
┌────────────────────────────┐
│ editor                     │
│                            │
└────────────────────────────┘
~~~

The editor is part of the document, not a framed application inside it.

---

## 7. Sidebar rule

The sidebar is navigation, not diagnostics.

Primary content:

~~~text
+ Nová stránka

⌕ Hledat

STRÁNKY
  Architektura
    Frontend
    Backend
  Projekty
  Poznámky

Koš
~~~

Do not permanently expose:

- IndexedDB
- localStorage
- GitHub Pages implementation notes
- storage state
- internal counters
- technical architecture

Technical details belong in settings or documentation.

---

## 8. Topbar rule

Left:

~~~text
☰  Workspace / Architektura
~~~

Right:

~~~text
Publikovat   ···
~~~

The topbar must stay quiet.

---

## 9. Editor behavior

The editor is a WYSIWYG writing surface.

Core interactions:

- click to focus
- type
- Enter
- / for block commands
- text selection
- block selection
- block movement
- keyboard shortcuts

Formatting controls are contextual.

A formatting toolbar must never remain permanently visible when the editor is idle.

---

## 10. Metadata rule

Keep metadata minimal.

Preferred:

~~~text
◇  Koncept · upraveno dnes
~~~

Avoid exposing implementation diagnostics in the document:

~~~text
IndexedDB + localStorage
Share URL prepared
Root document
~~~

---

## 11. Action hierarchy

### Primary

- Nová stránka
- Publikovat

### Secondary

- Hledat
- Sdílet

### Tertiary

- ···
- Koš
- Import
- Export

Do not display every available action simultaneously.

---

## 12. Motion

Motion should be subtle:

- 120–180 ms
- ease-out
- only for menus, hover, selection and panels

No large entrance animations.

---

## 13. Responsive behavior

### Desktop

Sidebar + document.

### Tablet

Collapsible sidebar + document.

### Mobile

Top bar + document + overlay navigation.

The document remains the primary object at every breakpoint.

---

## 14. Typography

Primary family:

~~~text
Inter
~~~

Scale:

~~~text
Title       58 / 600
H1          32 / 600
H2          24 / 600
Body        16 / 400
Navigation  13 / 500
Meta        11 / 400
~~~

Use one consistent type system.

---

## 15. Spacing

Preferred spacing scale:

~~~text
4
8
12
16
24
32
48
64
~~~

Avoid arbitrary spacing values unless required by the underlying editor.

---

## 16. UX rule

Every screen should answer one question:

> What should I do now?

Workspace: write.

Search: find a page.

Trash: restore or delete.

Publish: publish/share.

---

## 17. Notion influence

Borrow behavior, not visual identity.

Required behavior:

~~~text
new page
→ child page
→ nested tree
→ search
→ /
→ publish
→ trash
→ restore
~~~

Visual identity:

**AKCIZUR / monochrome / editorial / minimal**

---

## 18. Technical transparency

Implementation details must not dominate product UI.

Do not surface technical strings such as:

- IndexedDB + localStorage fallback
- GitHub Pages only
- Share URL prepared

unless they are relevant to a dedicated settings or diagnostic view.

---

## 19. Empty state

Empty documents must feel ready to write, not broken.

Preferred guidance:

> Začni psát. Pro nové bloky můžeš použít `/`.

The hint should disappear naturally once the document contains content.

---

## 20. Definition of done

A workspace change is accepted only when:

- the document remains visually dominant
- navigation is immediately understandable
- editing requires no technical knowledge
- UI does not look like an admin panel
- borders are structural, not decorative
- technical implementation is hidden from normal users
- desktop, tablet and mobile remain coherent
- the visual result is consistent with this document
