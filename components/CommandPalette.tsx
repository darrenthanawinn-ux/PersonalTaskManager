"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { CornerDownLeft, LayoutGrid, ListTodo, Plus, Search, TrendingUp } from "lucide-react"
import { QUADRANTS, type QuadrantId } from "@/lib/types"
import { cn } from "@/lib/utils"

export type ViewId = "all" | "matrix" | "ledger" | "vault"

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateTask: (title: string, quadrant: QuadrantId) => void
  onNavigate: (view: ViewId) => void
}

interface CommandItem {
  id: string
  label: string
  hint: string
  icon: React.ReactNode
  run: () => void
}

export function CommandPalette({ open, onOpenChange, onCreateTask, onNavigate }: CommandPaletteProps) {
  const [query, setQuery] = useState("")
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Global CMD/CTRL+K listener.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        onOpenChange(!open)
      }
      if (e.key === "Escape") onOpenChange(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onOpenChange])

  useEffect(() => {
    if (open) {
      setQuery("")
      setActive(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  const close = () => onOpenChange(false)

  const items = useMemo<CommandItem[]>(() => {
    const trimmed = query.trim()
    const list: CommandItem[] = []

    if (trimmed) {
      for (const q of QUADRANTS) {
        list.push({
          id: `create-${q.id}`,
          label: `Create “${trimmed}”`,
          hint: `in ${q.title}`,
          icon: <Plus className="size-4" />,
          run: () => {
            onCreateTask(trimmed, q.id)
            close()
          },
        })
      }
    }

    const nav: { view: ViewId; label: string; icon: React.ReactNode }[] = [
      { view: "all", label: "Go to Dashboard", icon: <LayoutGrid className="size-4" /> },
      { view: "matrix", label: "Focus Mission Matrix", icon: <ListTodo className="size-4" /> },
      { view: "ledger", label: "Focus Financial Ledger", icon: <TrendingUp className="size-4" /> },
      { view: "vault", label: "Focus Project Vault", icon: <LayoutGrid className="size-4" /> },
    ]
    for (const n of nav) {
      list.push({
        id: `nav-${n.view}`,
        label: n.label,
        hint: "view",
        icon: n.icon,
        run: () => {
          onNavigate(n.view)
          close()
        },
      })
    }

    if (!trimmed) return list
    const lower = trimmed.toLowerCase()
    return list.filter((i) => i.id.startsWith("create-") || i.label.toLowerCase().includes(lower))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, onCreateTask, onNavigate])

  useEffect(() => {
    setActive((a) => Math.min(a, Math.max(0, items.length - 1)))
  }, [items.length])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <button
        type="button"
        aria-label="Close command palette"
        onClick={close}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-xl animate-fade-rise overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/80 shadow-2xl backdrop-blur-xl glow-violet">
        <div className="flex items-center gap-3 border-b border-white/10 px-4">
          <Search className="size-4 text-zinc-500" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault()
                setActive((a) => (a + 1) % items.length)
              } else if (e.key === "ArrowUp") {
                e.preventDefault()
                setActive((a) => (a - 1 + items.length) % items.length)
              } else if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                e.preventDefault()
                items[active]?.run()
              }
            }}
            placeholder="Type a task, or search commands…"
            className="w-full bg-transparent py-4 text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
          />
          <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">
            ESC
          </kbd>
        </div>

        <ul className="max-h-80 overflow-y-auto p-2">
          {items.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-zinc-600">No matching commands</li>
          )}
          {items.map((item, index) => (
            <li key={item.id}>
              <button
                type="button"
                onMouseEnter={() => setActive(index)}
                onClick={() => item.run()}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition",
                  active === index ? "bg-violet-500/15 text-violet-100" : "text-zinc-300 hover:bg-white/5",
                )}
              >
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-md border",
                    active === index
                      ? "border-violet-400/40 bg-violet-500/20 text-violet-200"
                      : "border-white/10 bg-white/5 text-zinc-400",
                  )}
                >
                  {item.icon}
                </span>
                <span className="flex-1 text-sm">{item.label}</span>
                <span className="text-[11px] text-zinc-500">{item.hint}</span>
                {active === index && <CornerDownLeft className="size-3.5 text-zinc-500" />}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
