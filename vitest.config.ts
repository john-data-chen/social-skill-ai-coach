import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest-setup.ts"],
    exclude: ["__tests__/e2e/**", "node_modules/**"],
    coverage: {
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/components/ui/**", "src/lib/utils.ts", "src/**/*.d.ts", "src/**/layout.tsx"]
    },
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
});
