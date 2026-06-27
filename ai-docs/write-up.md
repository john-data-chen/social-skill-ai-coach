Social Skills AI Coach
A multi-agent coach that lets anyone practice real social situations — analyze, get curriculum-grounded advice, role-play, and reflect — anytime, for the cost of $2~6/month.
Track: Agents for Good
Demo
Github
NPM
Video
The problem
Social skills can be learned — but they are extraordinarily hard to practice. Real conversations are high-risk, the opportunities are one-off, and almost no one will give you honest, in-the-moment feedback. The people who most want to improve are usually the ones with the fewest low-risk chances to try.

This hits one group especially hard: people with high-functioning autism or Asperger's, for whom social skills are learned mainly through deliberate practice. The gold-standard intervention, UCLA's PEERS program, works — but:

It is expensive and cumulative. A full 14–16 week course runs roughly $2,800–$3,600, and missing one session undermines the rest. Many families can't afford it; some parents won't acknowledge the need.
It gives no feedback in the moment. Even graduates have no coach standing beside them in a real conversation. People rarely say what went wrong — they just quietly withdraw. And a sudden interruption (noise, surprise) can blank your mind so that no learned technique is retrievable.
Starting late is costly. Once social habits set, exclusion can follow into adulthood — and very few adults will sit in a classroom of much younger students to relearn the basics.
The missing piece is not more curriculum. It is a safe, private, on-demand place to rehearse — and that is exactly what an AI agent system can provide.

I went looking for an affordable tool that did this. There wasn't one. If there had been, I would have paid for it instead of a $3,000 course. The concept of an AI coach is not new — but a working, affordable product for this specific need does not exist on the market. That gap is the project. Within three days of publishing the standalone MCP package — with no promotion — it received 600+ downloads, confirming the demand is not just mine. It is squarely an Agents for Good problem: lowering the barrier to a life skill that decides belonging, employment, and mental health.

The solution
Social Skills AI Coach turns a PEERS-style curriculum into a coach you can practice with at any time, through a four-stage loop:

Analyze → Coach → Role-Play → Reflect

Analyze — you describe a situation ("a new colleague keeps eating lunch alone; I want to invite them"). The agent structures it: who/what/where, the channel, the scenario type, and your goal — without jumping to advice.
Coach — you receive concrete, situation-specific guidance: 2–3 exact phrases you could actually say, plus the social errors to avoid for that scenario — grounded strictly in the curriculum.
Role-Play — the agent plays the other person so you can rehearse, reacting realistically to your skill level instead of being agreeable by default.
Reflect — the agent reviews the role-play transcript against a rubric and returns a structured, per-dimension evaluation: strengths, areas to improve, and concrete feedback.
The whole loop runs in the browser with bring-your-own-key (BYOK), so the marginal cost to a learner is a few dollars of API credit — roughly three orders of magnitude cheaper than the course it draws from.

Why agents? Why multi-agent?
A single chatbot would blur four genuinely different jobs and do all of them worse. Coaching is naturally a pipeline of specialists, and modeling it that way is what makes the output good:

The Analyzer is deliberately forbidden from giving advice — it just frames the problem, which keeps the later advice targeted.
The Coach must stay inside the curriculum, so it is the only stage wired to retrieval (below).
The Role-Play agent has the opposite instinct of a helpful assistant — it must be realistic, not agreeable, or practice is worthless.
The Reflection agent is an evaluator with a fixed rubric and structured output, not a conversational partner.
These four agents are coordinated by an orchestrator, and the pipeline is the product: each agent has one job, one prompt, and one contract, which makes the behavior predictable and the system easy to reason about.

Architecture
Three design decisions carry most of the weight:

1. Deterministic routing, LLM grounding — each where it belongs.
   Pipeline state transitions (which stage am I in?) are handled by a small deterministic router (router.ts) driven by explicit user intent, not by asking an LLM. This keeps the UX predictable and lets the UI stay perfectly in sync with the active stage. The LLM is used where it actually adds value: retrieval-augmented grounding. For the Coach stage, the orchestrator (orchestrator.ts) asks the model to select the 1–5 curriculum topics most relevant to the user's situation (with a safe fallback set if structured output is unavailable), then loads just those knowledge slices. Advice is therefore strictly curriculum-bound rather than hallucinated.

2. The curriculum is an Agent Skill — one source of truth, consumed three ways.
   The entire curriculum lives in skills/social-skills-coach/ as a loadable Agent Skill: a SKILL.md index plus one markdown file per topic in references/. It is consumed (a) in-process by the coaching agents for speed, (b) externally over the Model Context Protocol by any MCP client, and (c) as a drop-in skill — the same folder dropped into any SKILL.md-compatible agent CLI (Antigravity CLI, Claude Code) is recognized as-is, no edits. All three paths read the same files, so the product knowledge can never drift.

3. One MCP core, two transports.
   A single function, registerSocialSkillsMcp(), registers the whole capability:

Tools — list_social_topics and get_social_knowledge({ topics }) expose the curriculum for grounding.
Prompts — analyze_situation, coach, roleplay, reflect expose the four agents.
Crucially, the agents are MCP prompts, which execute on the connecting client's model. So the MCP server needs no API key and runs no inference itself — anyone can drive the full coaching loop with their own (more capable) model. The same core serves both the hosted Next.js route (/api/mcp, Streamable HTTP) and a standalone npm stdio package (social-skills-coach-mcp) for local clients like Claude Desktop, Cursor, or Antigravity.

Course concepts demonstrated
The track asks for at least three course concepts; this project meaningfully applies all six.

Concept Where How
Agent / Multi-agent system Code Four specialized agents in a staged pipeline, coordinated by an orchestrator with LLM-driven knowledge routing.
MCP Server Code /api/mcp + the npm package expose curriculum tools and the four agents as prompts, from one shared core.
Agent Skills Code skills/social-skills-coach/ packages the curriculum as a loadable Skill — the single source of truth.
Security features Code BYOK (key never persisted), sessionStorage-only, and zod validation at every API/MCP trust boundary.
Deployability Docs / Video Deployed on Vercel; outputFileTracingIncludes bundles the Skill markdown into the serverless functions. Reproduce steps in the README.
Antigravity Video Built with the Antigravity IDE + CLI; the video shows an agent-built UX improvement (a live "AI is replying" indicator).
Security & privacy
Because the domain is sensitive, security is treated as a first-class feature and enforced at every trust boundary:

BYOK, never persisted. The API key travels per request in the Authorization: Bearer header, is used only in memory, and is never logged or written to a database.
Session-only storage. The browser keeps the key and chat history in sessionStorage (not localStorage), so they are wiped when the tab closes.
zod at the trust boundary. Every /api/chat and MCP request is parsed with zod; malformed bodies are rejected with 400 before reaching any model, and missing keys are gated with 401.
No internal leakage. Errors are logged server-side only; clients receive generic messages, never stack traces or secrets.
Stateless by design. No database and no server-side user data. The standalone MCP server holds no secret and runs no inference, so there is nothing to exfiltrate.
The app also nudges users not to share personally identifying information, since they are talking to an AI that can err.

The build — vibe coding with Antigravity
The project was built in a vibe-coding workflow using the Antigravity IDE and its CLI, paired with a set of agent skills (.agents/skills/) that enforced quality and style as the code was generated. A representative moment, captured in the video: using Antigravity's IDE + CLI to design and ship a small but real UX improvement — a streaming "AI is replying" loading indicator — end to end.

The stack is deliberately boring and robust: Next.js (App Router) + React + TypeScript (strict), TailwindCSS, the Vercel AI SDK for streaming and structured output, and Zustand for client state. Providers are wired through a single OpenAI-compatible adapter and surfaced via BYOK, so the coach is model-portable by design — plug in whatever you trust, from a $2 DeepSeek key to a frontier model — with automatic MiMo → DeepSeek failover so the public demo degrades gracefully when the demo key expires. The architecture commits to no single vendor; that portability is the point. Quality is backed by Vitest unit tests, Playwright end-to-end tests, CI, and coverage/quality gates (Codecov, SonarCloud). The code is commented for intent — security boundaries are tagged inline (e.g. [SECURITY: BYOK ...]) so a reviewer can find the trust decisions quickly.

The most important engineering decision was what not to let the LLM do: keeping stage routing deterministic, and constraining the Coach to retrieved curriculum, is what turns a generic chatbot into a trustworthy coach.

Deployability
The app is deployed on Vercel and reproduces with one button, more details in README of Github.

Limitations & honest scope
This is a conceptual MVP, not a clinical tool. It cannot replace a licensed psychologist or helping professional and provides no medical advice. The demo runs on a low-cost model (Xiaomi MiMo) to keep it free during review; the BYOK path lets anyone plug in a stronger model. The curriculum is a PEERS-style blueprint authored for this project, not the proprietary PEERS materials.

Roadmap
More providers (Anthropic, OpenAI, Google Gemini) behind the same adapter.
Voice role-play for higher-fidelity practice.
Saved (local-only) progress across the four stages.
