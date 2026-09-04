export type QuadrantId = "high-impact" | "quick-tasks" | "maintenance" | "delegated"

export interface Subtask {
  id: string
  label: string
  done: boolean
}

export interface Task {
  id: string
  title: string
  quadrant: QuadrantId
  subtasks: Subtask[]
  /** Estimated duration in minutes, used for the duration tag. */
  durationMinutes: number
  /** Accumulated tracked time in seconds. */
  trackedSeconds: number
  completed: boolean
  createdAt: number
}

export type RepoStatus = "planning" | "in-progress" | "shipped" | "archived"

export interface Project {
  id: string
  name: string
  description: string
  deploymentUrl: string
  repoStatus: RepoStatus
  /** 0 - 100 completion percentage. */
  phase: number
  createdAt: number
}

export type LedgerStatus = "invoiced" | "pending" | "paid"

export interface LedgerEntry {
  id: string
  label: string
  amount: number
  status: LedgerStatus
  createdAt: number
}

export interface AppData {
  tasks: Task[]
  projects: Project[]
  ledger: LedgerEntry[]
  monthlyGoal: number
}

export const QUADRANTS: {
  id: QuadrantId
  title: string
  hint: string
}[] = [
  { id: "high-impact", title: "High Impact", hint: "Do first — moves the needle" },
  { id: "quick-tasks", title: "Quick Tasks", hint: "Under 30 minutes" },
  { id: "maintenance", title: "Maintenance", hint: "Keep the lights on" },
  { id: "delegated", title: "Delegated", hint: "Assigned or waiting" },
]
