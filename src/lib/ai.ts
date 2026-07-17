import { createOpenAICompatible } from "@ai-sdk/openai-compatible"

const DEFAULT_MIMO_BASE_URL = "https://api.xiaomimimo.com/v1"
const DEEPSEEK_BASE_URL = "https://api.deepseek.com"
const GROK_BASE_URL = "https://api.x.ai/v1"

export function getProvider(
  providerName: "mimo" | "deepseek" | "grok",
  apiKey: string,
  baseURL?: string
) {
  const resolvedBaseURL =
    providerName === "grok"
      ? GROK_BASE_URL
      : providerName === "deepseek"
        ? DEEPSEEK_BASE_URL
        : baseURL || DEFAULT_MIMO_BASE_URL

  return createOpenAICompatible({
    name: providerName,
    baseURL: resolvedBaseURL,
    apiKey
  })
}
