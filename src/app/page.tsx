"use client"

import { Paperclip, X } from "lucide-react"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import ReactMarkdown from "react-markdown"
import TextareaAutosize from "react-textarea-autosize"

import { Settings } from "@/components/Settings"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { determineNextStage } from "@/lib/router"
import { useAppStore, type Attachment } from "@/lib/store"

export default function Home() {
  const { provider, model, apiKey, baseUrl, mode, currentStage, setStage, history, setHistory } =
    useAppStore()

  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<any[]>(history[currentStage] || [])
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Restore history when stage changes
  useEffect(() => {
    setMessages(history[currentStage] || [])
  }, [currentStage, history])

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

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    void (async () => {
      if (!input.trim() && attachments.length === 0) {
        setStage(determineNextStage(currentStage, ""))
        return
      }

      const nextStage = determineNextStage(currentStage, input)
      if (nextStage !== currentStage) {
        setStage(nextStage)
        setInput("")
        return
      }

      const userMessage = {
        id: Date.now().toString(),
        role: "user",
        content: input,
        ...(attachments.length > 0 && { experimental_attachments: attachments })
      }
      const newMessages = [...messages, userMessage]
      setMessages(newMessages)
      setInput("")
      setAttachments([])
      setIsLoading(true)

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            messages: newMessages,
            provider,
            model,
            baseUrl,
            mode,
            stage: currentStage,
            roleplayHistory: history["roleplay"] || []
          })
        })

        const aiMessageId = (Date.now() + 1).toString()
        // Surface failures instead of leaving an empty bubble. A bad API key or
        // Base URL makes the upstream call fail, which the AI SDK returns as a
        // 200 with an *empty* stream — so we also treat empty output as an error.
        const showError = (text: string) => {
          setIsLoading(false)
          setMessages([
            ...newMessages,
            { id: aiMessageId, role: "assistant", content: `⚠️ ${text}` }
          ])
        }

        if (!response.ok) {
          const detail = (await response.text().catch(() => "")) || ""
          showError(
            `Request failed (${response.status}). ${detail || "Check your API key / Base URL / mode in Settings."}`
          )
          return
        }

        const reader = response.body?.getReader()
        if (!reader) {
          showError("No response stream returned.")
          return
        }

        setIsLoading(false)

        const decoder = new TextDecoder()
        let aiContent = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            break
          }

          aiContent += decoder.decode(value, { stream: true })
          setMessages([...newMessages, { id: aiMessageId, role: "assistant", content: aiContent }])
        }

        if (!aiContent.trim()) {
          showError(
            "Empty response from the model — likely a wrong API key or Base URL. Check Settings, or switch to Demo mode."
          )
          return
        }

        setHistory(currentStage, [
          ...newMessages,
          { id: aiMessageId, role: "assistant", content: aiContent }
        ])
      } catch (err) {
        console.error(err)
        setIsLoading(false)
        setMessages([
          ...newMessages,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `⚠️ ${err instanceof Error ? err.message : "Network error"}`
          }
        ])
      }
    })()
  }

  return (
    <div className="flex min-h-screen flex-col p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Social Skills Coach</h1>
          <p className="text-gray-500">Practice and improve your social interactions</p>
        </div>
        <div className="flex gap-2">
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analyzer">1. Analyzer</TabsTrigger>
            <TabsTrigger value="coach">2. Coach</TabsTrigger>
            <TabsTrigger value="roleplay">3. Roleplay</TabsTrigger>
            <TabsTrigger value="reflection">4. Reflection</TabsTrigger>
          </TabsList>
        </Tabs>

        <Card className="flex-1 flex flex-col overflow-hidden min-h-[600px] max-h-[80vh]">
          <CardHeader>
            <CardTitle className="capitalize">{currentStage} Stage</CardTitle>
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
              {isLoading && (
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
              <form onSubmit={onSubmit} className="flex gap-2">
                <input
                  type="file"
                  multiple
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,text/*,.pdf,.doc,.docx"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  className="shrink-0"
                >
                  <Paperclip size={18} />
                </Button>
                <TextareaAutosize
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      onSubmit({ preventDefault: () => {} } as React.FormEvent<HTMLFormElement>)
                    }
                  }}
                  minRows={1}
                  maxRows={3}
                  placeholder={
                    currentStage === "reflection"
                      ? "Type 'Review me' to start reflection..."
                      : "Type your message (or empty to next stage)..."
                  }
                  className="flex-1 resize-none rounded-lg border border-input bg-white px-2.5 py-2 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-gray-950"
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Thinking..." : "Send"}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
