import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
export interface Message {
  id: string
  role: string
  content: string
}

export type Stage = "analyzer" | "coach" | "roleplay" | "reflection"

export interface AppState {
  // Config state (Persisted)
  provider: "mimo" | "deepseek" | "demo"
  model: string
  apiKey: string
  mode: "demo" | "byok"

  // App state (Transient)
  currentStage: Stage
  history: Record<Stage, Message[]>

  // Actions
  setConfig: (config: Partial<Pick<AppState, "provider" | "model" | "apiKey" | "mode">>) => void
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
      model: "gpt-4o", // Example default, will be adjusted later
      apiKey: "",
      mode: "byok",
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
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        provider: state.provider,
        model: state.model,
        apiKey: state.apiKey,
        mode: state.mode
      })
    }
  )
)
