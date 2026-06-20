---
name: social-skills-coach
description: Practical social-skills curriculum distilled from an 8-lesson course — making friends, opening and sustaining conversations, open vs closed questions, social errors to avoid, reading interest, electronic communication, humor, joining and leaving group conversations, and hosting gatherings. Load the relevant topic slice when coaching someone through a real social situation or evaluating a roleplay.
---

# Social Skills Coach — Knowledge Base

The single source of truth for the Social Skills AI Coach. Each topic below maps
to one file in `references/`. Load only the slices relevant to the user's
scenario and channel — do not dump unrelated topics.

This material is reference knowledge in English; the coaching agents reply to the
end user in Traditional Chinese (enforced by each agent's own prompt, not here).

## Topic index

| Key | Covers | Source lesson |
| --- | --- | --- |
| `friendship` | Traits of friendship, depth levels, friendship as a two-way choice | L1, L4 |
| `opening` | Four steps to open, five opener families, the approach sequence | L1 |
| `conversation-triangle` | The ask / compliment / share loop that keeps a conversation balanced | L1 |
| `open-closed-questions` | Open vs closed questions and the three-follow-ups rule | L2 |
| `social-errors` | Errors to avoid, physical boundaries, eye contact, compliments, core mindset | L2 |
| `interest-signals` | Reading in-the-moment and longer-term engagement | L1, L4 |
| `electronic-comms` | Exchanging contact info, calls, messaging, social media | L3 |
| `humor` | Humor timing, hidden rules, reading reactions | L5 |
| `group-join` | Steps to join an ongoing group conversation | L6 |
| `group-exit` | When a group does not accept you: diagnose and exit gracefully | L7 |
| `hosting` | Planning and hosting a social gathering | L8 |
| `two-way-self-check` | Post-conversation reflection questions | L4 |

## How it is consumed

- **MCP server** (`/api/mcp`) exposes `list_social_topics` and
  `get_social_knowledge` backed by these files, so any MCP client (this app,
  MCP Inspector, Claude Desktop) can pull the curriculum.
- The coach agent selects the topics relevant to the user's scenario and the app
  fetches just those slices to ground its advice.
