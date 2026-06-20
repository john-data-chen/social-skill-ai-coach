# Social Skills AI Coach

[![codecov](https://codecov.io/gh/john-data-chen/social-skill-ai-coach/graph/badge.svg?token=Gj6H1mEAAz)](https://codecov.io/gh/john-data-chen/social-skill-ai-coach)
[![Quality gate](https://sonarcloud.io/api/project_badges/quality_gate?project=john-data-chen_social-skill-ai-coach)](https://sonarcloud.io/summary/new_code?id=john-data-chen_social-skill-ai-coach)
[![CI](https://github.com/john-data-chen/social-skill-ai-coach/actions/workflows/ci.yml/badge.svg)](https://github.com/john-data-chen/social-skill-ai-coach/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> 繁體中文版說明請見 [README-cht.md](./README-cht.md)。

A multi-agent web app that helps people **practice and improve real social interactions** in a safe space. You describe a situation, get concrete advice grounded in a structured social-skills curriculum, rehearse it in a roleplay, and receive a structured reflection — a full coaching loop, on demand.

> **Live demo:** deployed on Vercel — _add your deployment URL here_.

---

## 🧩 The problem

Social skills are learnable, but they are hard to *practice*: real conversations are high-stakes, one-shot, and rarely come with honest feedback. People who most want to improve have the fewest low-risk reps. This project turns an 8-lesson social-skills curriculum into an on-demand coach you can rehearse with as many times as you like.

## 🤖 Why agents?

A single chatbot would blur four very different jobs. Coaching is naturally a **pipeline of specialists**, so the app uses one agent per job:

| Stage | Agent | Job |
| :--- | :--- | :--- |
| 1 | **Analyzer** | Structures the situation (who/what/where, channel, scenario type, goal) without giving advice yet. |
| 2 | **Coach** | Gives concrete, situation-specific advice — grounded only in the curriculum slices selected for this case. |
| 3 | **Roleplay** | Plays the other person so you can practice, reacting realistically to your social-skill level. |
| 4 | **Reflection** | Reviews the roleplay transcript against the rubric and returns a structured, per-dimension evaluation. |

The agents are coordinated by an **orchestrator** that performs retrieval-augmented grounding: for the Coach stage it LLM-selects the curriculum topics most relevant to the user's situation, then loads just those knowledge slices.

---

## 🏗️ Architecture

```text
skills/social-skills-coach/        Agent Skill = the curriculum, single source of truth
  SKILL.md + references/*.md        (12 topic slices distilled from the 8-lesson course)
        │
        │  src/lib/knowledge  — server-side loader (reads a slice, caches it)
        ├───────────────────────────────┐
        ▼                               ▼
  MCP Server  /api/mcp            Orchestrator + 4 stage agents
  (mcp-handler + MCP SDK)         - router.ts: deterministic stage routing (client-safe)
  exposes the curriculum as       - orchestrator.ts: LLM picks relevant topics →
  tools to ANY MCP client           reads slices in-process → grounds the Coach
  (MCP Inspector, Claude Desktop) - /api/chat: streams the active agent's reply
        │
        ▼
  External agents / tools can reuse the same knowledge over the protocol
```

**Key idea:** the curriculum is authored once as an **Agent Skill** and consumed two ways — internally by the coaching agents (in-process, for speed) and externally by any MCP client over the **Model Context Protocol** (for reuse and interoperability).

### Course concepts demonstrated

| Concept | Where | How it is demonstrated |
| :--- | :--- | :--- |
| **Agent / Multi-agent system** | Code | Four specialized agents in a staged pipeline, coordinated by an orchestrator with LLM-driven knowledge routing. |
| **MCP Server** | Code | `/api/mcp` exposes `list_social_topics` + `get_social_knowledge` over MCP for any external client. |
| **Agent Skills** | Code | `skills/social-skills-coach/` packages the curriculum as a loadable Skill — the single source of truth for all knowledge. |
| **Security features** | Code | BYOK (your API key stays in the browser session, never stored server-side) + zod validation of every request at the API trust boundary. |
| **Deployability** | Docs / Video | Deployed on Vercel; reproduce steps below. |
| **Antigravity** | Video | Shown in the submission video. |

---

## ✨ Features

- **4-stage coaching loop** — Analyzer → Coach → Roleplay → Reflection.
- **Agent Skill curriculum** — social-skills knowledge authored as a reusable Skill.
- **MCP server (bring your own model)** — the four agents are exposed as MCP prompts + knowledge tools, so any MCP client can run the whole coach with its own model. Distributable as an npm stdio package (`social-skills-coach-mcp`).
- **Retrieval-augmented coaching** — the Coach is grounded only in the slices relevant to your situation.
- **BYOK (Bring Your Own Key)** — use your own API key directly from the browser session.
- **Multi-model** — switch between Xiaomi MiMo and DeepSeek (OpenAI-compatible).
- **Attachments** — upload images and text files (`.md`, `.txt`, `.csv`) for the AI to analyze.
- **Dark / Light theme.**

---

## 🧰 Use it as an MCP server (bring your own model)

The whole coaching capability is **also a standalone MCP server**, so anyone can run
it with their OWN model. The four agents are exposed as MCP **prompts** — they execute
on the _connecting client's_ model — so the server needs no API key and runs no
inference itself. That is how others can plug in a more capable model than the demo's
(cheap) MiMo/DeepSeek.

- **Prompts** (run on your model): `analyze_situation` · `coach` · `roleplay` · `reflect`
- **Tools** (knowledge grounding): `list_social_topics` · `get_social_knowledge({ topics })`

### Option 1 — npm package over stdio (recommended for local clients)

Published as [`social-skills-coach-mcp`](./packages/social-skills-coach-mcp). Add it to
Claude Desktop's `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "social-skills-coach": { "command": "npx", "args": ["-y", "social-skills-coach-mcp"] }
  }
}
```

Or inspect it interactively:

```bash
npx @modelcontextprotocol/inspector npx -y social-skills-coach-mcp
```

### Option 2 — hosted HTTP (the deployed app)

The same capability is served at `POST <your-host>/api/mcp` (Streamable HTTP transport).
Quick smoke test against a running server:

```bash
curl -s -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_social_knowledge","arguments":{"topics":["opening"]}}}'
```

Both forms share one core (`registerSocialSkillsMcp`) and one curriculum source (the
Agent Skill), so they never drift.

---

## 📂 Repository structure

```text
├── skills/social-skills-coach/  # Agent Skill: the curriculum (SKILL.md + references/*.md) — single source
├── packages/
│   └── social-skills-coach-mcp/ # Publishable npm stdio MCP server (prompts + tools)
├── .github/workflows/           # CI/CD (testing & Vercel deployment)
├── __tests__/
│   ├── e2e/                      # Playwright end-to-end tests
│   └── units/                    # Vitest unit tests
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts         # Coaching chat: routing + RAG grounding + streaming
│   │   │   └── [transport]/route.ts  # MCP server (resolves to /api/mcp)
│   │   ├── layout.tsx
│   │   └── page.tsx                  # Main UI and chat interface
│   ├── components/                   # React components (ui/ from Base UI / shadcn)
│   └── lib/
│       ├── agents/                   # Stage agents + knowledge adapter
│       ├── knowledge/                # Loader that reads the Agent Skill slices
│       ├── mcp/server-setup.ts       # Shared MCP registration (tools + agent prompts)
│       ├── orchestrator.ts           # LLM topic selection + grounding (server-only)
│       ├── router.ts                 # Deterministic stage routing (client-safe)
│       ├── ai.ts                     # Provider init (MiMo / DeepSeek)
│       └── store.ts                  # Zustand state (history, config)
├── next.config.mjs              # outputFileTracingIncludes ships the skill md to Vercel
├── playwright.config.ts
├── vitest.config.ts
├── package.json
└── env.example                  # Template for environment variables
```

---

## 💻 Local development & testing

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v24 or latest LTS)
- [pnpm](https://pnpm.io/installation) (latest)

### 2. Install

```bash
pnpm install
```

### 3. Environment variables (optional — only for "Demo" mode)

The app defaults to **BYOK**: you can paste your own API key in the Settings dialog, no server config needed. To use the built-in "Demo (Server Key)" mode instead:

```bash
cp env.example .env
# then fill in MIMO_API_KEY and/or DEEPSEEK_API_KEY
```

### 4. Run

```bash
pnpm dev          # start the dev server at http://localhost:3000
pnpm test         # unit tests (Vitest)
pnpm test:e2e     # end-to-end tests (Playwright)
pnpm build        # production build (typecheck + Next build)
```

---

## 🚀 Deployment (Vercel)

The app is deployed on Vercel and needs no special configuration:

1. Import the GitHub repo into Vercel.
2. (Optional) set `MIMO_API_KEY` / `DEEPSEEK_API_KEY` in the project's Environment Variables to enable Demo mode in production. BYOK works without any server keys.
3. Deploy. The `outputFileTracingIncludes` setting in `next.config.mjs` ensures the Agent Skill markdown is bundled into the serverless functions, so both `/api/chat` and `/api/mcp` can read the curriculum at runtime.

> **Never commit API keys or passwords.** Use environment variables.

---

## 📄 License

[MIT](https://opensource.org/licenses/MIT)
