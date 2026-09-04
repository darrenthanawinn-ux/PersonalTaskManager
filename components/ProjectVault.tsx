"use client"

import { useState } from "react"
import { ExternalLink, FolderGit2, Plus, Trash2, X } from "lucide-react"
import { uid } from "@/lib/data"
import type { Project, RepoStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ProjectVaultProps {
  projects: Project[]
  setProjects: (updater: (prev: Project[]) => Project[]) => void
}

const repoStatusStyles: Record<RepoStatus, string> = {
  planning: "border-zinc-400/30 bg-zinc-400/10 text-zinc-300",
  "in-progress": "border-violet-400/40 bg-violet-500/10 text-violet-300",
  shipped: "border-cyan-400/40 bg-cyan-400/10 text-cyan-300",
  archived: "border-white/10 bg-white/5 text-zinc-500",
}

const repoStatusCycle: Record<RepoStatus, RepoStatus> = {
  planning: "in-progress",
  "in-progress": "shipped",
  shipped: "archived",
  archived: "planning",
}

const emptyForm = { name: "", description: "", deploymentUrl: "" }

export function ProjectVault({ projects, setProjects }: ProjectVaultProps) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const addProject = () => {
    if (!form.name.trim()) return
    const project: Project = {
      id: uid("proj"),
      name: form.name.trim(),
      description: form.description.trim(),
      deploymentUrl: form.deploymentUrl.trim(),
      repoStatus: "planning",
      phase: 0,
      createdAt: Date.now(),
    }
    setProjects((prev) => [project, ...prev])
    setForm(emptyForm)
    setShowForm(false)
  }

  const update = (id: string, patch: Partial<Project>) =>
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))

  return (
    <section
      aria-label="Project Vault"
      className="flex flex-col rounded-2xl border border-white/10 bg-zinc-900/50 p-5 shadow-2xl backdrop-blur-md"
    >
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg border border-violet-400/30 bg-violet-500/10 text-violet-300 glow-violet">
            <FolderGit2 className="size-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold tracking-tight">Project Vault</h2>
            <p className="text-[11px] text-zinc-500">Active digital ventures</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((s) => !s)}
          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-violet-400/40 hover:text-violet-300"
        >
          {showForm ? <X className="size-3.5" /> : <Plus className="size-3.5" />}
          {showForm ? "Close" : "New"}
        </button>
      </header>

      {showForm && (
        <div className="mb-4 animate-fade-rise space-y-2 rounded-xl border border-violet-400/20 bg-zinc-950/60 p-3">
          <input
            autoFocus
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Project name"
            className="w-full rounded-lg border border-white/10 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-violet-400/50"
          />
          <input
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Short description"
            className="w-full rounded-lg border border-white/10 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-violet-400/50"
          />
          <input
            value={form.deploymentUrl}
            onChange={(e) => setForm((f) => ({ ...f, deploymentUrl: e.target.value }))}
            placeholder="https://deployment-url.com"
            className="w-full rounded-lg border border-white/10 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-violet-400/50"
          />
          <button
            type="button"
            onClick={addProject}
            className="w-full rounded-lg border border-violet-400/40 bg-violet-500/20 px-3 py-2 text-sm font-medium text-violet-200 transition hover:bg-violet-500/30"
          >
            Add to vault
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {projects.length === 0 && (
          <p className="col-span-full rounded-xl border border-dashed border-white/10 px-3 py-6 text-center text-xs text-zinc-600">
            The vault is empty — add your first venture
          </p>
        )}
        {projects.map((project) => (
          <article
            key={project.id}
            className="group flex flex-col rounded-xl border border-white/10 bg-zinc-950/50 p-4 transition hover:border-violet-400/40"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold leading-tight text-pretty">{project.name}</h3>
              <button
                type="button"
                onClick={() => setProjects((prev) => prev.filter((p) => p.id !== project.id))}
                aria-label="Delete project"
                className="rounded-md p-1 text-zinc-600 opacity-0 transition hover:text-red-400 group-hover:opacity-100"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>

            {project.description && (
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-500">{project.description}</p>
            )}

            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => update(project.id, { repoStatus: repoStatusCycle[project.repoStatus] })}
                className={cn(
                  "rounded-md border px-1.5 py-0.5 text-[10px] font-medium capitalize transition",
                  repoStatusStyles[project.repoStatus],
                )}
              >
                {project.repoStatus.replace("-", " ")}
              </button>
              {project.deploymentUrl && (
                <a
                  href={project.deploymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 truncate text-[11px] text-cyan-400 hover:text-cyan-300"
                >
                  <ExternalLink className="size-3 shrink-0" />
                  <span className="truncate">Live</span>
                </a>
              )}
            </div>

            {/* Completion phase */}
            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500">Phase</span>
                <span className="font-mono text-[11px] text-zinc-400">{project.phase}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
                  style={{ width: `${project.phase}%` }}
                />
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={project.phase}
                onChange={(e) => update(project.id, { phase: Number.parseInt(e.target.value, 10) })}
                aria-label={`${project.name} completion phase`}
                className="mt-2 w-full accent-violet-500"
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
