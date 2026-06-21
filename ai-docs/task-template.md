role: Architect, Next.js Full-Stack, QA
reply language: Traditional Chinese
task: 檢視 README 中的錯誤

README 中提到這一段：A single chatbot would blur four very different jobs. Coaching is naturally a **pipeline of specialists**, so the app runs one agent per job, coordinated by an orchestrator

但事實上，目前架構裡應該沒有 orchestrator？我目前只看到四個 tab 對應四個 sub-agents

你根據 kaggle.md 的評分機制來判斷是否要實作 orchestrator？以及以經濟型 AI model 的能力如 Mimo 2.5 Pro, DeepSeek v4 Pro 等是否足以支撐這種架構？

如果可以，將此功能加入到專案中。

如果不行，幫我檢查所有 README.md, README-cht.md (包含 packages/social-skills-coach-mcp 內的 README.md, README-cht.md)，將此功能的錯誤修正。

makes tasks.md only, only get user's confirmation before modifying any file in projects.
before you start: if you have any questions or unclear points, ask me now
