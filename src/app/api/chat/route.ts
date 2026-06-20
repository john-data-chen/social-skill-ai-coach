import { streamText } from "ai"

import { getProvider } from "@/lib/ai"

export async function POST(req: Request) {
  try {
    const { messages, provider, model, mode } = await req.json()
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

    // TODO: In Task 5, we will inject system prompts based on the requested agent.
    const result = await streamText({
      model: aiProvider(model),
      messages
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error("Chat API Error:", error)
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 })
  }
}
