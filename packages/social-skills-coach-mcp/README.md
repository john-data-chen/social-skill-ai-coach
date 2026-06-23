# social-skills-coach-mcp

[![npm version](https://img.shields.io/npm/v/social-skills-coach-mcp.svg?logo=npm)](https://www.npmjs.com/package/social-skills-coach-mcp)
[![Node](https://img.shields.io/node/v/social-skills-coach-mcp.svg)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> 繁體中文版說明請見 [README-cht.md](https://github.com/john-data-chen/social-skill-ai-coach/blob/main/packages/social-skills-coach-mcp/README-cht.md)。

An [MCP](https://modelcontextprotocol.io) server that turns a PEERS-style social-skills
curriculum into a full coaching loop — **Analyze → Coach → Role-Play → Reflect** — that
**any MCP client can run with its own model**.

It is the standalone, distributable form of the
[Social Skills AI Coach](https://github.com/john-data-chen/social-skill-ai-coach) project
(try the **[live demo](https://social-skill-ai-coach.vercel.app)** or **[video](https://youtu.be/sTXtDH4aJDM)**): describe a situation,
get concrete curriculum-grounded advice, rehearse it in a role-play, and receive a
structured reflection.

## Why bring your own model

The four agents are exposed as MCP **prompts** — they execute on the _connecting client's_
model. The server only serves prompts + curriculum knowledge and runs **no inference itself**,
so:

- **No API key needed** by this server.
- **Works with any model** your client supports (Anthropic, OpenAI, Google Gemini, local
  models, etc.) — plug in a more capable model than Demo Web App.
- **No data stored.** The server reads curriculum markdown and returns text; it persists
  nothing.

## What it exposes

- **Prompts** (run on _your_ model):
  - `analyze_situation(situation)` — structure a social situation (who/what/where, channel,
    scenario type, goal) without giving advice yet
  - `coach(situation)` — concrete, curriculum-grounded advice and exact phrases you can say
  - `roleplay(scenario)` — plays the other person so you can practice; reacts to your skill level
  - `reflect(transcript)` — rubric-based, per-dimension evaluation of a role-play
- **Tools** (curriculum knowledge for grounding):
  - `list_social_topics()` — list the 12 curriculum topics (call this first)
  - `get_social_knowledge({ topics })` — fetch the verbatim curriculum slice(s)

The agents reply in the **same language the user writes in**.

## Use with Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "social-skills-coach": {
      "command": "npx",
      "args": ["-y", "social-skills-coach-mcp"]
    }
  }
}
```

Other MCP clients (Cursor, Antigravity, …) use the same `command` + `args`.

## Run directly

```bash
npx -y social-skills-coach-mcp        # speaks MCP over stdio
```

Or inspect it with the MCP Inspector:

```bash
npx @modelcontextprotocol/inspector npx -y social-skills-coach-mcp
```

## Install globally (optional)

```bash
npm install -g social-skills-coach-mcp
# or: pnpm add -g social-skills-coach-mcp
social-skills-coach-mcp               # runs the stdio server
```

## 🔒 Security

- **No secrets to leak.** The server holds no API key and runs no inference — all reasoning happens on the connecting client's model. There is nothing here to exfiltrate.
- **zod validation at the trust boundary.** Every tool/prompt argument is validated with zod (topic keys are a fixed enum, `min 1`); malformed or out-of-range input is rejected before use.
- **Stateless by design.** It reads the bundled curriculum markdown and returns text — no database, no persistence, no telemetry.

## ⚠️ Disclaimer

This is a conceptual minimum viable product built for the
[Kaggle AI Agents Capstone](https://www.kaggle.com/competitions/vibecoding-agents-capstone-project)
(team **Agents for Good**), for review and research only. It **cannot replace a trained,
licensed psychologist or helping professional** and provides no medical treatment or
consultation.

You are talking to an AI: avoid sharing personal information (real name, phone, address).
AI can make mistakes and hallucinate — all suggestions are for reference only.

## License

[MIT](https://opensource.org/licenses/MIT)
