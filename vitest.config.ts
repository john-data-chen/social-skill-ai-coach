import path from "path"

import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest-setup.ts"],
    exclude: ["__tests__/e2e/**", "**/node_modules/**", "packages/**"],
    coverage: {
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/components/ui/**",
        "src/lib/utils.ts",
        "src/**/*.d.ts",
        "src/**/layout.tsx",
        "src/lib/agents/index.ts"
      ]
    },
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
})
