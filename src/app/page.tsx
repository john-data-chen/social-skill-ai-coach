"use client"

import { Paperclip, X, Info } from "lucide-react"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import ReactMarkdown from "react-markdown"
import TextareaAutosize from "react-textarea-autosize"

import { Settings } from "@/components/Settings"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { parseStageCommand } from "@/lib/router"
import { useAppStore, type Attachment, type Stage } from "@/lib/store"

// Display labels for each stage. Internal Stage ids stay as-is (e.g. "roleplay"); the UI shows
// the hyphenated "Role-Play".
const STAGE_LABELS: Record<Stage, string> = {
  analyzer: "Analyzer",
  coach: "Coach",
  roleplay: "Role-Play",
  reflection: "Reflection"
}

export default function Home() {
  const { provider, model, apiKey, baseUrl, mode, currentStage, setStage, messages, setMessages } =
    useAppStore()

  const [input, setInput] = useState("")
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCommandsInfo, setShowCommandsInfo] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem("hasSeenCommands")) {
      setShowCommandsInfo(true)
      localStorage.setItem("hasSeenCommands", "true")
    }
  }, [])
  const fileInputRef = useRef<HTMLInputElement>(null)
  // Synchronous re-entry guard for the whole send flow (incl. the Analyzer->Coach handoff).
  // `isLoading` state drives the disabled UI, but a state read inside a rapid second Enter can
  // be stale, so this ref blocks overlapping requests race-free.
  const busyRef = useRef(false)
  // Fires the Analyzer->Coach auto-handoff at most once (so it survives an opening "hi").
  const autoHandoffRef = useRef(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return
    }

    Array.from(e.target.files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        setAttachments((prev) => [
          ...prev,
          {
            name: file.name,
            contentType: file.type,
            url: reader.result as string
          }
        ])
      }
      reader.readAsDataURL(file)
    })

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  // Stream one pipeline stage to /api/chat. Returns the assistant text, or null on
  // failure — so callers can decide whether to chain into the next stage.
  const streamStage = async (stage: Stage, seeded: any[]): Promise<string | null> => {
    // One shared conversation across all stages — switch the active agent and show the thread.
    setStage(stage)
    setMessages(seeded)

    const aiMessageId = (Date.now() + 1).toString()
    // Surface failures instead of leaving an empty bubble. A bad API key or Base URL
    // makes the upstream call fail, which the AI SDK returns as a 200 with an *empty*
    // stream — so we also treat empty output as an error.
    const showError = (text: string) => {
      setMessages([...seeded, { id: aiMessageId, role: "assistant", content: `⚠️ ${text}` }])
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          messages: seeded,
          provider,
          model,
          baseUrl,
          mode,
          stage
        })
      })

      if (!response.ok) {
        let detail = ""
        try {
          const data = await response.json()
          detail = data.error || data.message || ""
        } catch {
          detail = (await response.text().catch(() => "")) || ""
        }
        showError(
          `Request failed (${response.status}). ${detail || "Check your API key / Base URL / mode in Settings."}`
        )
        return null
      }

      const reader = response.body?.getReader()
      if (!reader) {
        showError("No response stream returned.")
        return null
      }

      const decoder = new TextDecoder()
      let aiContent = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          break
        }

        aiContent += decoder.decode(value, { stream: true })
        setMessages([...seeded, { id: aiMessageId, role: "assistant", content: aiContent }])
      }

      if (!aiContent.trim()) {
        showError(
          "Empty response from the model — likely a wrong API key or Base URL. Check Settings, or switch to Demo mode."
        )
        return null
      }

      setMessages([...seeded, { id: aiMessageId, role: "assistant", content: aiContent }])
      return aiContent
    } catch (err) {
      console.error(err)
      setMessages([
        ...seeded,
        {
          id: aiMessageId,
          role: "assistant",
          content: `⚠️ ${err instanceof Error ? err.message : "Network error"}`
        }
      ])
      return null
    }
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Drop submits fired while a request flow is still running (see busyRef).
    if (busyRef.current) {
      return
    }

    // Empty input does nothing — navigate via the tabs or a /command, never by accident.
    if (!input.trim() && attachments.length === 0) {
      return
    }

    // A slash command (anywhere in the message) jumps to that stage. Any leftover content — the
    // text minus the command, and/or an attachment — is handed straight to the destination agent
    // so the jump actually does something instead of dropping you on an empty stage.
    const command = input.trim() ? parseStageCommand(input) : null
    if (command) {
      setInput("")
      if (!command.rest && attachments.length === 0) {
        setStage(command.stage)
        return
      }
      const commandMessage = {
        id: Date.now().toString(),
        role: "user",
        content: input.trim(),
        ...(attachments.length > 0 && { experimental_attachments: attachments })
      }
      setAttachments([])
      busyRef.current = true
      setIsLoading(true)
      void (async () => {
        try {
          await streamStage(command.stage, [...messages, commandMessage])
        } finally {
          busyRef.current = false
          setIsLoading(false)
        }
      })()
      return
    }

    const situation = input
    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      ...(attachments.length > 0 && { experimental_attachments: attachments })
    }
    // Auto-continue into Coach the first time the user describes a real situation in Analyzer, so
    // they reach the strongest agent without re-typing. Fires at most once (autoHandoffRef) and
    // only on a non-trivial message, so a bare opening "hi" doesn't burn it.
    const shouldHandoff =
      currentStage === "analyzer" && !autoHandoffRef.current && situation.trim().length >= 6
    setInput("")
    setAttachments([])

    // isLoading stays true for the WHOLE flow (send + Analyzer->Coach handoff), so the Send
    // button is disabled the entire time — not just until the first token streams in.
    busyRef.current = true
    setIsLoading(true)
    void (async () => {
      try {
        const analyzerOut = await streamStage(currentStage, [...messages, userMessage])

        // The Coach runs on the full shared thread (the situation + the Analyzer's structured
        // output are already in it), so there's nothing to re-seed — just switch the agent.
        if (shouldHandoff && analyzerOut) {
          autoHandoffRef.current = true
          await streamStage("coach", useAppStore.getState().messages)
        }
      } finally {
        busyRef.current = false
        setIsLoading(false)
      }
    })()
  }

  return (
    <div className="flex min-h-screen flex-col p-4 sm:p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">Social Skills Coach</h1>
          <p className="text-gray-500 text-sm sm:text-base mt-1">
            Practice and improve your social interactions
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <ThemeToggle />
          <Settings />
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto flex flex-col gap-6">
        <Tabs
          value={currentStage}
          onValueChange={(val: any) => {
            setStage(val)
          }}
        >
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 p-1">
            <TabsTrigger
              value="analyzer"
              className="whitespace-normal sm:whitespace-nowrap py-1.5 sm:py-0.5"
            >
              1. Analyzer
            </TabsTrigger>
            <TabsTrigger
              value="coach"
              className="whitespace-normal sm:whitespace-nowrap py-1.5 sm:py-0.5"
            >
              2. Coach
            </TabsTrigger>
            <TabsTrigger
              value="roleplay"
              className="whitespace-normal sm:whitespace-nowrap py-1.5 sm:py-0.5"
            >
              3. Role-Play
            </TabsTrigger>
            <TabsTrigger
              value="reflection"
              className="whitespace-normal sm:whitespace-nowrap py-1.5 sm:py-0.5"
            >
              4. Reflection
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Card className="flex-1 flex flex-col overflow-hidden min-h-[600px] max-h-[80vh]">
          <CardHeader>
            <CardTitle>{STAGE_LABELS[currentStage]} Stage</CardTitle>
            <CardDescription>
              {currentStage === "analyzer" && "Describe your social situation. Who, what, where?"}
              {currentStage === "coach" && "Get concrete advice on what to say and do."}
              {currentStage === "roleplay" &&
                "Practice the conversation. I will play the other person."}
              {currentStage === "reflection" && "Review your practice and get feedback."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4 overflow-y-auto">
            <div className="flex-1 space-y-4 overflow-y-auto pr-2 pb-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 mt-10">
                  No messages yet. Start typing to begin!
                </div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`p-4 rounded-xl max-w-[85%] prose dark:prose-invert text-sm leading-relaxed ${m.role === "user" ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-800 shadow-sm border dark:border-gray-700"}`}
                    >
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                      {m.experimental_attachments && m.experimental_attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {m.experimental_attachments.map((att: Attachment, i: number) => (
                            <div
                              key={i}
                              className="rounded overflow-hidden border border-gray-300 dark:border-gray-600 bg-white/10"
                            >
                              {att.contentType.startsWith("image/") ? (
                                <Image
                                  src={att.url}
                                  alt={att.name}
                                  width={0}
                                  height={0}
                                  className="max-h-40 object-cover"
                                  sizes="100vw"
                                />
                              ) : (
                                <div className="p-2 text-xs flex items-center">{att.name}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex justify-start">
                  <div className="p-4 rounded-xl max-w-[85%] bg-white dark:bg-gray-800 shadow-sm border dark:border-gray-700">
                    <div className="flex gap-1 items-center h-6 px-2">
                      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex flex-col border-t border-gray-200 dark:border-gray-800 pt-4">
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {attachments.map((att, i) => (
                    <div
                      key={i}
                      className="relative rounded overflow-hidden border bg-background group"
                    >
                      {att.contentType.startsWith("image/") ? (
                        <Image
                          src={att.url}
                          alt={att.name}
                          width={64}
                          height={64}
                          className="w-16 h-16 object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 flex items-center justify-center bg-muted text-[10px] text-center p-1 break-all overflow-hidden">
                          {att.name}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          removeAttachment(i)
                        }}
                        className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={onSubmit} className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCommandsInfo(true)
                    }}
                    className="flex-1"
                    title="Show Commands"
                  >
                    <Info size={18} className="mr-2" /> Help
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1"
                  >
                    <Paperclip size={18} className="mr-2" /> attachment
                  </Button>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,text/*,.pdf,.doc,.docx"
                  />
                </div>
                <TextareaAutosize
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    // `isComposing` guards IME input (Chinese/Japanese/Korean): the Enter that
                    // confirms a candidate must NOT submit — otherwise it sends early and the
                    // IME's commit then re-fills the just-cleared box. Press Enter again to send.
                    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                      e.preventDefault()
                      onSubmit({ preventDefault: () => {} } as React.FormEvent<HTMLFormElement>)
                    }
                  }}
                  minRows={2}
                  maxRows={5}
                  placeholder={
                    currentStage === "reflection" ? "Review me... (Enter to send)" : "Enter to send"
                  }
                  className="w-full resize-none rounded-lg border border-input bg-white px-3 py-2 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-gray-950"
                />
                <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
                  {isLoading ? "Thinking..." : "Send"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  You are talking to an AI. Avoid sharing personal info (real name, phone, address,
                  etc.). AI can make mistakes; suggestions are for reference only.
                </p>
              </form>
            </div>
          </CardContent>
        </Card>
      </main>
      <Dialog open={showCommandsInfo} onOpenChange={setShowCommandsInfo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick Commands</DialogTitle>
            <DialogDescription>
              Use these slash commands anywhere in your message to jump to a specific stage:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm mt-4">
            <div className="flex flex-col gap-2">
              <code className="bg-muted px-2 py-1 rounded w-fit">/analyzer [message]</code>
              <p className="text-muted-foreground ml-2">Describe the situation.</p>
            </div>
            <div className="flex flex-col gap-2">
              <code className="bg-muted px-2 py-1 rounded w-fit">/coach [message]</code>
              <p className="text-muted-foreground ml-2">Ask for advice.</p>
            </div>
            <div className="flex flex-col gap-2">
              <code className="bg-muted px-2 py-1 rounded w-fit">/role-play [message]</code>
              <p className="text-muted-foreground ml-2">Practice the conversation.</p>
            </div>
            <div className="flex flex-col gap-2">
              <code className="bg-muted px-2 py-1 rounded w-fit">/reflection [message]</code>
              <p className="text-muted-foreground ml-2">Review your practice.</p>
            </div>
            <p className="text-xs text-muted-foreground mt-4 italic">
              Example: &ldquo;/coach how should I reply?&rdquo;
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
