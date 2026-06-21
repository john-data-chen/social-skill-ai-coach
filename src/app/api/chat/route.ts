import { streamText, generateObject } from "ai"
import { z } from "zod"

import {
  analyzerPrompt,
  buildCoachPrompt,
  roleplayPrompt,
  reflectionPrompt,
  reflectionSchema
} from "@/lib/agents"
import { getProvider } from "@/lib/ai"
import { groundingFor, selectKnowledgeTopics } from "@/lib/orchestrator"

// [SECURITY: Trust Boundary Validation]
// Validate the request body at the trust boundary using zod. Loose objects let client-only
// fields (e.g. a message `id`) pass through; we only enforce the shapes we rely on.
const chatBodySchema = z.looseObject({
  messages: z.array(
    z.looseObject({
      role: z.string(),
      content: z.union([z.string(), z.array(z.unknown())]).optional()
    })
  ),
  provider: z.string(),
  model: z.string(),
  baseUrl: z.string().optional(),
  mode: z.string().optional(),
  stage: z.string().default(""),
  roleplayHistory: z.array(z.unknown()).optional()
})

export async function POST(req: Request) {
  try {
    let rawBody: unknown
    try {
      rawBody = await req.json()
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 })
    }

    const parsed = chatBodySchema.safeParse(rawBody)
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400 })
    }
    const { messages, provider, model, baseUrl, mode, stage, roleplayHistory } = parsed.data
    // [SECURITY: BYOK (Bring Your Own Key) & No Persistence]
    // The API key is passed via the Authorization header and used purely in-memory.
    // It is never written to console logs, and never persisted to a database.
    const authHeader = req.headers.get("Authorization")
    const byokKey = authHeader?.replace("Bearer ", "")

    let apiKey = byokKey
    if (mode === "demo") {
      apiKey = provider === "mimo" ? process.env.MIMO_API_KEY : process.env.DEEPSEEK_API_KEY
    }

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing API Key" }), { status: 401 })
    }

    // MiMo paid plans need a plan-specific base URL: demo reads it from the
    // server env, BYOK reads the user-supplied value. DeepSeek ignores it.
    const mimoBaseURL = mode === "demo" ? process.env.MIMO_API_BASE_URL : baseUrl
    const aiProvider = getProvider(provider as "mimo" | "deepseek", apiKey, mimoBaseURL)

    if (stage === "reflection") {
      const transcript = (roleplayHistory || [])
        .map((m: any) => `${m.role === "user" ? "User" : "Roleplay Partner"}: ${m.content}`)
        .join("\n")

      const lastContent = messages[messages.length - 1]?.content
      const userRequest = typeof lastContent === "string" ? lastContent : ""
      const promptText = `
Roleplay Transcript:
${transcript}

User's request:
${userRequest}
      `

      try {
        const result = await generateObject({
          model: aiProvider(model) as any,
          schema: reflectionSchema,
          system: reflectionPrompt,
          prompt: promptText
        })

        const obj = result.object
        const dimensionsSection =
          obj.dimensions && obj.dimensions.length
            ? `\n**Dimensions:**\n${obj.dimensions
                .map((d: { name: string; status: string; note: string }) => {
                  const icon = d.status === "good" ? "✅" : d.status === "needs_work" ? "⚠️" : "➖"
                  return `- ${icon} ${d.name}: ${d.note}`
                })
                .join("\n")}\n`
            : ""

        const markdown = `
### Overall Assessment: ${obj.overallStatus === "pass" ? "✅ Pass" : "⚠️ Needs Practice"}
${dimensionsSection}
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

    // Multi-Agent Pipeline Dispatch:
    // Each stage activates a specialized agent prompt to perform a distinct job.
    let systemPrompt = ""
    switch (stage) {
      case "analyzer":
        // Agent 1: Structures the user's situation without giving advice yet.
        systemPrompt = analyzerPrompt
        break
      case "coach": {
        // Agent 2: Provides concrete advice.
        // Retrieval-augmented grounding: the orchestrator LLM-selects the relevant
        // curriculum topics for this situation, then we read just those slices from
        // the social-skills-coach skill in-process.
        const last = messages[messages.length - 1]?.content
        const situation = typeof last === "string" ? last : ""
        const topics = await selectKnowledgeTopics(aiProvider(model), situation)
        systemPrompt = buildCoachPrompt(groundingFor(topics))
        break
      }
      case "roleplay":
        // Agent 3: Plays the role of the conversational partner for realistic practice.
        systemPrompt = roleplayPrompt
        break
      case "reflection":
        // Agent 4: Evaluates the roleplay transcript and provides structured feedback.
        systemPrompt = reflectionPrompt
        break
      default:
        systemPrompt = ""
        break
    }

    const coreMessages = messages.map((m: any) => {
      if (m.experimental_attachments && m.experimental_attachments.length > 0) {
        const parts: any[] = [{ type: "text", text: m.content }]

        m.experimental_attachments.forEach((att: any) => {
          if (att.contentType.startsWith("image/")) {
            parts.push({ type: "image", image: att.url })
          } else if (
            att.contentType.startsWith("text/") ||
            att.name.endsWith(".md") ||
            att.name.endsWith(".txt") ||
            att.name.endsWith(".csv")
          ) {
            const base64Data = att.url.split(",")[1] || att.url
            const textContent = Buffer.from(base64Data, "base64").toString("utf-8")
            parts.push({
              type: "text",
              text: `\n\n--- Attachment: ${att.name} ---\n${textContent}\n--- End Attachment ---`
            })
          } else {
            // For pdf or docs, try passing as file or just text placeholder
            const base64Data = att.url.split(",")[1] || att.url
            parts.push({ type: "file", data: base64Data, mimeType: att.contentType })
          }
        })
        return { role: m.role, content: parts }
      }
      return {
        role: m.role,
        content: m.content
      }
    })

    const result = streamText({
      model: aiProvider(model),
      system: systemPrompt,
      messages: coreMessages,
      onError: ({ error }) => {
        console.error("STREAM_ERROR", String((error as Error)?.message ?? error))
      }
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error("Chat API Error:", error)
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 })
  }
}
