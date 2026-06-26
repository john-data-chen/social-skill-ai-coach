# social-skills-coach-mcp

[![npm downloads](https://img.shields.io/npm/dm/social-skills-coach-mcp.svg)](https://www.npmjs.com/package/social-skills-coach-mcp)
[![Node](https://img.shields.io/node/v/social-skills-coach-mcp.svg)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> For English, see [README.md](https://github.com/john-data-chen/social-skill-ai-coach/blob/main/packages/social-skills-coach-mcp/README.md).

一個 [MCP](https://modelcontextprotocol.io) 伺服器,將 PEERS 式的社交技巧課程轉成完整的教練循環 —— **分析 → 教練 → 角色扮演 → 復盤** —— 讓**任何 MCP client 都能用自己的模型執行**。

它在沒有進行任何付費廣告下，發布後 3 天內就獲得了 600 多次下載，這表明對易於使用的社交技能工具的真正需求。

它是 [Social Skills AI Coach](https://github.com/john-data-chen/social-skill-ai-coach) 專案的獨立、可發布套件（試試 **[線上 Demo](https://social-skill-ai-coach.vercel.app)**、或 **[影片](https://youtu.be/QsxvIu60pY8)**）:
描述一個情境,獲得以課程為依據的具體建議,透過角色扮演演練,再得到結構化的復盤回饋。

## 為何「自帶模型」(BYO model)

四個 agent 以 MCP **prompts** 形式提供 —— 它們執行在**連線的 client 的模型**上。本伺服器
只提供 prompts 與課程知識,**自己不跑任何推論(inference)**,所以:

- 本伺服器**不需要 API key**。
- **相容任何模型**(Anthropic、OpenAI、Google Gemini、本地模型等)—— 你可以接上比 Demo Web App 更強的模型。
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

所有 agent 會以**使用者輸入時所用的相同語言**回覆,所以你可以用母語練習。語言品質依你接上的模型而定;已在 MiMo / DeepSeek 上測試英文、中文、西班牙文皆能順利運作。

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

## 🔒 安全性

- **沒有機密可外洩。** 伺服器不持有任何 API key、也不跑推論——所有推理都在連線方 client 的模型上發生,這裡沒有東西可被竊取。
- **信任邊界以 zod 驗證。** 每個 tool／prompt 參數都用 zod 驗證(topic key 為固定 enum、`min 1`);格式錯誤或超出範圍的輸入會在使用前被擋下。
- **無狀態設計。** 只讀取打包進來的課程 markdown 並回傳文字——沒有資料庫、不留存、無遙測。

## ⚠️ 免責聲明

本專案為概念性最小可行產品(MVP)，為了參與 [Kaggle AI Agents Capstone Project ](https://www.kaggle.com/competitions/vibecoding-agents-capstone-project) (參加組別 **Agents for Good**) 而作，僅供有興趣者審閱與研究。
**本專案無法取代受過專業訓練且擁有合格證照的心理師或諮商師， 且無法提供任何醫療與諮商行為**。

示範影片與截圖為了 Kaggle 評審以英文為主。你可以直接用母語與 AI 對話——支援度依模型能力而有所不同。我在 MiMo / DeepSeek 上測試過英文、中文、西班牙文，皆能順利運作。

請始終記住:**您是在跟 AI 對話。** 應避免在對話中提及真實姓名、電話、地址等個人資訊，必要時用化名。AI 可能會出錯與幻覺——所有建議僅供參考。

## 授權

[MIT](https://opensource.org/licenses/MIT)
