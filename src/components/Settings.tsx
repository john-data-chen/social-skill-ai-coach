"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function Settings() {
  const { provider, model, apiKey, mode, setConfig } = useAppStore();

  useEffect(() => {
    if (model === "gpt-4o") {
      setConfig({ model: provider === "mimo" ? "mimo-v2.5-pro" : "deepseek-v4-pro" });
    }
  }, [model, provider, setConfig]);

  return (
    <Dialog>
      <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
        Settings
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>AI Provider Settings</DialogTitle>
          <DialogDescription>
            Configure your AI provider. Your API key is stored only in this browser tab&apos;s session memory and is never logged on our servers.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="mode" className="text-right">
              Mode
            </Label>
            <Select 
              value={mode} 
              onValueChange={(val) =>{  setConfig({ mode: val as "demo" | "byok" }); }}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select mode" />
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
              value={provider} 
              onValueChange={(val) =>{  setConfig({ provider: val as "mimo" | "deepseek", model: val === "mimo" ? "mimo-v2.5-pro" : "deepseek-v4-pro" }); }}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select provider" />
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
            <Input 
              id="model" 
              value={model} 
              onChange={(e) =>{  setConfig({ model: e.target.value }); }}
              className="col-span-3" 
            />
          </div>

          {mode === "byok" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="apiKey" className="text-right">
                API Key
              </Label>
              <Input 
                id="apiKey" 
                type="password"
                value={apiKey} 
                onChange={(e) =>{  setConfig({ apiKey: e.target.value }); }}
                className="col-span-3" 
                placeholder="sk-..."
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
