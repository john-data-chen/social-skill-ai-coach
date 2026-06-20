"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { useAppStore, type AppState } from "@/lib/store"

const MODE_LABELS: Record<string, string> = {
  demo: "Demo (Server Key)",
  byok: "BYOK (Bring Your Own Key)"
}

const PROVIDER_LABELS: Record<string, string> = {
  mimo: "Xiaomi MiMo",
  deepseek: "DeepSeek"
}

const MODELS: Record<string, string[]> = {
  mimo: ["mimo-v2.5-pro", "mimo-v2.5"],
  deepseek: ["deepseek-v4-pro", "deepseek-v4-flash"]
}

export function Settings() {
  const store = useAppStore()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Partial<AppState>>({})

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      let draftModel = store.model
      const allowedModels = MODELS[store.provider] || MODELS["mimo"]!
      if (!allowedModels.includes(draftModel)) {
        draftModel = allowedModels[0]!
      }
      setDraft({
        mode: store.mode,
        provider: store.provider,
        model: draftModel,
        apiKey: store.apiKey,
        baseUrl: store.baseUrl
      })
    }
    setOpen(isOpen)
  }

  const handleConfirm = () => {
    store.setConfig(draft)
    setOpen(false)
  }

  const handleCancel = () => {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
        Settings
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>AI Provider Settings</DialogTitle>
          <DialogDescription>
            Configure your AI provider. Your API key is stored only in this browser tab&apos;s
            session memory and is never logged on our servers.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="mode" className="text-right">
              Mode
            </Label>
            <Select
              value={draft.mode}
              onValueChange={(val) => {
                setDraft((prev) => ({ ...prev, mode: val as any }))
              }}
            >
              <SelectTrigger className="col-span-3 w-full">
                <SelectValue placeholder="Select mode">
                  {(v: any) => (v ? MODE_LABELS[v as string] : null)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="demo">Demo (Server Key)</SelectItem>
                <SelectItem value="byok">BYOK (Bring Your Own Key)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="provider" className="text-right">
              Provider
            </Label>
            <Select
              value={draft.provider}
              onValueChange={(val) => {
                const newProvider = val as "mimo" | "deepseek"
                setDraft((prev) => ({
                  ...prev,
                  provider: newProvider,
                  model: MODELS[newProvider]![0] as string
                }))
              }}
            >
              <SelectTrigger className="col-span-3 w-full">
                <SelectValue placeholder="Select provider">
                  {(v: any) => (v ? PROVIDER_LABELS[v as string] : null)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mimo">Xiaomi MiMo</SelectItem>
                <SelectItem value="deepseek">DeepSeek</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="model" className="text-right">
              Model ID
            </Label>
            <Select
              value={draft.model}
              onValueChange={(val) => {
                setDraft((prev) => ({ ...prev, model: val as string }))
              }}
            >
              <SelectTrigger className="col-span-3 w-full">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {(MODELS[draft.provider as string] || MODELS["mimo"]!).map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {draft.mode === "byok" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="apiKey" className="text-right">
                API Key
              </Label>
              <Input
                id="apiKey"
                type="password"
                value={draft.apiKey || ""}
                onChange={(e) => {
                  setDraft((prev) => ({ ...prev, apiKey: e.target.value }))
                }}
                className="col-span-3"
                placeholder="sk-..."
              />
            </div>
          )}

          {draft.mode === "byok" && draft.provider === "mimo" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="baseUrl" className="text-right">
                Base URL
              </Label>
              <Input
                id="baseUrl"
                value={draft.baseUrl || ""}
                onChange={(e) => {
                  setDraft((prev) => ({ ...prev, baseUrl: e.target.value }))
                }}
                className="col-span-3"
                placeholder="Mimo token plan only — e.g. https://token-plan-cn.xiaomimimo.com/v1"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
