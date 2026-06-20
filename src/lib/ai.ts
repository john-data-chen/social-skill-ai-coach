import { createOpenAICompatible } from "@ai-sdk/openai-compatible"

const DEFAULT_MIMO_BASE_URL = "https://api.xiaomimimo.com/v1"
const DEEPSEEK_BASE_URL = "https://api.deepseek.com"

export function getProvider(providerName: "mimo" | "deepseek", apiKey: string, baseURL?: string) {
  const resolvedBaseURL =
    providerName === "mimo" ? baseURL || DEFAULT_MIMO_BASE_URL : DEEPSEEK_BASE_URL

  return createOpenAICompatible({
    name: providerName,
    baseURL: resolvedBaseURL,
    apiKey
  })
}
