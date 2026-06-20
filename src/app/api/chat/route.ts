import { streamText, generateObject } from "ai"

import {
  analyzerPrompt,
  coachPrompt,
  roleplayPrompt,
  reflectionPrompt,
  reflectionSchema
} from "@/lib/agents"
import { getProvider } from "@/lib/ai"

export async function POST(req: Request) {
  try {
    const { messages, provider, model, mode, stage, roleplayHistory } = await req.json()
    const authHeader = req.headers.get("Authorization")
    const byokKey = authHeader?.replace("Bearer ", "")

    let apiKey = byokKey
    if (mode === "demo") {
      apiKey = provider === "mimo" ? process.env.MIMO_API_KEY : process.env.DEEPSEEK_API_KEY
    }

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing API Key" }), { status: 401 })
    }

    const aiProvider = getProvider(provider as "mimo" | "deepseek", apiKey)

    if (stage === "reflection") {
      const transcript = (roleplayHistory || [])
        .map((m: any) => `${m.role === "user" ? "User" : "Roleplay Partner"}: ${m.content}`)
        .join("\n")

      const promptText = `
Roleplay Transcript:
${transcript}

User's request:
${messages[messages.length - 1]?.content || ""}
      `

      try {
        const result = await generateObject({
          model: aiProvider(model) as any,
          schema: reflectionSchema,
          system: reflectionPrompt,
          prompt: promptText
        })

        const obj = result.object
        const markdown = `
### Overall Assessment: ${obj.overallStatus === "pass" ? "✅ Pass" : "⚠️ Needs Practice"}

**Strengths:**
${obj.strengths.map((s: string) => `- ${s}`).join("\n")}

**Areas for Improvement:**
${obj.areasForImprovement.map((a: string) => `- ${a}`).join("\n")}

**Feedback:**
${obj.feedback}
        `.trim()

        return new Response(markdown, { headers: { "Content-Type": "text/plain" } })
      } catch (err) {
        console.error("Evaluation Error:", err)
        return new Response(
          "Error generating evaluation. Please ensure your model supports structured outputs.",
          { status: 500 }
        )
      }
    }

    let systemPrompt = ""
    switch (stage) {
      case "analyzer":
        systemPrompt = analyzerPrompt
        break
      case "coach":
        systemPrompt = coachPrompt
        break
      case "roleplay":
        systemPrompt = roleplayPrompt
        break
      case "reflection":
        systemPrompt = reflectionPrompt
        break
    }

    const result = streamText({
      model: aiProvider(model),
      system: systemPrompt,
      messages
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error("Chat API Error:", error)
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 })
  }
}
