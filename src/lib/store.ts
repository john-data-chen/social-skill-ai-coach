import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

import type { ProviderName } from "@/lib/ai"

export interface Attachment {
  name: string
  contentType: string
  url: string
}

export interface Message {
  id: string
  role: string
  content: string
  experimental_attachments?: Attachment[]
}

export type Stage = "analyzer" | "coach" | "roleplay" | "reflection"

export interface AppState {
  // Config state (Persisted)
  provider: ProviderName | "demo"
  model: string
  apiKey: string
  baseUrl: string
  mode: "demo" | "byok"

  // App state (Transient)
  currentStage: Stage
  // One shared conversation across all stages. Switching stage only changes which agent responds
  // next, so context (and attachments) is never lost when moving between stages.
  messages: Message[]

  // Actions
  setConfig: (
    config: Partial<Pick<AppState, "provider" | "model" | "apiKey" | "baseUrl" | "mode">>
  ) => void
  setStage: (stage: Stage) => void
  setMessages: (messages: Message[]) => void
  clearMessages: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      provider: "grok",
      model: "grok-4.1-fast",
      apiKey: "",
      baseUrl: "",
      mode: "demo",
      currentStage: "analyzer",
      messages: [],

      setConfig: (config) => set((state) => ({ ...state, ...config })),
      setStage: (stage) => set({ currentStage: stage }),
      setMessages: (messages) => set({ messages }),
      clearMessages: () => set({ messages: [] })
    }),
    {
      name: "social-coach-storage",
      version: 1,
      // [SECURITY: Session Storage]
      // Use sessionStorage instead of localStorage so BYOK API keys and chat history
      // are automatically cleared when the tab is closed, preventing credential leakage.
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        provider: state.provider,
        model: state.model,
        apiKey: state.apiKey,
        baseUrl: state.baseUrl,
        mode: state.mode
      })
    }
  )
)
