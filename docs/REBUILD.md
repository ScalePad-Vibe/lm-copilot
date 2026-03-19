# ScalePad App Marketplace — UX Rebuild Plan

> **Status:** Planning  
> **Goal:** Complete UI/UX redesign with no loss of API integration logic.  
> **Preserve:** All API calls, auth flow, data models, edge functions, and routing structure.

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
| Design tokens | Dark blue palette, generic Syne/DM Sans | New palette + font pairing (see §4) |
| Login page | Two-column card, looks like a boilerplate SaaS | Single focused entry flow |
| Shell layout | Fixed 240px sidebar + topbar — cramped, no breathing room | New shell: thinner rail nav + wider content area |
| Marketplace | Card grid — OK but visually flat | Editorial list/grid with richer metadata |
| App Detail | Long scrolling single page | Two-column: meta left, workspace right (no scroll fighting) |
| Initiative Manager workspace | Dense, lots of chrome | Cleaned panels, better visual hierarchy |
| Goal Manager workspace | Same as above | Same cleanup |
| Admin panel | Plain table | Cleaner table, same functionality |
| Settings page | Basic form | Cleaned layout |

---

## 3. New UX Flows

### 3.1 Entry / Auth
```
/ → /login

Login page:
  ┌─────────────────────────────────────┐
  │  [Logo + product name]              │
  │                                     │
  │  "Enter your ScalePad API key"      │
  │  [API Key input]  [Continue →]      │
  │                                     │
  │  ─── or ───                         │
  │                                     │
  │  [Admin Login]  (collapsed/link)    │
  └─────────────────────────────────────┘
```
- Primary path is API key (80% of users)
- Admin login is a secondary, de-emphasized link that expands inline
- No tabs, no two-column layout
- Show key masking preview as user types

### 3.2 Shell / Navigation
```
┌──────┬──────────────────────────────────────────────┐
│ rail │  [Topbar: breadcrumb + search + user chip]   │
│      │                                              │
│ 64px │  [Page content — full width, generous pad]  │
│      │                                              │
│      │                                              │
└──────┴──────────────────────────────────────────────┘
```
- **Left rail** (64px): icon-only nav with tooltips. Expands to 220px on hover (CSS transition, no JS).
  - Icons: Marketplace, Recent (clock), Admin (shield, admin only), Settings, Sign Out
- **Topbar**: Shows breadcrumb trail (e.g. `Marketplace / Initiative Manager`), global search, and a user chip showing masked API key.
- No category sidebar in shell — categories move to Marketplace page as horizontal chip strip below topbar.

### 3.3 Marketplace
```
[Chip filter row: All | Planning | Reporting | ...]

[App cards — 2 or 3 col grid]
  ┌─────────────────────┐
  │  🚀  Initiative Mgr │
  │  Planning  · active │
  │  Description...     │
  │             [Open →]│
  └─────────────────────┘
```
- Search stays in topbar
- Category chips replace sidebar category list
- Cards: icon, name, category badge, status dot, short description, launch button
- Hover state lifts card (subtle shadow + border color transition)
- Empty state with clear message when no results

### 3.4 App Detail
```
┌─────────────────────────────────────────────────────┐
│ ← Back   🚀 Initiative Manager   [active]  v1.0.0  │
├──────────────────┬──────────────────────────────────┤
│  Meta / Info     │  Workspace (Initiative/Goal Mgr  │
│  (30%)           │  or generic MiniApp)  (70%)       │
│                  │                                   │
│  Description     │  [Full workspace component]       │
│  How it works    │                                   │
│  Endpoint        │                                   │
│                  │                                   │
│  ─────────────── │                                   │
│  Ratings &       │                                   │
│  Comments        │                                   │
└──────────────────┴──────────────────────────────────┘
```
- Left column: static info + ratings/comments
- Right column: full-height workspace — no need to scroll past app info to reach the tool

### 3.5 Workspace Panels (Initiative / Goal Manager)
Keep exact same panel layout (Library left 40% / Builder right 60%) but:
- Reduce visual noise: tighter spacing, less border chrome
- Table rows: cleaner, more generous row height
- Buttons: consistent size/weight throughout
- Modals: blur backdrop, cleaner close button
- Status badges: pill shape, consistent across both workspaces

---

## 4. New Design System

### 4.1 Palette
Shift from "generic dark SaaS blue" → **"slate + electric indigo"** — more editorial, higher contrast.

```css
/* Background layers */
--background:       224 25% 6%;    /* near-black with slate hue */
--surface:          224 22% 9%;    /* cards, panels */
--surface-raised:   224 20% 13%;  /* inputs, dropdowns, hover */

/* Accent — electric indigo, punchier than current */
--primary:          245 85% 62%;   /* #5b5df6 family */
--primary-foreground: 0 0% 100%;

/* Status colors */
--success:          152 69% 45%;   /* green */
--warning:          35 95% 55%;    /* amber */
--destructive:      0 80% 58%;     /* red */

/* Text */
--foreground:       220 20% 94%;
--muted-foreground: 220 10% 52%;
--border:           224 18% 16%;
```

### 4.2 Typography
Replace Syne with **Space Grotesk** (heading) — still geometric but friendlier and more legible at small sizes. Keep **DM Sans** for body.

```
font-heading: "Space Grotesk", sans-serif  (weights 500, 600, 700)
font-body:    "DM Sans", sans-serif        (weights 400, 500)
font-mono:    "JetBrains Mono", monospace  (for endpoints, keys)
```

### 4.3 Spacing & Radius
- Base radius: `6px` (slightly tighter than current `8px`)
- Content max-width: `1400px`
- Default page padding: `px-8 py-6`
- Card padding: `p-5`

### 4.4 New Animations
- Page enter: `fadeUp` (Y: 12px → 0, opacity 0→1, 250ms ease-out)
- Card hover: `translateY(-2px)` + shadow intensify (150ms)
- Modal: scale from 0.97 → 1 + fade (200ms)

### 4.5 Component Tokens to Add
```css
--card-hover-border: hsl(var(--primary) / 0.35);
--badge-planning:    hsl(245 85% 62% / 0.15);   /* indigo */
--badge-reporting:   hsl(152 69% 45% / 0.15);   /* green */
--gradient-hero:     linear-gradient(135deg, hsl(245 85% 62% / 0.08), transparent);
```

---

## 5. Page-by-Page Rebuild Checklist

### Phase 1 — Design System Foundation
- [ ] Update `index.css` with new CSS variables (palette, tokens)
- [ ] Update `tailwind.config.ts` with new font families + color extensions
- [ ] Add Google Fonts: Space Grotesk + JetBrains Mono
- [ ] Update `index.html` font preload links

### Phase 2 — Shell
- [ ] Rebuild `Sidebar.tsx` → new icon rail with hover-expand
- [ ] Rebuild `Topbar.tsx` → breadcrumb + search + user chip

### Phase 3 — Pages
- [ ] Rebuild `Login.tsx` — single column, API key primary, admin secondary
- [ ] Rebuild `Marketplace.tsx` — category chips + card grid
- [ ] Rebuild `AppDetail.tsx` — two-column meta/workspace layout
- [ ] Clean `Admin.tsx` — same table, better styling
- [ ] Clean `Settings.tsx` — same form, better layout

### Phase 4 — Workspace Cleanup (no logic changes)
- [ ] Clean `InitiativeManagerWorkspace.tsx` — visual polish only
- [ ] Clean `GoalManagerWorkspace.tsx` — visual polish only
- [ ] Review `AppRatingsComments.tsx` — consistent with new system

### Phase 5 — QA
- [ ] Verify all API calls still work (proxy, pagination, deploy flow)
- [ ] Verify admin login / Supabase auth still works
- [ ] Verify ratings + comments still work
- [ ] Responsive check at 1280px, 1440px, 1920px

---

## 6. What We Will NOT Do
- No changes to routing logic
- No changes to API helper files
- No changes to edge functions
- No changes to database schema
- No new pages or features during the visual rebuild
- No mobile/responsive overhaul (desktop-first tool, same as now)

---

## 7. Open Questions Before Starting
1. **Color direction**: Slate+indigo as above, or a different accent (e.g. teal, violet, warm amber)?
2. **Rail nav**: Icon-only with hover-expand, or always-expanded (current style but cleaned up)?
3. **App detail layout**: Two-column as proposed, or keep the current single-column scroll?
4. **Workspace panels**: Keep the current 40/60 split or change proportions?

---

*Created: 2026-03-19 | Status: Awaiting design direction confirmation before Phase 1.*
