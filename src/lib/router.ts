import type { Stage } from "./store"

export function advancePipeline(stage: Stage): Stage {
  switch (stage) {
    case "analyzer":
      return "coach"
    case "coach":
      return "roleplay"
    case "roleplay":
      return "reflection"
    case "reflection":
      return "analyzer"
    default:
      return "analyzer"
  }
}

export function determineNextStage(currentStage: Stage, userInput: string): Stage {
  // Empty intent -> strictly next stage in pipeline
  if (!userInput || userInput.trim() === "") {
    return advancePipeline(currentStage)
  }

  const input = userInput.trim().toLowerCase()

  // Strong intent to jump to Roleplay
  if (
    input.startsWith("let's roleplay") ||
    input.startsWith("i want to practice") ||
    input === "roleplay" ||
    input.includes("skip to roleplay") ||
    input.includes("practice directly")
  ) {
    return "roleplay"
  }

  // Strong intent to jump to Reflection
  if (
    input.startsWith("review me") ||
    input.startsWith("give me feedback") ||
    input === "reflect" ||
    input.includes("skip to review") ||
    input.includes("evaluate me")
  ) {
    return "reflection"
  }

  // Strong intent to jump to Coach
  if (input.startsWith("give me advice") || input.includes("skip to coach") || input === "coach") {
    return "coach"
  }

  // Strong intent to jump to Analyzer
  if (input.includes("start over") || input.includes("new situation") || input === "analyze") {
    return "analyzer"
  }

  // Default: remain in the current stage to continue the conversation
  return currentStage
}
