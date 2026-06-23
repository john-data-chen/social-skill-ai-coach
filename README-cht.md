# 社交技巧 AI 教練（Social Skills AI Coach）

**用多代理（multi-agent）AI 教練練習真實社交情境 —— 分析、建議、角色扮演、復盤 —— 隨時可用，成本僅 2~6 美金 / 月。**

[![Live Demo](https://img.shields.io/badge/Live-Demo-000?logo=vercel)](https://social-skill-ai-coach.vercel.app)
[![NPM Version](https://img.shields.io/npm/v/social-skills-coach-mcp.svg?logo=npm)](https://www.npmjs.com/package/social-skills-coach-mcp)
[![CI](https://github.com/john-data-chen/social-skill-ai-coach/actions/workflows/ci.yml/badge.svg)](https://github.com/john-data-chen/social-skill-ai-coach/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/john-data-chen/social-skill-ai-coach/graph/badge.svg?token=Gj6H1mEAAz)](https://codecov.io/gh/john-data-chen/social-skill-ai-coach)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=john-data-chen_social-skill-ai-coach&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=john-data-chen_social-skill-ai-coach)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

🔗 **[線上 Demo](https://social-skill-ai-coach.vercel.app)** · 🎬 **[操作示範](#demo)** · 📦 **[npm: `social-skills-coach-mcp`](https://www.npmjs.com/package/social-skills-coach-mcp)** · 🇬🇧 **[English](./README.md)**

> ⚠️ 為 [Kaggle AI Agents Capstone](https://www.kaggle.com/competitions/vibecoding-agents-capstone-project)（組別 **Agents for Good**）開發的概念性 MVP，僅供評審與研究。**無法取代具執照的心理師或治療師。** 完整免責聲明見文末。

<p align="center">
  <a id="demo"></a>
  <img src="./public/images/demo.webp" alt="手機上的四階段循環 —— 分析、建議、角色扮演、復盤" width="270" />
  <br /><sub>手機實機操作的四階段循環 —— 分析 → 建議 → 角色扮演 → 復盤。</sub>
</p>

---

社交技巧是可以學的，但很難「練習」:真實對話風險高、機會一次性，而且幾乎沒有人會當場給你誠實回饋。**社交技巧 AI 教練**把 PEERS 風格的課程，變成一位你能隨時演練的教練，透過四階段循環:

**分析 → 建議 → 角色扮演 → 復盤** —— 每個階段一個專職 AI 代理，以真實課程為依據。

## 🧩 要解決的問題

對高功能自閉或亞斯伯格（Asperger）的人來說，社交技巧主要靠**實際演練**學會 —— 但有結構的練習既稀少又昂貴:

- **費用高昂。** 像 [PEERS](https://www.semel.ucla.edu/peers/) 完整 14–16 週課程要 **2，800–3，600 美元**，而且課程是累積式的——缺一堂，後面全受影響。很多家庭負擔不起，或因自尊而不願承認。
- **當下沒有回饋。** 即使上完課，真實對話裡也沒有教練站你旁邊。別人很少告訴你哪裡做錯，只會慢慢疏遠你。而一個突如其來的干擾（噪音、意外）就可能讓你腦中一片空白，任何技巧都想不起來。
- **太晚開始的代價。** 社交習慣一旦固定，排擠與霸凌往往延續到成年——而極少有成年人願意回去跟年紀小很多的學生一起上社交課。

本專案把開始練習的門檻降到最低:一個私密、不被評斷、隨時可用的練習空間。

## 🤖 為什麼用代理（agents）?

單一聊天機器人會把四件性質完全不同的工作混在一起。教練本質上是一條**專家流水線**，所以本應用每個工作各用一個代理，並由確定性（deterministic）階段路由器推進流水線，再由 LLM orchestrator 為 Coach 做課程落地（RAG）:

| 階段 | 代理                      | 工作                                                                    |
| :--- | :------------------------ | :---------------------------------------------------------------------- |
| 1    | **Analyzer（分析）**      | 結構化整理情境（誰／什麼／何地、管道、情境類型、目標），此階段不給建議。 |
| 2    | **Coach（教練）**         | 給出具體、貼合情境的建議——只依據為此情境挑選出的課程片段。              |
| 3    | **Role-Play（角色扮演）** | 扮演對方讓你練習，並依你的社交表現給出真實反應。                         |
| 4    | **Reflection（復盤）**    | 依評分準則檢視角色扮演逐字稿，回傳結構化、逐面向的評估。                 |

<p align="center">
  <img src="./public/images/analyzer.png" alt="Analyzer 把模糊情境整理成清楚結構" width="320" />
  <br />
  <em>第一階段 —— Analyzer 把模糊、焦慮的情境整理成清楚結構。</em>
</p>

**Orchestrator（協調器）** 執行檢索增強式的知識落地（RAG）:在 Coach 階段，先由 LLM 挑出與使用者情境最相關的課程主題，再只載入那些知識片段——讓建議嚴格綁定課程，而非幻覺。

**用 slash 指令操作。** 對話中隨時跳到任一階段 —— `/analyzer`、`/coach`、`/role-play`、`/reflection`:

<p align="center">
  <img src="./public/images/commands.png" alt="Quick Commands —— 用 slash 指令在各階段間切換" width="320" />
</p>

---

## 🎬 完整一次練習

沿用上面同一個例子——尊重地想認識班上同學——從 Analyzer 接著走 **Coach → Role-Play → Reflect**:

**Coach（建議）**——具體、以課程為依據的建議，還附上你可以照唸的開場白。

<p align="center">
  <img src="./public/images/coach.png" alt="Coach 階段 —— 以課程為依據的具體開場白" width="320" />
</p>

**Role-Play（角色扮演）**——AI 全程入戲扮演對方，讓你演練真實的一來一往。<sub>(點任一回合可放大)</sub>

<table>
  <tr>
    <td align="center"><a href="./public/images/role-play-1.png"><img src="./public/images/role-play-1.png" width="150" alt="角色扮演 1" /></a></td>
    <td align="center"><a href="./public/images/role-play-2.png"><img src="./public/images/role-play-2.png" width="150" alt="角色扮演 2" /></a></td>
    <td align="center"><a href="./public/images/role-play-3.png"><img src="./public/images/role-play-3.png" width="150" alt="角色扮演 3" /></a></td>
    <td align="center"><a href="./public/images/role-play-4.png"><img src="./public/images/role-play-4.png" width="150" alt="角色扮演 4" /></a></td>
    <td align="center"><a href="./public/images/role-play-5.png"><img src="./public/images/role-play-5.png" width="150" alt="角色扮演 5" /></a></td>
  </tr>
  <tr>
    <td align="center"><strong>設定場景</strong></td>
    <td align="center"><strong>你的開場白</strong></td>
    <td align="center"><strong>她的回應</strong></td>
    <td align="center"><strong>延續對話</strong></td>
    <td align="center"><strong>低壓力邀約</strong></td>
  </tr>
</table>

**Reflect（復盤）**——逐面向的結構化評分，告訴你表現如何。

<p align="center">
  <img src="./public/images/reflect.png" alt="Reflection 階段 —— 逐面向評分" width="320" />
</p>

---

## 🏗️ 架構

![Architecture Diagram](./public/images/architecture.png)

**核心概念:** 課程只撰寫一次、做成 **Agent Skill**，並以三種方式被消費——對內由教練代理直接 in-process 使用（求速度），對外透過 **Model Context Protocol（MCP）** 開放給任何 MCP client（求重用與互通），以及作為 drop-in skill 放進任何相容 `SKILL.md` 的 agent CLI（Antigravity CLI、Claude Code）。唯一真實來源，不會漂移。

### 對應到課程概念

| 概念                  | 位置        | 如何呈現                                                                                                     |
| :-------------------- | :---------- | :----------------------------------------------------------------------------------------------------------- |
| **Agent／多代理系統** | Code        | 四個專職代理組成階段式流水線，以確定性階段路由推進，另由 LLM orchestrator 做知識路由（RAG）為 Coach 落地。     |
| **MCP Server**        | Code        | `/api/mcp` 以 MCP 形式對外開放 `list_social_topics` + `get_social_knowledge`（tools）與四個代理（prompts）。 |
| **Agent Skills**      | Code        | `skills/social-skills-coach/` 把課程封裝成可載入的 Skill——所有知識的唯一來源;放進 skills 目錄即被 Antigravity CLI／Claude Code 原樣識別。                               |
| **安全性**            | Code        | BYOK（你的 API key 留在瀏覽器 session、不在 server 端儲存）+ 於 API 信任邊界用 zod 驗證每一個請求。          |
| **可部署性**          | Docs／Video | 已部署於 Vercel;重現步驟見下文。                                                                             |
| **Antigravity**       | Video       | 以 Antigravity IDE + CLI 開發，於投稿影片中展示。                                                             |

---

## ✨ 功能

- **四階段教練循環**——Analyzer → Coach → Role-Play → Reflection。
- **課程落地的建議**——Coach 只依據為**你的**情境檢索出的課程片段（RAG）回答，而非通用建議。
- **Agent Skill 課程**——社交知識撰寫成可重用的 Skill，唯一真實來源;丟進任何 agent CLI 的 skills 目錄（`.agents/skills`、`.claude/skills`）即被自動識別。
- **MCP 伺服器（自帶你的模型）**——四個 agent 以 MCP prompts + 知識 tools 形式開放，任何 MCP client 都能用自己的模型跑整套教練。發佈為 npm stdio 套件 [`social-skills-coach-mcp`](https://www.npmjs.com/package/social-skills-coach-mcp)。
- **多模型**——可在 Xiaomi MiMo 與 DeepSeek 間切換;demo key 失效時自動切換備援。
- **附件**——上傳圖片與文字檔（`.md`、`.txt`、`.csv`）供 AI 分析。
- **針對手機操作優化**——讓你在當下就能掏出來用:只要能聯網打開 Demo 網頁，教練隨時隨地在你口袋裡。已在 Pixel + Chrome / iPhone + Safari (市占率 90+%) 上實機測試，即便是四年前的舊手機仍運作順暢。
- **深色／淺色主題**——減少眼睛疲勞，對光敏感的人尤其重要。

---

## 🔒 安全性

安全性在每一個信任邊界都有落實——瀏覽器、API、以及 MCP 伺服器:

<p align="center">
  <img src="./public/images/settings-byok.png" alt="BYOK 設定 —— API key 只存在這個分頁的 session 記憶體" width="320" />
</p>

- **BYOK，永不留存。** API key 以每次請求的 `Authorization: Bearer` header 傳送，僅在記憶體中使用;不寫入 log、也不寫入資料庫。
- **僅限 session 的儲存。** 瀏覽器把 key 與聊天紀錄存在 `sessionStorage`（而非 `localStorage`），關閉分頁即自動清除。
- **信任邊界以 zod 驗證。** 每個 `/api/chat` 與 MCP 請求都用 zod 解析;格式錯誤的 JSON 或結構在進入任何模型前就被擋下（`400`），缺少金鑰則直接 gating（`401`）。
- **不洩漏內部資訊。** 錯誤只在 server 端記錄;client 只拿到通用訊息（`Internal Server Error`），絕不回傳 stack trace 或機密。
- **無狀態設計。** 沒有資料庫、沒有 server 端使用者資料。
- **SonarQube 程式碼品質已驗證。** 所有評級：A（安全性、可靠性、可維護性）。

---

## 🧩 當成可攜 Agent Skill 用（drop-in，零程式碼）

這份課程就是一個標準 **`SKILL.md` Agent Skill**，並不綁死在本 app。把 `social-skills-coach` 資料夾丟進任何相容 SKILL.md 的 agent runtime，就會被自動識別——同一個資料夾、不必改、不必寫程式碼串接。

```bash
cp -r skills/social-skills-coach .agents/skills/    # Antigravity CLI（workspace）
cp -r skills/social-skills-coach ~/.claude/skills/  # 與 Claude 共用
```

| Runtime                     | 從這裡被識別                                                    |
| :-------------------------- | :------------------------------------------------------------ |
| Antigravity CLI — workspace | `.agents/skills/social-skills-coach/SKILL.md`                  |
| Antigravity CLI — global    | `~/.gemini/antigravity-cli/skills/social-skills-coach/SKILL.md` |
| Claude Code／shared         | `~/.claude/skills/social-skills-coach/SKILL.md`                |

<table>
  <tr>
    <td align="center" width="50%"><a href="./public/images/skills-in-agy-cli.png"><img src="./public/images/skills-in-agy-cli.png" alt="Antigravity CLI 把 social-skills-coach 列在已識別的 workspace skills 中" /></a></td>
    <td align="center" width="50%"><a href="./public/images/skills-in-claude-app.png"><img src="./public/images/skills-in-claude-app.png" alt="Claude app 在 Personal skills 下顯示已匯入的 social-skills-coach，可見 SKILL.md 與 references" /></a></td>
  </tr>
  <tr>
    <td align="center"><strong>Antigravity CLI</strong> —— 丟進 workspace skills 目錄</td>
    <td align="center"><strong>Claude app</strong> —— 從 Personal skills 匯入</td>
  </tr>
</table>

<p align="center"><em>同一份 SKILL.md，跨 runtime 被識別——零接線、不必改。</em></p>

這是同一份課程被消費的第二種方式（與 in-process、MCP 並列）:撰寫一次，到處重用。

---

## 🧰 當成 MCP 伺服器用（自帶你的模型）

整套教練能力**同時也是一個獨立 MCP 伺服器**——可在**任何** MCP client、用**你選的任何模型**跑。四個 sub-agent 以 MCP **prompts** 形式開放:它們在**連線客戶端的模型**上執行，所以伺服器本身不持有任何 API key、也不跑任何推論。可換上比 Demo 用的 MiMo/DeepSeek 更強的模型，或你本地已經在跑的模型。

**一個 server，多個 client，多種模型。** 以下是它在兩個獨立 MCP client 中實際運作——同一個套件、不必改:

<table>
  <tr>
    <td align="center" width="50%"><a href="./public/images/mcp-in-agy-cli.png"><img src="./public/images/mcp-in-agy-cli.png" alt="Antigravity CLI 把 social-skills-coach 列在 MCP servers 中，開放 list_social_topics 與 get_social_knowledge tools" /></a></td>
    <td align="center" width="50%"><a href="./public/images/mcp-in-hermes-agent.png"><img src="./public/images/mcp-in-hermes-agent.png" alt="Nous Research 的 Hermes Agent 呼叫 social-skills-coach MCP 伺服器——列出它的 agent prompts 與課程主題" /></a></td>
  </tr>
  <tr>
    <td align="center"><strong>Antigravity CLI</strong> —— 註冊為 MCP server（跑在 Gemini）</td>
    <td align="center"><strong><a href="https://github.com/NousResearch/hermes-agent">Hermes Agent</a></strong>（Nous Research）—— 同一個 server，200+ 模型任選</td>
  </tr>
</table>

<p align="center"><em>一個 MCP 伺服器，任何 client、任何模型——不必改、不用為各客戶端寫程式碼串接。</em></p>

**它開放了什麼:**

- **Prompts**（在**你的**模型上跑）:`analyze_situation` · `coach` · `roleplay` · `reflect`
- **Tools**（知識 grounding）:`list_social_topics` · `get_social_knowledge({ topics })`

### 方式一 — npm 套件（stdio，本機 client 推薦）

發佈為 [`social-skills-coach-mcp`](https://www.npmjs.com/package/social-skills-coach-mcp)。加進你的 client `mcp.json`（Claude Desktop、Cursor、Antigravity……）:

```json
{
  "mcpServers": {
    "social-skills-coach": { "command": "npx"， "args": ["-y"， "social-skills-coach-mcp"] }
  }
}
```

或用 MCP Inspector 互動檢視:

```bash
npx @modelcontextprotocol/inspector npx -y social-skills-coach-mcp
```

### 方式二 — hosted HTTP（已部署的 app）

同一套能力也在 `POST <你的網址>/api/mcp`（Streamable HTTP）提供。快速煙霧測試:

```bash
curl -s -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json， text/event-stream" \
  -d '{"jsonrpc":"2.0"，"id":1，"method":"tools/call"，"params":{"name":"get_social_knowledge"，"arguments":{"topics":["opening"]}}}'
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
│   └── images/                  # 架構 PNG、封面、截圖（README／媒體素材）
├── next.config.mjs              # outputFileTracingIncludes 把 skill md 打包進 Vercel
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

本應用預設使用 **BYOK**:你可以在設定對話框貼上自己的 API key，無需任何 server 設定。若要改用內建的「Demo（Server Key）」模式:

```bash
cp env.example .env
# 接著填入 MIMO_API_KEY + MIMO_API_BASE_URL ／ DEEPSEEK_API_KEY
```

### 4. 執行

```bash
pnpm dev          # 啟動開發伺服器於 http://localhost:3000
pnpm test         # 單元測試（Vitest）
pnpm test:e2e     # 端對端測試（Playwright）
pnpm build        # 正式建置（typecheck + Next build）
```

---

<a id="byok"></a>

## 🔑 取得 API 金鑰（BYOK）

本應用採 **BYOK**（自帶金鑰）：你提供一把 API key，只在瀏覽器 session 中使用，永不存到 server 端。下列**擇一**:

| 供應商          | 取得金鑰                                                          | 費用              | 環境變數                                                                                              |
| :-------------- | :--------------------------------------------------------------- | :---------------- | :--------------------------------------------------------------------------------------------------- |
| **Xiaomi MiMo** | 訂閱 [MiMo token plan](https://platform.xiaomimimo.com/token-plan) | 最低 **6 美金/月** | `MIMO_API_KEY` + `MIMO_API_BASE_URL`（依你的方案調整，例如 `https://token-plan-cn.xiaomimimo.com/v1`） |
| **DeepSeek**    | 到 [DeepSeek](https://platform.deepseek.com/) 充值               | 最低 **2 美金**   | `DEEPSEEK_API_KEY`                                                                                   |

兩種用法擇一:

- **在 app 內（BYOK）：** 打開 **設定** 貼上金鑰——只存在這個分頁的 session，無需任何 server 設定。
- **Server / Demo 模式：** 把金鑰放進環境變數（`env.example`）；見下方 **部署（Vercel）**。

---

## 🚀 部署（Vercel）

本 repo 是 public template —— 一鍵部署你自己的實例，立刻以 **BYOK** 模式使用（打開 **設定**，貼上你自己的 MiMo 或 DeepSeek key——見 [取得 API 金鑰（BYOK）](#byok)）；免登入、免付費。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/john-data-chen/social-skill-ai-coach)

### 1. 部署

點 **Deploy with Vercel**（需要一個免費 Vercel 帳號，可用 GitHub 一鍵登入）。Vercel 會把 repo 複製到你的帳號，接著請你建立 Git repository——保持預設、按 **Create** 即可。

<p align="center">
  <img src="./public/images/deploy-1.png" alt="Vercel New Project —— 從 GitHub clone Social Skills AI Coach repo" width="520" />
</p>

建置完成後打開部署網址，即可直接以 BYOK 模式使用：打開 **設定** 貼上你的 key 即可開始。

### 2. 選用 —— 啟用 Demo（Server Key）模式

想讓部署後的網站免去每位訪客自行貼 key？加上 server 金鑰即可。在你的專案打開 **Environment Variables**:

<p align="center">
  <img src="./public/images/deploy-2.png" alt="Vercel 專案側欄 —— Environment Variables" width="520" />
</p>

點 **Add Environment Variable**:

<p align="center">
  <img src="./public/images/deploy-3.png" alt="Environment Variables 頁 —— Add Environment Variable 按鈕" width="520" />
</p>

加入 [BYOK 表格](#byok) 中的金鑰（MiMo / DeepSeek 擇一），打開 **Sensitive**，按 **Save**——再重新部署。

<p align="center">
  <img src="./public/images/deploy-4.png" alt="Add Environment Variable —— 填入 MIMO_API_KEY 與 MIMO_API_BASE_URL 並開啟 Sensitive" width="520" />
</p>

> **切勿提交 API key 或密碼。** 請使用環境變數。

---

## 🛠️ 技術棧

Next.js（App Router）· React · TypeScript（strict）· TailwindCSS · Vercel AI SDK · Zustand · Vitest + Playwright · pnpm · 部署於 Vercel。

---

## 📋 未來發展

- 支持更多 AI 模型或供應商如: Anthropic、OpenAI、Google Gemini...等等

---

## ⚠️ 免責聲明

此專案是為了 [Kaggle AI Agents: Intensive Vibe Coding Capstone Project](https://www.kaggle.com/competitions/vibecoding-agents-capstone-project) 所開發的概念性產品（最小可行性產品），參加 **Agents for Good**，僅供評審與有興趣者研究。專案所有功能（包含但不限於 Demo、AI agent、Skill、MCP）**皆無法取代受過專業訓練且擁有合格證照的心理師或諮商師， 且無法提供任何醫療與諮商行為**。

示範網站使用 [Xiaomi MiMo token plan](https://platform.xiaomimimo.com/token-plan) 以最低月訂閱計畫運作，可以直接使用，**在 Kaggle 審核過後訂閱計畫就會失效，也沒有準備 DeepSeek 的金鑰**。若要繼續使用請自備金鑰——見 [取得 API 金鑰（BYOK）](#byok)。

請始終記住:**您是在跟 AI 對話。** 應避免在對話中提及真實姓名、電話、地址等個人資訊，必要時用化名。AI 可能會出錯與幻覺——所有建議僅供參考。

---

## 📄 授權

[MIT](https://opensource.org/licenses/MIT)
