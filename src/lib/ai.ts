import { createOpenAICompatible } from "@ai-sdk/openai-compatible"

export const DEFAULT_MIMO_BASE_URL = "https://api.xiaomimimo.com/v1"
export const DEEPSEEK_BASE_URL = "https://api.deepseek.com"
export const GROK_BASE_URL = "https://api.x.ai/v1"
// Example custom base URL shown to BYOK MiMo users on paid token plans.
export const MIMO_CUSTOM_BASE_URL_EXAMPLE = "https://token-plan-cn.xiaomimimo.com/v1"

// Fallback model used when the demo MiMo/Grok key expires and DeepSeek covers the request.
export const DEEPSEEK_FALLBACK_MODEL = "deepseek-chat"

export const MODELS = {
  grok: ["grok-4.5", "grok-4.1-fast"],
  mimo: ["mimo-v2.5-pro", "mimo-v2.5"],
  deepseek: ["deepseek-v4-pro", "deepseek-v4-flash"]
} as const

export type ProviderName = keyof typeof MODELS

export function getProvider(providerName: ProviderName, apiKey: string, baseURL?: string) {
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
