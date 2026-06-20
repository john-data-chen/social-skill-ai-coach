# 社交技巧 AI 教練（Social Skills AI Coach）

[![codecov](https://codecov.io/gh/john-data-chen/social-skill-ai-coach/graph/badge.svg?token=Gj6H1mEAAz)](https://codecov.io/gh/john-data-chen/social-skill-ai-coach)
[![Quality gate](https://sonarcloud.io/api/project_badges/quality_gate?project=john-data-chen_social-skill-ai-coach)](https://sonarcloud.io/summary/new_code?id=john-data-chen_social-skill-ai-coach)
[![CI](https://github.com/john-data-chen/social-skill-ai-coach/actions/workflows/ci.yml/badge.svg)](https://github.com/john-data-chen/social-skill-ai-coach/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> For the English version, see [README.md](./README.md).

一個多代理（multi-agent）網頁應用，在安全的環境裡幫助你**練習並改善真實的社交互動**。你描述一個情境，得到以結構化社交課程為依據的具體建議，透過角色扮演實際演練，再收到結構化的回饋——一個隨時可用的完整教練循環。

> **線上 Demo：** 已部署於 Vercel —— [https://social-skill-ai-coach.vercel.app](https://social-skill-ai-coach.vercel.app)。

> ⚠️ **免責聲明：** 本專案（含 Demo、MCP、Skill）皆**不能取代受過訓練且具合法認證的心理師／治療師**。這是為 Kaggle《AI Agents: Intensive Vibe Coding Capstone Project》競賽製作的**概念性產品**，**請勿用於醫療用途**。

---

## 🧩 要解決的問題

社交技巧是可以學的，但很難「練習」：真實對話風險高、機會一次性，而且很少有人會給你誠實的回饋。最想進步的人，往往最缺乏低風險的練習機會。本專案把一套 8 堂課的社交技巧課程，變成一位隨時能反覆陪你演練的教練。

## 💡 為什麼做這個

對高功能自閉／亞斯伯格（Asperger）的人來說，社交技巧的學習必須透過**實際演練**——因為除了心理師以外，幾乎沒有人有耐心包容你的「與眾不同」。最理想的情況是：一旦發現孩子有社交技巧上的障礙，就立刻讓他去上社交技巧訓練課程（例如 [PEERS](https://www.semel.ucla.edu/peers/)），越早學會，受益一生。

但很殘酷的現實是：

- 亞洲大部分父母不知道、或很難承認孩子的社交有問題——因為那彷彿代表自己沒有能力、或在教育上失敗了。
- PEERS 最初階的課程是給國高中生的，一輪 8 堂、每堂約 **90 美金**。社交是隱晦而困難的，一旦缺了任何一堂都影響很大，所以每一堂都必須去上。要上完完整課程需要 16 堂，這對很多家庭來說無法負擔。
- 一旦社交的不良習慣固定下來，當事人往往只會發現自己不斷面對霸凌與排擠，直到成年。這時候才開始學雖然很難、但不是完全不可能——只是此時的他們很可能無法面對現實，絕大多數人不會再回去跟小孩子一起學社交。
- 如同你練習任何一種運動：你知道規則、知道怎麼做，跟你「做得很熟、很好」是完全不同等級的事。社交可能比運動還更難，因為它看似有規則，實則十分隱晦而複雜。如果你身在亞洲社會，你在社交上犯了錯是沒有人會告訴你的——每個人都預設你「應該知道」，然後你就慢慢地被疏遠、排擠，甚至被欺負。
- 最重要的是：就算你真的上完所有 PEERS 課程，實際出去練習時，心理師不可能站在你旁邊告訴你做對做錯；而且環境與其他人的反應全都不受你控制、也無法預測，光是巨大的聲響都可能讓你腦中一片空白。如果是我，我會希望口袋裡有一個能隨時諮詢的社交技巧教練。

基於以上原因，本專案選擇以類似 PEERS 的課程為藍圖，設計一套 AI 社交教練：任何人都可以連上網頁（或自帶 API key），隨時隨地用「分析 → 建議 → 角色扮演 → 回饋」的循環反覆練習，把開始練習的門檻降到最低。

## 🤖 為什麼用代理（agents）？

單一聊天機器人會把四件性質完全不同的工作混在一起。教練本質上是一條**專家流水線**，所以本應用每個工作各用一個代理：

| 階段 | 代理                     | 工作                                                                     |
| :--- | :----------------------- | :----------------------------------------------------------------------- |
| 1    | **Analyzer（分析）**     | 結構化整理情境（誰／什麼／何地、管道、情境類型、目標），此階段不給建議。 |
| 2    | **Coach（教練）**        | 給出具體、貼合情境的建議——只依據為此情境挑選出的課程片段。               |
| 3    | **Roleplay（角色扮演）** | 扮演對方讓你練習，並依你的社交表現給出真實反應。                         |
| 4    | **Reflection（反思）**   | 依評分準則檢視角色扮演逐字稿，回傳結構化、逐面向的評估。                 |

這些代理由一個 **orchestrator（協調器）** 串接，並執行檢索增強式的知識落地（retrieval-augmented grounding）：在 Coach 階段，先由 LLM 挑出與使用者情境最相關的課程主題，再只載入那些知識片段。

---

## 🏗️ 架構

![Architecture Diagram](./public/architecture.svg)

**核心概念：** 課程只撰寫一次、做成 **Agent Skill**，並以兩種方式被消費——對內由教練代理直接 in-process 使用（求速度），對外則透過 **Model Context Protocol（MCP）** 開放給任何 MCP client（求重用與互通）。

### 對應到課程概念

| 概念                  | 位置        | 如何呈現                                                                                            |
| :-------------------- | :---------- | :-------------------------------------------------------------------------------------------------- |
| **Agent／多代理系統** | Code        | 四個專職代理組成階段式流水線，由 orchestrator 以 LLM 驅動的知識路由協調。                           |
| **MCP Server**        | Code        | `/api/mcp` 以 MCP 形式對外開放 `list_social_topics` + `get_social_knowledge`。                      |
| **Agent Skills**      | Code        | `skills/social-skills-coach/` 把課程封裝成可載入的 Skill——所有知識的唯一來源。                      |
| **安全性**            | Code        | BYOK（你的 API key 留在瀏覽器 session、不在 server 端儲存）+ 於 API 信任邊界用 zod 驗證每一個請求。 |
| **可部署性**          | Docs／Video | 已部署於 Vercel；重現步驟見下文。                                                                   |
| **Antigravity**       | Video       | 於投稿影片中展示。                                                                                  |

---

## ✨ 功能

- **四階段教練循環**——Analyzer → Coach → Roleplay → Reflection。
- **Agent Skill 課程**——社交知識撰寫成可重用的 Skill。
- **MCP 伺服器（自帶你的模型）**——四個 agent 以 MCP prompts + 知識 tools 形式開放，任何 MCP client 都能用自己的模型跑整套教練。可發佈成 npm stdio 套件（`social-skills-coach-mcp`）。
- **檢索增強式教練**——Coach 只依據與你情境相關的片段落地建議。
- **BYOK（自帶金鑰）**——直接在瀏覽器 session 使用你自己的 API key。
- **多模型**——可在 Xiaomi MiMo 與 DeepSeek（OpenAI-compatible）間切換。
- **附件**——上傳圖片與文字檔（`.md`、`.txt`、`.csv`）供 AI 分析。
- **深色／淺色主題。**

---

## 🧰 當成 MCP 伺服器用（自帶你的模型）

整套教練能力**同時也是一個獨立 MCP 伺服器**，任何人都能用**自己的模型**跑它。四個
agent 以 MCP **prompts** 形式開放——它們在**連線方 client 的模型**上執行——所以伺服器
本身不需要任何 API key、也不跑任何推論。這就是別人能換上比 demo 更強（或不同）模型的方式。

- **Prompts**（在你的模型上跑）：`analyze_situation` · `coach` · `roleplay` · `reflect`
- **Tools**（知識 grounding）：`list_social_topics` · `get_social_knowledge({ topics })`

### 方式一 — npm 套件（stdio，本機 client 推薦）

發佈為 [`social-skills-coach-mcp`](./packages/social-skills-coach-mcp)。加進 Claude Desktop
的 `claude_desktop_config.json`：

```json
{
  "mcpServers": {
    "social-skills-coach": { "command": "npx", "args": ["-y", "social-skills-coach-mcp"] }
  }
}
```

或用 MCP Inspector 互動檢視：

```bash
npx @modelcontextprotocol/inspector npx -y social-skills-coach-mcp
```

### 方式二 — hosted HTTP（已部署的 app）

同一套能力也在 `POST <你的網址>/api/mcp`（Streamable HTTP）提供。快速煙霧測試：

```bash
curl -s -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_social_knowledge","arguments":{"topics":["opening"]}}}'
```

兩種形式共用同一個 core（`registerSocialSkillsMcp`）與同一份課程來源（Agent Skill），不會漂移。

---

## 📂 專案結構

```text
├── skills/social-skills-coach/  # Agent Skill：課程（產品環境運作的知識，唯一真實來源）
├── .agents/skills/              # Antigravity agent skills（開發期 AI 輔助技能，如 karpathy/vercel）
├── packages/
│   └── social-skills-coach-mcp/ # 可發佈的 npm stdio MCP 伺服器（prompts + tools）
├── .github/workflows/           # CI/CD（測試與 Vercel 部署）
├── __tests__/
│   ├── e2e/                      # Playwright 端對端測試
│   └── units/                    # Vitest 單元測試
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts         # 教練聊天：路由 + RAG 落地 + 串流
│   │   │   └── [transport]/route.ts  # MCP 伺服器（解析為 /api/mcp）
│   │   ├── layout.tsx
│   │   └── page.tsx                  # 主要 UI 與聊天介面
│   ├── components/                   # React 元件（ui/ 來自 Base UI / shadcn）
│   └── lib/
│       ├── agents/                   # 階段代理 + 知識 adapter
│       ├── knowledge/                # 讀取 Agent Skill 片段的 loader
│       ├── mcp/server-setup.ts       # 共用 MCP 註冊（tools + agent prompts）
│       ├── orchestrator.ts           # LLM 主題挑選 + 落地（server-only）
│       ├── router.ts                 # Deterministic 階段路由（client 安全）
│       ├── ai.ts                     # 供應商初始化（MiMo / DeepSeek）
│       └── store.ts                  # Zustand 狀態（歷史、設定）
├── public/
│   └── architecture.svg         # 系統架構圖
├── ai-docs/
│   └── task-template.md         # 用於氛圍編碼的 AI 代理任務模板
├── next.config.mjs              # outputFileTracingIncludes 把 skill md 打包進 Vercel
├── playwright.config.ts
├── vitest.config.ts
├── package.json
└── env.example                  # 環境變數範本
```

---

## 💻 本機開發與測試

### 1. 環境需求

- [Node.js](https://nodejs.org/)（v24 或最新 LTS）
- [pnpm](https://pnpm.io/installation)（最新版）

### 2. 安裝

```bash
pnpm install
```

### 3. 環境變數（可選——僅 Demo 模式需要）

本應用預設使用 **BYOK**：你可以在設定對話框貼上自己的 API key，無需任何 server 設定。若要改用內建的「Demo（Server Key）」模式：

```bash
cp env.example .env
# 接著填入 MIMO_API_KEY 與／或 DEEPSEEK_API_KEY
```

### 4. 執行

```bash
pnpm dev          # 啟動開發伺服器於 http://localhost:3000
pnpm test         # 單元測試（Vitest）
pnpm test:e2e     # 端對端測試（Playwright）
pnpm build        # 正式建置（typecheck + Next build）
```

---

## 🚀 部署（Vercel）

本應用已部署於 Vercel，且無需特別設定：

1. 把 GitHub repo 匯入 Vercel。
2. （可選）在專案的 Environment Variables 設定 `MIMO_API_KEY` / `DEEPSEEK_API_KEY` 以在正式環境啟用 Demo 模式。BYOK 不需任何 server 金鑰即可運作。
3. 部署。`next.config.mjs` 裡的 `outputFileTracingIncludes` 會把 Agent Skill 的 markdown 打包進 serverless functions，因此 `/api/chat` 與 `/api/mcp` 都能在 runtime 讀到課程。

> **切勿提交 API key 或密碼。** 請使用環境變數。

---

## 📄 授權

[MIT](https://opensource.org/licenses/MIT)
