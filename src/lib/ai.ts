import { createOpenAICompatible } from "@ai-sdk/openai-compatible"

export function getProvider(providerName: "mimo" | "deepseek", apiKey: string) {
  const baseURL =
    providerName === "mimo" ? "https://api.xiaomimimo.com/v1" : "https://api.deepseek.com"

  return createOpenAICompatible({
    name: providerName,
    baseURL,
    apiKey
  })
}
