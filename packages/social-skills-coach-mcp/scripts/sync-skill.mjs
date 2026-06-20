// Copy the canonical Agent Skill (single source of truth at the repo root) into the
// package so it ships with the npm tarball. Run as part of `build`/`prepack`.
import { cpSync, rmSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const here = dirname(fileURLToPath(import.meta.url))
const src = join(here, "..", "..", "..", "skills", "social-skills-coach")
const dest = join(here, "..", "skill")

rmSync(dest, { recursive: true, force: true })
cpSync(src, dest, { recursive: true })
console.log(`[sync-skill] copied ${src} -> ${dest}`)
