"use client"

import { useMemo, useState } from "react"
import { Plus } from "lucide-react"
import { uid } from "@/lib/data"
import { QUADRANTS, type QuadrantId, type Task } from "@/lib/types"
import { cn } from "@/lib/utils"
import { TaskCard } from "./TaskCard"

interface MissionMatrixProps {
  tasks: Task[]
  setTasks: (updater: (prev: Task[]) => Task[]) => void
}

const quadrantAccent: Record<QuadrantId, string> = {
  "high-impact": "from-violet-500/15 border-violet-400/30",
  "quick-tasks": "from-cyan-400/15 border-cyan-400/30",
  maintenance: "from-zinc-500/10 border-white/15",
  delegated: "from-fuchsia-500/10 border-fuchsia-400/25",
}

const quadrantDot: Record<QuadrantId, string> = {
  "high-impact": "bg-violet-400",
  "quick-tasks": "bg-cyan-400",
  maintenance: "bg-zinc-400",
  delegated: "bg-fuchsia-400",
}

export function MissionMatrix({ tasks, setTasks }: MissionMatrixProps) {
  const [composing, setComposing] = useState<QuadrantId | null>(null)
  const [draft, setDraft] = useState("")

  const grouped = useMemo(() => {
    const map: Record<QuadrantId, Task[]> = {
      "high-impact": [],
      "quick-tasks": [],
      maintenance: [],
      delegated: [],
    }
    for (const task of tasks) map[task.quadrant].push(task)
    return map
  }, [tasks])

  const addTask = (quadrant: QuadrantId) => {
    const title = draft.trim()
    if (!title) return
    const durationDefaults: Record<QuadrantId, number> = {
      "high-impact": 60,
      "quick-tasks": 15,
      maintenance: 30,
      delegated: 0,
    }
    const task: Task = {
      id: uid("task"),
      title,
      quadrant,
      subtasks: [],
      durationMinutes: durationDefaults[quadrant],
      trackedSeconds: 0,
      completed: false,
      createdAt: Date.now(),
    }
    setTasks((prev) => [task, ...prev])
    setDraft("")
    setComposing(null)
  }

  const updateTask = (id: string, updater: (t: Task) => Task) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? updater(t) : t)))

  const deleteTask = (id: string) => setTasks((prev) => prev.filter((t) => t.id !== id))

  return (
    <section aria-label="Mission Matrix" className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {QUADRANTS.map((q) => {
        const list = grouped[q.id]
        const openCount = list.filter((t) => !t.completed).length
        return (
          <div
            key={q.id}
            className={cn(
              "flex flex-col rounded-2xl border bg-gradient-to-b to-transparent p-4 backdrop-blur-md",
              "bg-zinc-900/50 shadow-2xl",
              quadrantAccent[q.id],
            )}
          >
            <header className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn("size-2 rounded-full", quadrantDot[q.id])} />
                <div>
                  <h2 className="text-sm font-semibold tracking-tight">{q.title}</h2>
                  <p className="text-[11px] text-zinc-500">{q.hint}</p>
                </div>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-medium text-zinc-400">
                {openCount}
              </span>
            </header>

            <div className="flex flex-1 flex-col gap-2.5">
              {list.length === 0 && composing !== q.id && (
                <p className="rounded-xl border border-dashed border-white/10 px-3 py-6 text-center text-xs text-zinc-600">
                  No tasks here yet
                </p>
              )}

              {list.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onChange={(updater) => updateTask(task.id, updater)}
                  onDelete={() => deleteTask(task.id)}
                />
              ))}
            </div>

            {composing === q.id ? (
              <div className="mt-3 flex items-center gap-1.5">
                <input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) addTask(q.id)
                    if (e.key === "Escape") {
                      setComposing(null)
                      setDraft("")
                    }
                  }}
                  placeholder={`New ${q.title.toLowerCase()} task…`}
                  className="flex-1 rounded-lg border border-white/10 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-violet-400/50 focus:glow-violet"
                />
                <button
                  type="button"
                  onClick={() => addTask(q.id)}
                  className="rounded-lg border border-violet-400/40 bg-violet-500/20 px-3 py-2 text-sm font-medium text-violet-200 hover:bg-violet-500/30"
                >
                  Add
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setComposing(q.id)
                  setDraft("")
                }}
                className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-400 transition hover:border-violet-400/40 hover:text-violet-300"
              >
                <Plus className="size-3.5" />
                Add task
              </button>
            )}
          </div>
        )
      })}
    </section>
  )
}
