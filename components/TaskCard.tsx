"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Clock, Pause, Play, Plus, RotateCcw, Trash2, X } from "lucide-react"
import { formatClock, uid } from "@/lib/data"
import type { Subtask, Task } from "@/lib/types"
import { cn } from "@/lib/utils"

interface TaskCardProps {
  task: Task
  onChange: (updater: (task: Task) => Task) => void
  onDelete: () => void
}

export function TaskCard({ task, onChange, onDelete }: TaskCardProps) {
  const [running, setRunning] = useState(false)
  const [draftSubtask, setDraftSubtask] = useState("")
  const [adding, setAdding] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        onChange((t) => ({ ...t, trackedSeconds: t.trackedSeconds + 1 }))
      }, 1000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running, onChange])

  const doneCount = task.subtasks.filter((s) => s.done).length
  const progress = task.subtasks.length ? Math.round((doneCount / task.subtasks.length) * 100) : 0

  const toggleSubtask = (id: string) =>
    onChange((t) => ({
      ...t,
      subtasks: t.subtasks.map((s) => (s.id === id ? { ...s, done: !s.done } : s)),
    }))

  const removeSubtask = (id: string) =>
    onChange((t) => ({ ...t, subtasks: t.subtasks.filter((s) => s.id !== id) }))

  const addSubtask = () => {
    const label = draftSubtask.trim()
    if (!label) return
    const next: Subtask = { id: uid("st"), label, done: false }
    onChange((t) => ({ ...t, subtasks: [...t.subtasks, next] }))
    setDraftSubtask("")
  }

  return (
    <div
      className={cn(
        "group animate-fade-rise rounded-xl border border-white/10 bg-zinc-950/60 p-3 transition",
        "hover:border-violet-400/40 hover:bg-zinc-900/70",
        task.completed && "opacity-55",
      )}
    >
      <div className="flex items-start gap-2.5">
        <button
          type="button"
          onClick={() => onChange((t) => ({ ...t, completed: !t.completed }))}
          aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
          className={cn(
            "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition",
            task.completed
              ? "border-cyan-400/60 bg-cyan-400/20 text-cyan-300 glow-cyan"
              : "border-white/20 text-transparent hover:border-cyan-400/50",
          )}
        >
          <Check className="size-3.5" strokeWidth={3} />
        </button>

        <div className="min-w-0 flex-1">
          <p className={cn("text-sm font-medium leading-snug text-pretty", task.completed && "line-through")}>
            {task.title}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {task.durationMinutes > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md border border-violet-400/25 bg-violet-500/10 px-1.5 py-0.5 text-[11px] font-medium text-violet-300">
                <Clock className="size-3" />
                {task.durationMinutes}m
              </span>
            )}
            {task.subtasks.length > 0 && (
              <span className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[11px] font-medium text-zinc-400">
                {doneCount}/{task.subtasks.length}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete task"
          className="rounded-md p-1 text-zinc-600 opacity-0 transition hover:bg-white/5 hover:text-red-400 group-hover:opacity-100"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      {/* Subtask checklist */}
      {task.subtasks.length > 0 && (
        <div className="mt-3 space-y-1">
          {task.subtasks.length > 0 && (
            <div className="mb-2 h-1 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          {task.subtasks.map((sub) => (
            <div key={sub.id} className="group/sub flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleSubtask(sub.id)}
                aria-label={sub.done ? "Uncheck subtask" : "Check subtask"}
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded border transition",
                  sub.done ? "border-cyan-400/50 bg-cyan-400/15 text-cyan-300" : "border-white/15 text-transparent",
                )}
              >
                <Check className="size-2.5" strokeWidth={3} />
              </button>
              <span className={cn("flex-1 text-xs text-zinc-400", sub.done && "text-zinc-600 line-through")}>
                {sub.label}
              </span>
              <button
                type="button"
                onClick={() => removeSubtask(sub.id)}
                aria-label="Remove subtask"
                className="p-0.5 text-zinc-700 opacity-0 transition hover:text-red-400 group-hover/sub:opacity-100"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add subtask */}
      {adding ? (
        <div className="mt-2 flex items-center gap-1.5">
          <input
            autoFocus
            value={draftSubtask}
            onChange={(e) => setDraftSubtask(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) addSubtask()
              if (e.key === "Escape") setAdding(false)
            }}
            placeholder="Subtask…"
            className="flex-1 rounded-md border border-white/10 bg-zinc-900/80 px-2 py-1 text-xs text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-violet-400/50"
          />
          <button
            type="button"
            onClick={addSubtask}
            className="rounded-md border border-violet-400/30 bg-violet-500/15 p-1 text-violet-300 hover:bg-violet-500/25"
            aria-label="Confirm subtask"
          >
            <Check className="size-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 transition hover:text-violet-300"
        >
          <Plus className="size-3" />
          Add subtask
        </button>
      )}

      {/* Timer */}
      <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2.5">
        <span
          className={cn(
            "font-mono text-sm tabular-nums",
            running ? "text-cyan-300 text-glow-violet" : "text-zinc-400",
          )}
        >
          {formatClock(task.trackedSeconds)}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            aria-label={running ? "Pause timer" : "Start timer"}
            className={cn(
              "flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium transition",
              running
                ? "border-cyan-400/40 bg-cyan-400/15 text-cyan-300"
                : "border-white/10 bg-white/5 text-zinc-300 hover:border-violet-400/40 hover:text-violet-300",
            )}
          >
            {running ? <Pause className="size-3" /> : <Play className="size-3" />}
            {running ? "Pause" : "Track"}
          </button>
          <button
            type="button"
            onClick={() => {
              setRunning(false)
              onChange((t) => ({ ...t, trackedSeconds: 0 }))
            }}
            aria-label="Reset timer"
            className="rounded-md border border-white/10 bg-white/5 p-1 text-zinc-500 transition hover:text-zinc-200"
          >
            <RotateCcw className="size-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
