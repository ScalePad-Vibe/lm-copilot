# ScalePad Recipe — LM Copilot

> **A ScalePad Recipe** is a working, remixable example that shows what's possible when you build on top of the ScalePad API. Fork it, reshape it, ship it.

---

## What this recipe builds

A keyboard-friendly copilot for ScalePad Lifecycle Manager. Enter your API key once and you can deploy initiatives and goals across your entire client base in seconds — and pull live sales opportunities into a filterable table.

| Tool | What it demonstrates |
|---|---|
| **Initiatives Manager** | Bulk-create an initiative across N clients. Tracks each deployment step live with a real-time progress UI. |
| **Goals Manager** | Bulk-create a goal (year / half / quarter periods) across N clients. Shows inline edit + update flow. |
| **Opportunities** | Read-only view of live sales pipeline data, filterable by client, stage, or name. |

---

## Why this recipe exists

ScalePad's Lifecycle Manager API lets you create, update, and deploy structured work (initiatives, goals) programmatically — meaning you can go from *"I have a template"* to *"every client has this initiative"* in one action instead of clicking through each client manually.

This recipe shows the full pattern: authenticate → fetch clients → iterate → deploy → surface results.

---

## Getting started

**1. Clone & install**
```sh
npm install
npm run dev
```

**2. Enter your ScalePad API key**  
The app will prompt you on first load. Your key is stored in `sessionStorage` only — never written to any database or sent anywhere except the proxy function.

**3. Start deploying.**

---

## Architecture

```
Browser
  └── src/lib/api-client.ts          # proxyCall() + fetchAllPages()
        └── scalepad-proxy (edge fn) # Reverse proxy — handles CORS + key forwarding
              └── api.scalepad.com   # ScalePad REST API
```

### Why the proxy?

The ScalePad API doesn't allow direct browser requests (no CORS headers). The `scalepad-proxy` edge function bridges the gap: your API key travels in a custom header (`x-scalepad-api-key`), the function forwards it as `x-api-key`, and returns the response. It always replies HTTP 200 — callers inspect `upstream_status` in the body to handle errors gracefully.

### Key files

| File | Purpose |
|---|---|
| `src/lib/api-client.ts` | `proxyCall()` — single entry point for all API calls. `fetchAllPages()` — generic cursor paginator. |
| `src/lib/initiative-api.ts` | Initiative types, CRUD helpers, step-by-step deploy sequencer |
| `src/lib/goal-api.ts` | Goal types, CRUD helpers, period utilities, deploy sequencer |
| `src/context/AuthContext.tsx` | API key session management (sessionStorage, no backend) |
| `supabase/functions/scalepad-proxy/` | Edge function — reverse proxy with CORS |
| `src/components/tools/Shared.tsx` | Shared `Panel`, `PanelSearch`, `StepIcon`, `Pagination` primitives |

---

## Remixing ideas

This recipe is intentionally minimal. Here are directions you could take it:

- **Slack notifications** — Post a message to a channel when a bulk deploy completes
- **CSV import** — Let users paste or upload a list of initiative names to batch-create
- **Scheduling** — Queue deployments to run at a specific time using a cron edge function  
- **Client filtering** — Pre-filter the client list by tag, tier, or account manager before deploying
- **Approval workflow** — Add a review step before initiatives go live across clients
- **Custom dashboards** — Combine Opportunities + Goals data into an executive summary view

---

## Stack

- **React + Vite + TypeScript**
- **Tailwind CSS** — Material Design 3–inspired dark palette
- **shadcn/ui** — component primitives
- **Lovable Cloud** — single edge function for the API proxy (no database, no auth)

---

## Remix this on Lovable

Open this project on [Lovable](https://lovable.dev), hit **Remix**, and you're running in under a minute — no backend setup required. Swap in your ScalePad API key and start building.
