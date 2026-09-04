"use client"

import { useRef } from "react"
import { Command, Download, Radio, Upload } from "lucide-react"
import type { ViewId } from "./CommandPalette"
import { cn } from "@/lib/utils"

interface DashboardHeaderProps {
  view: ViewId
  onViewChange: (view: ViewId) => void
  onOpenPalette: () => void
  onExport: () => void
  onImportFile: (file: File) => void
}

const tabs: { id: ViewId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "matrix", label: "Matrix" },
  { id: "ledger", label: "Ledger" },
  { id: "vault", label: "Vault" },
]

export function DashboardHeader({
  view,
  onViewChange,
  onOpenPalette,
  onExport,
  onImportFile,
}: DashboardHeaderProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-zinc-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/10 text-violet-300 glow-violet">
            <Radio className="size-5" />
          </span>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-glow-violet">Mission Control</h1>
            <p className="text-[11px] text-zinc-500">Local-first project & task OS</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <nav
            aria-label="Views"
            className="flex items-center rounded-lg border border-white/10 bg-white/5 p-0.5"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onViewChange(tab.id)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition",
                  view === tab.id ? "bg-violet-500/25 text-violet-100" : "text-zinc-400 hover:text-zinc-200",
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={onOpenPalette}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-cyan-400/40 hover:text-cyan-300"
          >
            <Command className="size-3.5" />
            <span className="hidden sm:inline">Command</span>
            <kbd className="rounded border border-white/10 bg-white/10 px-1 font-mono text-[10px] text-zinc-400">
              ⌘K
            </kbd>
          </button>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onExport}
              aria-label="Export JSON backup"
              className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 p-1.5 text-zinc-400 transition hover:border-cyan-400/40 hover:text-cyan-300"
            >
              <Download className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              aria-label="Import JSON data"
              className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 p-1.5 text-zinc-400 transition hover:border-violet-400/40 hover:text-violet-300"
            >
              <Upload className="size-4" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) onImportFile(file)
                e.target.value = ""
              }}
            />
          </div>
        </div>
      </div>
    </header>
  )
}
