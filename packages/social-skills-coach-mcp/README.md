# social-skills-coach-mcp

An [MCP](https://modelcontextprotocol.io) server that turns an 8-lesson social-skills
curriculum into a coaching capability **any MCP client can use with its own model**.

It exposes:

- **Prompts** — the four coaching agents, which run on _your_ model:
  - `analyze_situation(situation)` — structure a social situation
  - `coach(situation)` — concrete, curriculum-grounded advice
  - `roleplay(scenario)` — the other person, for practice
  - `reflect(transcript)` — rubric-based evaluation of a roleplay
- **Tools** — curriculum knowledge for grounding:
  - `list_social_topics()` — the 12 topics
  - `get_social_knowledge({ topics })` — the verbatim slice(s)

No API key is needed: the server only serves prompts + knowledge; your client's model
does the reasoning.

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

## Run directly

```bash
npx -y social-skills-coach-mcp        # speaks MCP over stdio
```

Or inspect it with the MCP Inspector:

```bash
npx @modelcontextprotocol/inspector npx -y social-skills-coach-mcp
```

## License

MIT
