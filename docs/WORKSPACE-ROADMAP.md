# AKCIZUR Docs — Workspace Roadmap

## Phase 1 — Foundation

- [x] Static GitHub Pages architecture
- [x] IndexedDB workspace storage
- [x] localStorage fallback
- [x] nested document tree
- [x] search
- [x] trash / restore / permanent delete
- [x] JSON backup / import
- [x] local share URL
- [x] BlockNote editor

## Phase 2 — UX cleanup

- [x] Document-first canvas
- [x] Remove permanent formatting toolbar
- [x] Remove editor container border
- [x] Increase document title hierarchy
- [x] Simplify sidebar
- [x] Simplify topbar
- [x] Hide technical storage information from primary UI
- [x] Add Ctrl/Cmd+K search
- [x] Improve empty-state guidance

## Phase 3 — Interaction quality

- [ ] Slash-command visual refinement
- [ ] Better block drag affordance
- [ ] Keyboard shortcut help
- [ ] Better mobile navigation overlay
- [ ] Touch target audit
- [ ] Focus-state audit
- [ ] Unsaved/autosave feedback without technical wording

## Phase 4 — Publishing

- [x] Compressed static share URL
- [x] Share payload validation
- [x] Share URL size guard
- [x] Do not mark a document published if share creation fails
- [ ] Dedicated share preview styling
- [ ] Optional cover optimization before embedding

## Phase 5 — Visual system

- [x] Workspace UX rules
- [x] Monochrome token system
- [x] Unified spacing scale
- [x] Typography hierarchy
- [ ] Full component audit against UX rules
- [ ] Mobile visual QA
- [ ] Keyboard/accessibility QA

## Definition of Done

A workspace release is considered complete only when:

- the document remains the visual center
- editing is possible without hunting for controls
- navigation is obvious
- technical implementation details are not exposed in primary UI
- desktop and mobile remain usable
- GitHub Pages build succeeds
- the chat log is updated