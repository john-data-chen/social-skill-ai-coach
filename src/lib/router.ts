import type { Stage } from "./store"

/**
 * Stage navigation — explicit commands only.
 *
 * Navigate by clicking a tab or typing a slash command anywhere in the message:
 * /analyzer (or /analyze), /coach, /roleplay (or /role-play), /reflect (or /reflection).
 * Detected even mid- or end-of-sentence, e.g. "let's practice /roleplay". We never advance on
 * empty input or guess from prose — both navigated by accident with no undo.
 */
const STAGE_COMMANDS: Record<string, Stage> = {
  "/analyzer": "analyzer",
  "/analyze": "analyzer",
  "/coach": "coach",
  "/roleplay": "roleplay",
  "/role-play": "roleplay",
  "/reflect": "reflection",
  "/reflection": "reflection"
}

// Whole-token match of any command (longest alternative first so "/role-play" beats "/roleplay",
// "/reflection" beats "/reflect", etc.); the trailing lookahead stops "/coaching" or "/analyzer"
// from matching the shorter "/coach" / "/analyze".
const COMMAND_PATTERN = `(?:${Object.keys(STAGE_COMMANDS)
  .sort((a, b) => b.length - a.length)
  .join("|")})(?![\\w-])`

export interface StageCommand {
  /** Destination stage. */
  stage: Stage
  /**
   * The message with all command tokens removed (whitespace collapsed, trimmed). Empty when the
   * message was only the command — then the jump is pure navigation.
   */
  rest: string
}

/**
 * Parse a stage slash command from anywhere in the input. Returns the destination stage plus the
 * leftover message (so callers can hand it straight to the destination agent), or null when no
 * command is present. If several commands appear, the earliest in the text decides the stage.
 */
export function parseStageCommand(userInput: string): StageCommand | null {
  const matches = userInput.match(new RegExp(COMMAND_PATTERN, "gi"))
  const first = matches?.[0]
  if (!first) {
    return null
  }
  const stage = STAGE_COMMANDS[first.toLowerCase()]
  if (!stage) {
    return null
  }
  const rest = userInput.replace(new RegExp(COMMAND_PATTERN, "gi"), " ").replace(/\s+/g, " ").trim()
  return { stage, rest }
}
