# ScalePad LM Copilot

A keyboard-friendly copilot for ScalePad Lifecycle Manager — deploy initiatives and goals across your entire client base in seconds.

## What it does

| Tool | Description |
|---|---|
| **Initiatives Manager** | Build an initiative template (name, status, priority, schedule, budget) and deploy it to multiple clients in one click. Tracks each deployment step live. |
| **Goals Manager** | Build a goal template (title, description, status, period) and deploy it across clients. Supports year / half-year / quarter periods. |
| **Opportunities** | Pull live sales opportunities from the ScalePad API and filter by client, stage, or name. |

## Getting started

1. Clone the repo and install dependencies:
   ```sh
   npm install
   npm run dev
   ```

2. Open the app and enter your ScalePad API key when prompted.  
   Your key is stored in `sessionStorage` only — it is never persisted to any database.

3. Start deploying.

## Architecture

```
Browser
  └── src/lib/api-client.ts        # proxyCall() + fetchAllPages() — all API calls go here
        └── supabase edge function  # scalepad-proxy — forwards requests to api.scalepad.com
              └── api.scalepad.com  # ScalePad REST API
```

### Key files

| File | Purpose |
|---|---|
| `src/lib/api-client.ts` | Core `proxyCall` + cursor-based `fetchAllPages` helper |
| `src/lib/initiative-api.ts` | Initiatives types, CRUD helpers, deploy sequencer |
| `src/lib/goal-api.ts` | Goals types, CRUD helpers, period utilities, deploy sequencer |
| `src/lib/scalepad-api.ts` | `maskApiKey` display utility |
| `src/context/AuthContext.tsx` | API key session + SHA-256 `user_hash` for anonymous DB ops |
| `supabase/functions/scalepad-proxy/` | Reverse proxy edge function (handles CORS + key forwarding) |
| `src/components/workspace/Shared.tsx` | Shared `Panel`, `PanelHeader`, `PanelSearch` etc. used by all three tools |

### Why the proxy?

The ScalePad API does not allow direct browser requests (CORS). The `scalepad-proxy` edge function sits in between: the browser sends the user's API key in a custom header (`x-scalepad-api-key`), the function forwards it to `api.scalepad.com` as `x-api-key`, and returns the response. The function always replies with HTTP 200 — callers inspect `upstream_status` in the body to handle errors.

## Stack

- **React + Vite + TypeScript**
- **Tailwind CSS** with a Material Design 3–inspired dark palette
- **shadcn/ui** component primitives
- **Lovable Cloud** (Supabase) for the proxy edge function and optional ratings/comments storage

## Remixing

Fork this project on [Lovable](https://lovable.dev) and swap in your own ScalePad API key to get started immediately — no backend setup required.
