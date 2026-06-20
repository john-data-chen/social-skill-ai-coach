import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
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
  provider: "mimo" | "deepseek" | "demo"
  model: string
  apiKey: string
  baseUrl: string
  mode: "demo" | "byok"

  // App state (Transient)
  currentStage: Stage
  history: Record<Stage, Message[]>

  // Actions
  setConfig: (
    config: Partial<Pick<AppState, "provider" | "model" | "apiKey" | "baseUrl" | "mode">>
  ) => void
  setStage: (stage: Stage) => void
  setHistory: (stage: Stage, messages: Message[]) => void
  clearHistory: () => void
}

const initialHistory: Record<Stage, Message[]> = {
  analyzer: [],
  coach: [],
  roleplay: [],
  reflection: []
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      provider: "mimo",
      model: "mimo-v2.5-pro",
      apiKey: "",
      baseUrl: "",
      mode: "demo",
      currentStage: "analyzer",
      history: initialHistory,

      setConfig: (config) => set((state) => ({ ...state, ...config })),
      setStage: (stage) => set({ currentStage: stage }),
      setHistory: (stage, messages) =>
        set((state) => ({
          history: {
            ...state.history,
            [stage]: messages
          }
        })),
      clearHistory: () => set({ history: initialHistory })
    }),
    {
      name: "social-coach-storage",
      version: 1,
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
