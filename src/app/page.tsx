"use client"

import { useState, useEffect, useRef } from "react"
import ReactMarkdown from "react-markdown"

import { Settings } from "@/components/Settings"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { determineNextStage } from "@/lib/router"
import { useAppStore } from "@/lib/store"

export default function Home() {
  const { provider, model, apiKey, mode, currentStage, setStage, history, setHistory } =
    useAppStore()

  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<any[]>(history[currentStage] || [])

  // Restore history when stage changes
  useEffect(() => {
    setMessages(history[currentStage] || [])
  }, [currentStage, history])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    void (async () => {
      if (!input.trim()) {
        setStage(determineNextStage(currentStage, ""))
        return
      }

      const nextStage = determineNextStage(currentStage, input)
      if (nextStage !== currentStage) {
        setStage(nextStage)
        setInput("")
        return
      }

      const userMessage = { id: Date.now().toString(), role: "user", content: input }
      const newMessages = [...messages, userMessage]
      setMessages(newMessages)
      setInput("")

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            messages: newMessages,
            provider,
            model,
            mode,
            stage: currentStage,
            roleplayHistory: history["roleplay"] || []
          })
        })

        if (!response.ok) {
          throw new Error("Fetch failed")
        }

        const reader = response.body?.getReader()
        if (!reader) {
          return
        }

        const decoder = new TextDecoder()
        let aiContent = ""
        const aiMessageId = (Date.now() + 1).toString()

        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            break
          }

          aiContent += decoder.decode(value, { stream: true })
          setMessages([...newMessages, { id: aiMessageId, role: "assistant", content: aiContent }])
        }

        setHistory(currentStage, [
          ...newMessages,
          { id: aiMessageId, role: "assistant", content: aiContent }
        ])
      } catch (err) {
        console.error(err)
      }
    })()
  }

  return (
    <div className="flex min-h-screen flex-col p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Social Skills AI Coach</h1>
        <Settings />
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
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={onSubmit}
              className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-800"
            >
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder={
                  currentStage === "reflection"
                    ? "Type 'Review me' to start reflection..."
                    : "Type your message (or empty to next stage)..."
                }
                className="flex-1 bg-white dark:bg-gray-950"
              />
              <Button type="submit">Send</Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
