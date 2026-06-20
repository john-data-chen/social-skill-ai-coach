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
      messages: coreMessages
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error("Chat API Error:", error)
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 })
  }
}
