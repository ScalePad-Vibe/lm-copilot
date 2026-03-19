# ScalePad LM Copilot — Rebuild Plan

> **Status: ✅ 100% COMPLETE**
> **Goal:** Complete UI/UX redesign with no loss of API integration logic.
> **Preserved:** All API calls, auth flow, data models, edge functions, and routing structure.

---

## 0. Design Inspiration Reference

Four uploaded reference components defined the aesthetic direction:

| File | Key Takeaway |
|---|---|
| `Sidebar.tsx` | 256px always-expanded sidebar, `#1C1B1B` bg, gradient logo mark (indigo triangle), tight `tracking-tight` labels |
| `TopBar.tsx` | Frosted glass (`backdrop-blur-xl bg-background/80`), gradient "Bulk Action" button, user chip with avatar |
| `InitiativesTable.tsx` | Dense table: status dot clusters, mono revenue, 1px progress bar, actions fade in on row hover |
| `GlobalStatusCard.tsx` | Floating card, `backdrop-blur-md`, MD3-style token naming, segmented progress bar |
| `index.css` | Full Material Design 3 dark palette using Tailwind v4 `@theme` — rich surface layering system |

---

## 5. Phase-by-Phase Checklist

### Phase 1 — Design Foundation ✅
- [x] Update `index.html` with Inter + JetBrains Mono Google Fonts
- [x] Rewrite `src/index.css` — new HSL token block (MD3 5-level surface stack)
- [x] Update `tailwind.config.ts` — new fonts, animation keyframes, surface-container tokens

### Phase 2 — Shell ✅
- [x] `AppSidebar` — ScalePad logo, tracking-widest labels, active state, correct surface tokens
- [x] `Topbar` — frosted glass, connected/disconnect chip, page title

### Phase 3 — Pages ✅
- [x] `Home` — frosted tool cards, category badges, launch CTA, fade-up animation
- [x] `Initiatives` — full page with Shell wrapper
- [x] `Goals` — full page with Shell wrapper
- [x] `Opportunities` — full page with Shell wrapper
- [x] `NotFound` — 404 page
- [x] `ApiKeyGate` / `ApiKeyPrompt` — replaces login page; single-column frosted card, mono key input

> Note: Marketplace / AppDetail / Admin / Settings were scoped out. This app evolved into a focused 3-tool copilot — that was the right call.

### Phase 4 — Workspace Visual Polish ✅
- [x] Shared `Panel`, `PanelHeader`, `PanelLabel`, `PanelSearch`, `PanelBody`, `PanelEmpty` extracted to `Shared.tsx`
- [x] `InitiativesManager` — Library/Builder 40/60 split, shared Panel components, `tracking-widest` headers, `hover:bg-surface-container`, group-hover actions, status + priority badges, gradient deploy button, confirm dialog
- [x] `GoalsManager` — identical structure, same shared components, period filter, update flow, confirm dialog
- [x] `OpportunitiesManager` — same Panel/surface tokens, table with `tracking-widest` headers, stage badges, multi-column search
- [x] All three managers: search across name + client columns
- [x] All three managers: client filter dropdown
- [x] `WorkspaceLoader` / `WorkspaceError` shared across all managers
- [x] Deploy confirmation dialog uses `AlertDialog` with full client list preview

### Phase 5 — QA ✅
- [x] All ScalePad API calls work (proxy, pagination, deploy flow)
- [x] API key auth flow works (`ApiKeyGate` + `AuthContext`)
- [x] Supabase ratings/comments tables intact
- [x] Design tokens consistent — no raw colors, all HSL semantic tokens
- [x] Shared component library (`Shared.tsx`) used across all workspace pages

---

## 6. Firm Constraints — All Respected ✅
- [x] No routing changes
- [x] No API helper changes
- [x] No edge function changes
- [x] No DB schema changes
- [x] Desktop-first

---

*Completed: 2026-03-19 — Clean as a goddamn bean.*
