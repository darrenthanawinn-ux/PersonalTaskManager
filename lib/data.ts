import type { AppData, LedgerEntry, Project, Task } from "./types"

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(s / 3600)
  const minutes = Math.floor((s % 3600) / 60)
  const seconds = s % 60
  const pad = (n: number) => String(n).padStart(2, "0")
  return hours > 0 ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`
}

const seedTasks: Task[] = [
  {
    id: "task_seed_1",
    title: "Ship v2 onboarding flow",
    quadrant: "high-impact",
    subtasks: [
      { id: "st_1", label: "Wire up analytics events", done: true },
      { id: "st_2", label: "A/B test welcome copy", done: false },
      { id: "st_3", label: "QA on mobile", done: false },
    ],
    durationMinutes: 120,
    trackedSeconds: 1840,
    completed: false,
    createdAt: Date.now() - 86400000,
  },
  {
    id: "task_seed_2",
    title: "Reply to design feedback",
    quadrant: "quick-tasks",
    subtasks: [],
    durationMinutes: 15,
    trackedSeconds: 0,
    completed: false,
    createdAt: Date.now() - 3600000,
  },
  {
    id: "task_seed_3",
    title: "Rotate API secrets",
    quadrant: "maintenance",
    subtasks: [{ id: "st_4", label: "Update Vercel env vars", done: false }],
    durationMinutes: 30,
    trackedSeconds: 0,
    completed: false,
    createdAt: Date.now() - 7200000,
  },
  {
    id: "task_seed_4",
    title: "Contractor: landing page illustration",
    quadrant: "delegated",
    subtasks: [],
    durationMinutes: 0,
    trackedSeconds: 0,
    completed: false,
    createdAt: Date.now() - 172800000,
  },
]

const seedProjects: Project[] = [
  {
    id: "proj_seed_1",
    name: "Aurora Analytics",
    description: "Real-time product analytics dashboard for indie makers.",
    deploymentUrl: "https://aurora.example.com",
    repoStatus: "in-progress",
    phase: 65,
    createdAt: Date.now() - 604800000,
  },
  {
    id: "proj_seed_2",
    name: "Ledgerly",
    description: "Invoicing + payout tracking micro-SaaS.",
    deploymentUrl: "https://ledgerly.example.com",
    repoStatus: "shipped",
    phase: 100,
    createdAt: Date.now() - 1209600000,
  },
]

const seedLedger: LedgerEntry[] = [
  { id: "led_1", label: "Aurora — Q3 retainer", amount: 4500, status: "paid", createdAt: Date.now() - 500000000 },
  { id: "led_2", label: "Ledgerly — launch build", amount: 8200, status: "invoiced", createdAt: Date.now() - 200000000 },
  { id: "led_3", label: "Consulting — design system", amount: 2600, status: "pending", createdAt: Date.now() - 100000000 },
]

export const seedData: AppData = {
  tasks: seedTasks,
  projects: seedProjects,
  ledger: seedLedger,
  monthlyGoal: 12000,
}
