# social-skills-coach-mcp

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> For English, see [README.md](./README.md).

一個 [MCP](https://modelcontextprotocol.io) 伺服器,將 PEERS 式的社交技巧課程轉成完整的
教練循環 —— **分析 → 教練 → 角色扮演 → 反思** —— 讓**任何 MCP client 都能用自己的模型執行**。

它是 [Social Skills AI Coach](https://github.com/john-data-chen/social-skill-ai-coach)
專案的獨立、可發布形式:描述一個情境,獲得以課程為依據的具體建議,透過角色扮演演練,
再得到結構化的反思回饋。

## 為何「自帶模型」(BYO model)

四個 agent 以 MCP **prompts** 形式提供 —— 它們執行在**連線的 client 的模型**上。本伺服器
只提供 prompts 與課程知識,**自己不跑任何推論(inference)**,所以:

- 本伺服器**不需要 API key**。
- **相容任何模型**(Anthropic、OpenAI、Google Gemini、本地模型等)—— 你可以接上比任何單一
  代管 demo 更強的模型。
- **不儲存資料。** 伺服器讀取課程 markdown 並回傳文字,不保存任何東西。

## 提供的功能

- **Prompts**(執行在**你的**模型上):
  - `analyze_situation(situation)` —— 拆解社交情境(誰/什麼/何地、管道、情境類型、目標),
    此階段先不給建議
  - `coach(situation)` —— 以課程為依據的具體建議與可直接照說的句子
  - `roleplay(scenario)` —— 扮演對方讓你演練,並依你的技巧程度做出真實反應
  - `reflect(transcript)` —— 依評量表逐面向評估一段角色扮演
- **Tools**(作為依據的課程知識):
  - `list_social_topics()` —— 列出 12 個課程主題(請先呼叫這個)
  - `get_social_knowledge({ topics })` —— 取得逐字的課程片段

所有 agent 會以**使用者輸入時所用的相同語言**回覆。

## 搭配 Claude Desktop 使用

加入你的 `claude_desktop_config.json`:

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

其他 MCP client(Cursor、Antigravity……)使用相同的 `command` 與 `args`。

## 直接執行

```bash
npx -y social-skills-coach-mcp        # 以 stdio 講 MCP
```

或用 MCP Inspector 檢視:

```bash
npx @modelcontextprotocol/inspector npx -y social-skills-coach-mcp
```

## 全域安裝(選用)

```bash
npm install -g social-skills-coach-mcp
# 或:pnpm add -g social-skills-coach-mcp
social-skills-coach-mcp               # 執行 stdio 伺服器
```

## ⚠️ 免責聲明

本專案為概念性最小可行產品(MVP),為
[Kaggle AI Agents Capstone](https://www.kaggle.com/competitions/vibecoding-agents-capstone-project)
(團隊 **Agents for Good**)而作,僅供有興趣者審閱與研究。它**無法取代受過專業訓練、
具執照的心理師或助人工作者**,亦不提供任何醫療診治或諮商。

你正在與 AI 對話:請避免提供個人資訊(真實姓名、電話、地址)。AI 可能犯錯與產生幻覺 ——
所有建議僅供參考。

## 授權

[MIT](https://opensource.org/licenses/MIT)
