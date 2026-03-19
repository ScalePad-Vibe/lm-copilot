# ScalePad App Marketplace — UX Rebuild Plan

> **Status:** Design direction confirmed — ready to execute phase by phase.
> **Goal:** Complete UI/UX redesign with no loss of API integration logic.
> **Preserve:** All API calls, auth flow, data models, edge functions, and routing structure.

---

## 0. Design Inspiration Reference

Four uploaded reference components define the aesthetic direction:

| File | Key Takeaway |
|---|---|
| `Sidebar.tsx` | 256px always-expanded sidebar, `#1C1B1B` bg, gradient logo mark (indigo triangle), tight `tracking-tight` labels |
| `TopBar.tsx` | Frosted glass (`backdrop-blur-xl bg-background/80`), gradient "Bulk Action" button, user chip with avatar |
| `InitiativesTable.tsx` | Dense table: status dot clusters, mono revenue, 1px progress bar, actions fade in on row hover |
| `GlobalStatusCard.tsx` | Floating card, `backdrop-blur-md`, MD3-style token naming, segmented progress bar |
| `index.css` | Full Material Design 3 dark palette using Tailwind v4 `@theme` — rich surface layering system |

---

## 1. What We're Keeping (Do Not Touch)

| Layer | Files | Reason |
|---|---|---|
| API helpers | `src/lib/initiative-api.ts`, `src/lib/goal-api.ts`, `src/lib/scalepad-api.ts` | All pagination, proxy calls, and step sequencing is correct |
| Edge function proxy | `supabase/functions/scalepad-proxy/index.ts` | Handles CORS, 204, key forwarding |
| Auth context | `src/context/AuthContext.tsx` | API key hash identity + Supabase admin auth works |
| App store context | `src/context/AppStoreContext.tsx` | App registry loading pattern is fine |
| Routing | `src/App.tsx` | Route structure and guards are correct |
| Constants & types | `src/lib/constants.ts` | MarketplaceApp type, categories |
| App registry | `src/lib/mock-data.ts` | 3 apps — keep as-is |
| DB tables | `app_ratings`, `app_comments` | Schema is correct |
| Edge function | `supabase/functions/app-feedback/index.ts` | Ratings/comments logic is fine |

---

## 2. What We're Rebuilding

| Layer | Current Problem | New Approach |
|---|---|---|
| Design tokens | Generic dark blue, Syne/DM Sans, shallow surface stack | MD3-inspired deep dark palette, Inter, rich surface layering |
| Login page | Two-column card, boilerplate SaaS feel | Single column, frosted-glass card, API key primary |
| Shell layout | Fixed 240px sidebar + flat topbar | 256px sidebar (always expanded) + frosted-glass topbar |
| Marketplace | Flat card grid | Richer card with category badge, status dot, clean hover |
| App Detail | Long single-column scroll | Two-column: meta/ratings left (30%) · workspace right (70%) |
| Initiative / Goal workspace | Dense, lots of chrome | Cleaned panels matching InspiationsTable style |
| Admin panel | Plain table | InitiativesTable-style: status dots, hover-reveal actions |
| Settings | Basic form | Cleaned layout, same tokens |

---

## 3. New Design System

### 3.1 Color Palette
Based on the uploaded `index.css` MD3 dark palette, translated to **HSL variables** compatible with our existing Tailwind config and shadcn.

```css
/* index.css — new :root block */

/* ── Core layers (MD3 surface stack) ── */
--background:              220 8% 7%;    /* #131313 */
--surface:                 220 5% 11%;   /* #1C1B1B — sidebar, cards */
--surface-raised:          220 5% 13%;   /* #202020 — inputs, dropdowns */
--surface-container:       220 5% 16%;   /* #272626 — hover rows */
--surface-container-high:  220 5% 19%;   /* #2A2A2A */
--surface-container-highest: 220 5% 21%; /* #353534 — highest raised el */

/* ── Accent — indigo (from gradient #4D4AD5 → #332DBC) ── */
--primary:                 242 64% 57%;  /* #4D4AD5 */
--primary-dim:             244 62% 46%;  /* #332DBC — darker end of gradient */
--primary-foreground:      0 0% 100%;

/* ── Text ── */
--foreground:              20 5% 90%;    /* #E5E2E1 */
--muted-foreground:        0 0% 57%;     /* #919191 / --outline */
--on-surface-variant:      0 0% 78%;     /* #C6C6C6 */

/* ── Borders ── */
--border:                  0 0% 28% / 0.15;  /* #474747 at 15% — hairline */
--border-subtle:           0 0% 28% / 0.08;  /* rows/table separators */

/* ── Semantic ── */
--success:                 152 69% 45%;  /* emerald-500 */
--warning:                 38  92% 50%;  /* amber-500 */
--destructive:             0   80% 58%;  /* rose-500 */
--card:                    220 5% 11%;
--card-foreground:         20  5% 90%;
--popover:                 220 5% 13%;
--popover-foreground:      20  5% 90%;
--ring:                    242 64% 57%;
--input:                   220 5% 16%;
--radius:                  0.5rem;

/* ── Sidebar tokens ── */
--sidebar-background:      220 5% 11%;
--sidebar-foreground:      20  5% 90%;
--sidebar-primary:         242 64% 57%;
--sidebar-border:          0 0% 28% / 0.15;
```

### 3.2 Typography
Matching the uploaded reference exactly:

```
font-sans / font-body:    "Inter", ui-sans-serif        (weights 400, 500, 600, 700)
font-mono:                "JetBrains Mono", monospace    (endpoints, API keys, numbers)
```

> **Note**: Drop Syne and DM Sans. Inter is used for both headings and body in the reference. Apply `tracking-tight` to headings, `tracking-widest` to uppercase micro-labels.

Google Fonts import (add to `index.html`):
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### 3.3 Key Visual Patterns (from reference)

| Pattern | Implementation |
|---|---|
| Frosted glass surfaces | `bg-background/80 backdrop-blur-xl` |
| Primary gradient button | `bg-gradient-to-br from-primary to-primary-dim` |
| Indigo logo mark | `w-8 h-8 rounded bg-gradient-to-br from-primary to-primary-dim` |
| Table headers | `text-[10px] uppercase tracking-widest font-bold text-muted-foreground` |
| Row hover | `hover:bg-surface-container transition-colors group` |
| Action fade-in | `opacity-0 group-hover:opacity-100 transition-opacity` |
| Status dots | `w-3 h-3 rounded-full bg-emerald-500/80` (Done), amber (In Progress), rose (Blocked) |
| Progress bar | `h-1 bg-surface-container-highest rounded-full` with `bg-primary` fill |
| Category badges | `px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight` |
| Mono data | `font-mono font-medium` for numbers, keys, endpoints |
| Dividers | `border-border/15` — very subtle hairlines |
| Card float | `backdrop-blur-md bg-surface/90 rounded-xl border border-border/20 shadow-2xl` |

### 3.4 Animations

```css
/* Add to tailwind.config.ts keyframes */
"fade-up":   { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } }
"scale-in":  { from: { opacity: "0", transform: "scale(0.97)" },      to: { opacity: "1", transform: "scale(1)" } }
"slide-in":  { from: { opacity: "0", transform: "translateX(-12px)" }, to: { opacity: "1", transform: "translateX(0)" } }
```

---

## 4. New UX Flows

### 4.1 Shell Layout
```
┌────────────────────────────────────────────────────────────┐
│ Sidebar (256px fixed)  │  Topbar (frosted, fixed h-16)     │
│                        ├────────────────────────────────── │
│  [▽ Logo]              │                                   │
│  Marketplace           │  [Page content]                   │
│  Recent: App A         │  max-w-screen-xl, px-8 py-6       │
│  ─────────────────     │                                   │
│  Admin Panel           │                                   │
│  Settings              │                                   │
│  ─────────────────     │                                   │
│  [API key masked]      │                                   │
│  [Sign Out]            │                                   │
└────────────────────────┴───────────────────────────────────┘
```

**Sidebar** (`#1C1B1B` / `bg-surface`):
- Logo mark: `w-8 h-8` gradient indigo square with icon
- Nav items: `text-sm tracking-tight`, icon 18px, active = `bg-surface-container-highest text-foreground font-semibold`
- Bottom section: API key masked in mono, Sign Out link

**Topbar** (`bg-background/80 backdrop-blur-xl border-b border-border/15`):
- Left: Search input (`bg-surface border-none rounded-md`, focus ring indigo)
- Right: Notification bell + user chip (avatar + masked key)
- Admin users: gradient "Add App" or "Bulk Action" button visible

### 4.2 Login Page
```
┌─────────────────────────────────────────┐
│                                         │
│  [▽ Logo mark]  ScalePad                │
│     App Marketplace                     │
│                                         │
│  "Enter your ScalePad API key           │
│   to get started"                       │
│                                         │
│  [API Key Input ─────────────────────]  │
│  [Continue →  (gradient button)      ]  │
│                                         │
│  ── or ──                               │
│                                         │
│  [Admin Login ▾] (expandable)           │
│    email + password + Sign In           │
│                                         │
└─────────────────────────────────────────┘
```
- Centered card with `backdrop-blur-md`, `bg-surface/90`, `rounded-xl`
- Dark full-bleed background, subtle radial gradient behind card
- API key input: `font-mono`, shows live masked preview as user types
- Admin section collapses/expands with smooth animation

### 4.3 Marketplace
- Category chips below topbar (horizontal scroll): `All | Planning | Reporting | ...`
- App cards: 2-col grid, each card `bg-surface rounded-xl border border-border/20 p-5`
  - Icon (emoji, 40px) + Name (font-semibold) + category badge + status dot
  - Description (2 lines max, clamp)
  - Footer: author · version · `Open →` button (ghost)
  - Hover: `hover:border-primary/30 hover:bg-surface-container transition-all`

### 4.4 App Detail
```
┌─────────────────────┬───────────────────────────────────────┐
│ Meta (30%)          │ Workspace (70%)                       │
│                     │                                       │
│ ← Back              │ [Full workspace component fills       │
│ 🚀 Initiative Mgr   │  this column — Initiative/Goal/Mini] │
│ [active] v1.0.0     │                                       │
│                     │                                       │
│ Description         │                                       │
│                     │                                       │
│ How it works        │                                       │
│                     │                                       │
│ Endpoint (mono)     │                                       │
│                     │                                       │
│ ─────────────────── │                                       │
│ ★ Ratings &         │                                       │
│   Comments          │                                       │
└─────────────────────┴───────────────────────────────────────┘
```
Both columns are full-height and independently scrollable.

### 4.5 Initiative / Goal Workspace
Keep the 40/60 Library/Builder split. Visual cleanup only:
- Library table headers: `text-[10px] uppercase tracking-widest` (reference style)
- Row hover: `group` + `hover:bg-surface-container`
- Action buttons (edit, delete): `opacity-0 group-hover:opacity-100`
- Status badges: pill style from reference (`rounded-full text-[10px] font-bold uppercase`)
- Progress bars: `h-1` slim bars matching reference
- Deploy button: full-width gradient (`from-primary to-primary-dim`)
- Deployment modal: `backdrop-blur-md`, `scale-in` animation

### 4.6 Admin Panel
Restyle table to match `InitiativesTable.tsx` reference:
- Same `text-[10px] uppercase tracking-widest` headers
- Category color badges
- Actions fade in on row hover (`group-hover:opacity-100`)
- Same border treatment: `border-border/15` headers, `border-border/5` rows

---

## 5. Phase-by-Phase Checklist

### Phase 1 — Design Foundation *(start here)*
- [ ] Update `index.html` with Inter + JetBrains Mono Google Fonts
- [ ] Rewrite `src/index.css` — new HSL token block (palette above)
- [ ] Update `tailwind.config.ts` — new fonts, new animation keyframes, surface-container color tokens

### Phase 2 — Shell
- [ ] Rebuild `src/components/layout/Sidebar.tsx` — gradient logo mark, reference nav style
- [ ] Rebuild `src/components/layout/Topbar.tsx` — frosted glass, gradient button, user chip

### Phase 3 — Pages
- [ ] Rebuild `src/pages/Login.tsx` — centered frosted card, API key primary, admin expand
- [ ] Rebuild `src/pages/Marketplace.tsx` — category chips + richer cards
- [ ] Rebuild `src/pages/AppDetail.tsx` — two-column meta/workspace
- [ ] Restyle `src/pages/Admin.tsx` — InitiativesTable-style table
- [ ] Restyle `src/pages/Settings.tsx` — cleaned layout

### Phase 4 — Workspace Visual Polish *(no logic changes)*
- [ ] `src/components/workspace/InitiativeManagerWorkspace.tsx` — table + badges + deploy button
- [ ] `src/components/workspace/GoalManagerWorkspace.tsx` — same cleanup
- [ ] `src/components/marketplace/AppRatingsComments.tsx` — consistent tokens

### Phase 5 — QA
- [ ] All ScalePad API calls still work (proxy, pagination, deploy flow)
- [ ] Admin login / Supabase auth still works
- [ ] Ratings + comments still work
- [ ] Responsive check at 1280px, 1440px, 1920px

---

## 6. Firm Constraints
- No routing changes
- No API helper changes
- No edge function changes
- No DB schema changes
- No new features during the visual rebuild
- Desktop-first (same as today, no mobile overhaul)

---

## 7. Decisions Made

| Question | Decision |
|---|---|
| Color accent | Indigo `#4D4AD5 → #332DBC` gradient (from reference) |
| Sidebar style | Always-expanded 256px (matches reference `Sidebar.tsx`) |
| App detail layout | Two-column — meta left (30%) / workspace right (70%) |
| Workspace split | Keep 40/60 Library / Builder |
| Font | Inter only (drop Syne/DM Sans) — matches reference |
| Surface depth | Full MD3 surface stack (5 levels) from uploaded `index.css` |

---

*Updated: 2026-03-19 — Design direction confirmed. Ready to start Phase 1.*
