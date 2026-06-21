# Task: Fix the "orchestrator" wording in the README files

## Context

The README claimed the four coaching agents are "coordinated by an orchestrator."
Investigation showed this is misleading, not a missing component:

- `src/lib/orchestrator.ts` **does exist** and is called from `src/app/api/chat/route.ts:215`.
  But it only does **RAG knowledge grounding** for the Coach stage (LLM-selects curriculum
  topics, loads those slices). It does **not** coordinate the four agents.
- The actual pipeline coordination (Analyzer -> Coach -> Roleplay -> Reflection) is done by
  `src/lib/router.ts` — **deterministic** rule-based routing, **not** an LLM. `router.ts:6`
  documents this as a deliberate choice (predictable UX, UI sync, avoid fragile LLM state machine).

So the word "coordinated by an orchestrator" wrongly implies the orchestrator routes the
pipeline. The fix is wording only — describe the deterministic router + the RAG orchestrator
accurately.

**Decision (confirmed with user):** Do NOT build a new LLM orchestrator. Rationale:
- Kaggle multi-agent concept is already satisfied (6 course concepts shown vs 3 required); a new
  orchestrator adds no points.
- Deterministic routing is a defensible, documented design strength.
- Economic models (MiMo 2.5 Pro / DeepSeek v4 Pro) make dynamic LLM orchestration unreliable;
  existing `FALLBACK_TOPICS` already handles cheap-model limits. New orchestrator = regression risk,
  zero upside.

**Scope:** Only root `README.md` + `README-cht.md`. The two MCP package READMEs
(`packages/social-skills-coach-mcp/README{,-cht}.md`) were checked and never mention an
orchestrator — no change needed. `README.md:46` and the repo-structure comments (`:157`) are
already accurate — leave them.

## Sub-Tasks

- [x] **1. Fix README.md wording (English)**
  - Scope: `README.md`
  - Edits:
    - L37 — replace "so the app runs one agent per job, coordinated by an orchestrator:"
      with text that names the deterministic router (pipeline coordination) and the LLM
      orchestrator (RAG grounding for the Coach).
    - L60 — replace "coordinated by an orchestrator with LLM-driven knowledge routing."
      with "...with deterministic stage routing, plus an LLM orchestrator that does knowledge
      routing (RAG) to ground the Coach."
  - Done when: no line implies the orchestrator routes the agent pipeline; router.ts role is stated.

- [x] **2. Fix README-cht.md wording (Traditional Chinese)**
  - Scope: `README-cht.md`
  - Edits: mirror Task 1 at L37 and L60 in Traditional Chinese.
  - Done when: zh wording matches en meaning; mentions 確定性 router + RAG orchestrator.
  - Depends on: Task 1 (keep wording parallel)

- [x] **3. Verify**
  - Scope: both READMEs
  - Done when: `grep -ni "coordinated by an orchestrator\|由 orchestrator 協調" README.md README-cht.md`
    returns nothing; `pnpm lint-staged` clean on staged READMEs.
  - Depends on: Tasks 1, 2

## Proposed exact edits (awaiting user confirmation before applying)

### README.md L37
- FROM: `... so the app runs one agent per job, coordinated by an orchestrator:`
- TO:   `... so the app runs one agent per job — advanced through the pipeline by a deterministic stage router, with an LLM orchestrator grounding the Coach in curriculum (RAG):`

### README.md L60
- FROM: `Four specialized agents in a staged pipeline, coordinated by an orchestrator with LLM-driven knowledge routing.`
- TO:   `Four specialized agents in a staged pipeline with deterministic stage routing, plus an LLM orchestrator that does knowledge routing (RAG) to ground the Coach.`

### README-cht.md L37
- FROM: `... 所以本應用每個工作各用一個代理,並由 orchestrator 協調:`
- TO:   `... 所以本應用每個工作各用一個代理——由確定性(deterministic)階段路由器推進流水線,並由 LLM orchestrator 為 Coach 做課程落地(RAG):`

### README-cht.md L60
- FROM: `四個專職代理組成階段式流水線,由 orchestrator 以 LLM 驅動的知識路由協調。`
- TO:   `四個專職代理組成階段式流水線,以確定性階段路由推進,另由 LLM orchestrator 做知識路由(RAG)為 Coach 落地。`

## Notes for Next Session

### Current State
DONE. All four edits applied to README.md (L37, L60) and README-cht.md (L37, L60).
Verify grep confirms old phrases gone, new text present. lint-staged skips .md (no md task
configured). Build skipped — docs-only change, cannot affect TS build. CHT switched to
fullwidth （） to match doc style (e.g. README-cht.md:46 （RAG）).

### Recommended Next Steps
1. User reviews wording, then commits. Suggested message:
   `docs: clarify deterministic router vs RAG orchestrator in READMEs`
   Do NOT commit — user commits.

---

# Task 2: Auto-handoff Analyzer -> Coach (UX funnel fix, Option A)

## Context
Problem: most first-run users land on tab "1. Analyzer" (store default `currentStage: "analyzer"`),
which by design gives NO advice. Worse, each tab is an isolated chat (`page.tsx` `messages =
history[currentStage]`), so reaching the strongest agent (Coach) means re-typing the situation —
Coach's `situation` is just its own last message (`route.ts:213`). Net: 60-70% never feel Coach.

Decision (user picked Option A): auto-continue from Analyzer to Coach on the user's first Analyzer
turn, carrying the situation + Analyzer's structured output, and switch the tab to Coach so advice
appears on turn one. Pipeline narrative preserved (Kaggle story intact). Frontend-only — no
`route.ts` change (Coach already reads the last message as the situation).

## Sub-Tasks
- [/] **1. Refactor + wire auto-handoff in page.tsx**
  - Scope: `src/app/page.tsx` (+ `type Stage` import from store)
  - Extract `streamStage(stage, seeded) -> Promise<string|null>` from the inline onSubmit fetch/stream.
  - onSubmit: compute `firstAnalyzerTurn = currentStage === "analyzer" && messages.length === 0`;
    after streaming Analyzer, if first turn + got output, seed Coach with
    `situation + "\n\n[Structured by Analyzer]\n" + analyzerOut` and `streamStage("coach", seed)`.
  - Done when: typing a situation in Analyzer (empty Coach) auto-advances to Coach with advice,
    no re-typing; later Analyzer turns do NOT auto-advance; lint + build clean.

- [ ] **2. Verify**
  - Done when: `pnpm build` clean; manual/e2e check of first-turn handoff.

## Known limitations (ponytail)
- Auto-advance only on the FIRST Analyzer turn (heuristic). Upgrade path: explicit "Get advice"
  button if users want manual control / multi-turn analysis before coaching.
- Attachments on the Analyzer turn are not carried into the Coach seed (text situation only).
- Early `setHistory(stage, seeded)` now persists the user message even if the turn errors
  (was success-only) — acceptable / arguably better.
