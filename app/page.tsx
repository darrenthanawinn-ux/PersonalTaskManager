"use client"

import { useState } from "react"
import { CommandPalette, type ViewId } from "@/components/CommandPalette"
import { DashboardHeader } from "@/components/DashboardHeader"
import { MissionMatrix } from "@/components/MissionMatrix"
import { ProjectVault } from "@/components/ProjectVault"
import { RevenueLedger } from "@/components/RevenueLedger"
import { exportJson, importJson, useLocalStorage } from "@/hooks/useLocalStorage"
import { seedData, uid } from "@/lib/data"
import type { AppData, LedgerEntry, Project, QuadrantId, Task } from "@/lib/types"

const STORAGE_KEY = "mission-control:v1"

export default function DashboardPage() {
  const [data, setData, hydrated] = useLocalStorage<AppData>(STORAGE_KEY, seedData)
  const [view, setView] = useState<ViewId>("all")
  const [paletteOpen, setPaletteOpen] = useState(false)

  const setTasks = (updater: (prev: Task[]) => Task[]) =>
    setData((prev) => ({ ...prev, tasks: updater(prev.tasks) }))
  const setProjects = (updater: (prev: Project[]) => Project[]) =>
    setData((prev) => ({ ...prev, projects: updater(prev.projects) }))
  const setLedger = (updater: (prev: LedgerEntry[]) => LedgerEntry[]) =>
    setData((prev) => ({ ...prev, ledger: updater(prev.ledger) }))
  const setMonthlyGoal = (value: number) => setData((prev) => ({ ...prev, monthlyGoal: value }))

  const createTask = (title: string, quadrant: QuadrantId) => {
    const task: Task = {
      id: uid("task"),
      title,
      quadrant,
      subtasks: [],
      durationMinutes: quadrant === "quick-tasks" ? 15 : quadrant === "high-impact" ? 60 : 30,
      trackedSeconds: 0,
      completed: false,
      createdAt: Date.now(),
    }
    setTasks((prev) => [task, ...prev])
    setView((v) => (v === "ledger" || v === "vault" ? "matrix" : v))
  }

  const handleImport = async (file: File) => {
    try {
      const parsed = await importJson<Partial<AppData>>(file)
      setData((prev) => ({
        tasks: Array.isArray(parsed.tasks) ? parsed.tasks : prev.tasks,
        projects: Array.isArray(parsed.projects) ? parsed.projects : prev.projects,
        ledger: Array.isArray(parsed.ledger) ? parsed.ledger : prev.ledger,
        monthlyGoal: typeof parsed.monthlyGoal === "number" ? parsed.monthlyGoal : prev.monthlyGoal,
      }))
    } catch {
      // importJson already logs; malformed files are ignored to keep state intact.
    }
  }

  const showMatrix = view === "all" || view === "matrix"
  const showLedger = view === "all" || view === "ledger"
  const showVault = view === "all" || view === "vault"

  return (
    <div className="min-h-screen">
      {/* Ambient neon backdrop */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 size-96 rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 size-96 rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      <div className="relative">
        <DashboardHeader
          view={view}
          onViewChange={setView}
          onOpenPalette={() => setPaletteOpen(true)}
          onExport={() => exportJson(data)}
          onImportFile={handleImport}
        />

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          {!hydrated ? (
            <div className="flex items-center justify-center py-32 text-sm text-zinc-600">
              Loading your workspace…
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {showMatrix && (
                <div className={showLedger || showVault ? "lg:col-span-2" : "lg:col-span-3"}>
                  <MissionMatrix tasks={data.tasks} setTasks={setTasks} />
                </div>
              )}

              {(showLedger || showVault) && (
                <div className={showMatrix ? "space-y-6 lg:col-span-1" : "lg:col-span-3"}>
                  {showLedger && (
                    <RevenueLedger
                      ledger={data.ledger}
                      setLedger={setLedger}
                      monthlyGoal={data.monthlyGoal}
                      setMonthlyGoal={setMonthlyGoal}
                    />
                  )}
                  {showVault && !showMatrix && (
                    <div className="mt-6">
                      <ProjectVault projects={data.projects} setProjects={setProjects} />
                    </div>
                  )}
                </div>
              )}

              {showVault && showMatrix && (
                <div className="lg:col-span-3">
                  <ProjectVault projects={data.projects} setProjects={setProjects} />
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        onCreateTask={createTask}
        onNavigate={setView}
      />
    </div>
  )
}
