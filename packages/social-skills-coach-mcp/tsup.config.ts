import { defineConfig } from "tsup"

// Two entries: the stdio bin (index) and the reusable server core (server).
// ESM with code-splitting so the shared core/knowledge/prompts is emitted once.
export default defineConfig({
  entry: ["src/index.ts", "src/server.ts"],
  format: ["esm"],
  target: "node18",
  splitting: true,
  clean: true,
  dts: false
})
