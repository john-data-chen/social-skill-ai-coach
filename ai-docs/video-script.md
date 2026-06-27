# Video Script — Social Skills AI Coach (≤5 min, YouTube)

> Pure promo. Sells strengths. No self-critique, no jargon dumps. Lead = the affordability gap.
> VO ≈ 650 words ≈ 4:40 at a calm pace. Times are guides.

---

## 0:00–0:35 — Hook

**On screen:** Quiet shots — someone alone at a lunch table; a half-typed message, unsent; a group laughing, one person on the edge.

**VO:**

> Social skills can be learned. But you can't _practice_ them. Real conversations are one-shot and high-stakes — and when you get it wrong, nobody tells you. They just walk away.
> The best program for this costs three thousand dollars and runs four months. I went looking for something affordable. It didn't exist. So I built it.

---

## 0:35–1:05 — What it is

**On screen:** Title card → the four-stage loop animates → app UI.

**VO:**

> Social Skills AI Coach turns a proven, PEERS-style curriculum into a coach you can practice with anytime.
> Four steps. **Analyze** your situation. Get the **exact words** to say. **Role-play** it. Then get an honest **reflection**.
> A full coaching loop — for the cost of an API key.

---

## 1:05–2:45 — Demo (the proof — give it the most time)

**On screen:** Live screen capture. Scenario A, all four stages. Real typing, real responses.

**VO:**

> Here's a real one: There's a woman in my evening class I'd like to get to know and become friends with, but I'm worried about coming across the wrong way or making her uncomfortable. I want to start a friendly conversation respectfully.
> The **Analyzer** frames the situation — who, where, the goal — no advice yet.
> The **Coach** hands me exact phrases I can actually say, plus the mistakes to avoid — and it only uses the curriculum, so it can't make things up.
> Now I **rehearse**. The role-play _is_ the other person — and it pushes back, the way a real one would.
> When I'm done, the **Reflection** scores me dimension by dimension: what worked, what to fix.
> I can run this at 2 a.m., a hundred times. No one judges me. That's the point.

---

## 2:45–3:45 — Why it's built this way (sell the architecture)

**On screen:** `architecture.png`, highlighting the four agents → orchestrator → curriculum → MCP (+ `skills-in-*.png` / `mcp-in-*.png` for the cross-client proof).

**VO:**

> Four different jobs, four specialized agents, one orchestrator.
> The advice is never invented — the orchestrator retrieves only the curriculum pieces that fit your situation.
> And the whole curriculum is a single Agent Skill — one source of truth.
> The same coach is also an MCP server: every agent is a prompt that runs on _your_ model. So anyone can plug in a stronger model and run the entire coach themselves — no key on the server, nothing stored.

---

## 3:45–4:25 — The build (Antigravity)

**On screen:** Antigravity IDE + CLI clip — the live "AI is replying" indicator, end to end.

**VO:**

> I built it vibe-coding with the Antigravity IDE and CLI — here, shipping a live "AI is replying" indicator from idea to working feature.
> TypeScript, tested, and deployed on Vercel.

---

## 4:25–5:00 — Close / CTA

**On screen:** Cover image + links (live demo · npm · GitHub).

**VO:**

> Social skills are learned by practicing. For the people who need it most, practice has been out of reach.
> Not anymore. Try it — the link's below.

---

### Shot checklist (assets already captured — only assembly + VO remain)

- [x] **Full demo capture, 4 stages** — `public/videos/phone-scrren-recording.MP4`
- [x] Antigravity clip — `public/videos/vibe-coding-with-antigravity.mov`
- [x] Loop animation + UI — `public/images/demo.webp`
- [x] Architecture diagram — `public/images/architecture.png`
- [x] Cover / end card — `public/images/cover.png`
- [ ] AI voiceover from this script + auto-captions (see `media-and-video-plan.md` §3–4)
- [ ] Optional Hook B-roll (lonely / edge-of-group) — nice-to-have, not blocking
