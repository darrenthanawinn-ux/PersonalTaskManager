"use client"

import { useMemo, useState } from "react"
import { Plus, Trash2, TrendingUp } from "lucide-react"
import { formatCurrency, uid } from "@/lib/data"
import type { LedgerEntry, LedgerStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

interface RevenueLedgerProps {
  ledger: LedgerEntry[]
  setLedger: (updater: (prev: LedgerEntry[]) => LedgerEntry[]) => void
  monthlyGoal: number
  setMonthlyGoal: (value: number) => void
}

const statusStyles: Record<LedgerStatus, string> = {
  paid: "border-cyan-400/40 bg-cyan-400/10 text-cyan-300",
  invoiced: "border-violet-400/40 bg-violet-500/10 text-violet-300",
  pending: "border-amber-400/40 bg-amber-400/10 text-amber-300",
}

const statusCycle: Record<LedgerStatus, LedgerStatus> = {
  pending: "invoiced",
  invoiced: "paid",
  paid: "pending",
}

export function RevenueLedger({ ledger, setLedger, monthlyGoal, setMonthlyGoal }: RevenueLedgerProps) {
  const [label, setLabel] = useState("")
  const [amount, setAmount] = useState("")

  const { paid, pending, invoiced } = useMemo(() => {
    return ledger.reduce(
      (acc, e) => {
        acc[e.status] += e.amount
        return acc
      },
      { paid: 0, pending: 0, invoiced: 0 } as Record<LedgerStatus, number>,
    )
  }, [ledger])

  const goalPct = monthlyGoal > 0 ? Math.min(100, Math.round((paid / monthlyGoal) * 100)) : 0

  const addEntry = () => {
    const value = Number.parseFloat(amount)
    if (!label.trim() || !Number.isFinite(value) || value <= 0) return
    const entry: LedgerEntry = {
      id: uid("led"),
      label: label.trim(),
      amount: Math.round(value),
      status: "pending",
      createdAt: Date.now(),
    }
    setLedger((prev) => [entry, ...prev])
    setLabel("")
    setAmount("")
  }

  return (
    <section
      aria-label="Financial Ledger"
      className="flex flex-col rounded-2xl border border-white/10 bg-zinc-900/50 p-5 shadow-2xl backdrop-blur-md"
    >
      <header className="mb-4 flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 glow-cyan">
          <TrendingUp className="size-4" />
        </span>
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Financial Ledger</h2>
          <p className="text-[11px] text-zinc-500">Invoices, payouts & milestones</p>
        </div>
      </header>

      {/* Monthly goal progress */}
      <div className="mb-4 rounded-xl border border-white/10 bg-zinc-950/50 p-4">
        <div className="mb-2 flex items-end justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-zinc-500">Monthly milestone</p>
            <p className="font-mono text-lg font-semibold text-cyan-300 tabular-nums">
              {formatCurrency(paid)}
              <span className="ml-1 text-xs font-normal text-zinc-500">/ {formatCurrency(monthlyGoal)}</span>
            </p>
          </div>
          <span className="font-mono text-sm text-zinc-400">{goalPct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 transition-all"
            style={{ width: `${goalPct}%` }}
          />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <label htmlFor="goal" className="text-[11px] text-zinc-500">
            Goal
          </label>
          <input
            id="goal"
            type="number"
            min={0}
            value={monthlyGoal}
            onChange={(e) => setMonthlyGoal(Math.max(0, Number.parseInt(e.target.value || "0", 10)))}
            className="w-28 rounded-md border border-white/10 bg-zinc-900/80 px-2 py-1 font-mono text-xs text-zinc-200 outline-none focus:border-cyan-400/50"
          />
        </div>
      </div>

      {/* Summary stats */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        {[
          { label: "Paid", value: paid, tone: "text-cyan-300" },
          { label: "Invoiced", value: invoiced, tone: "text-violet-300" },
          { label: "Pending", value: pending, tone: "text-amber-300" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-white/10 bg-zinc-950/40 p-2.5">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">{s.label}</p>
            <p className={cn("mt-0.5 font-mono text-sm font-semibold tabular-nums", s.tone)}>
              {formatCurrency(s.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Entries */}
      <div className="flex flex-col gap-2">
        {ledger.length === 0 && (
          <p className="rounded-xl border border-dashed border-white/10 px-3 py-6 text-center text-xs text-zinc-600">
            No ledger entries yet
          </p>
        )}
        {ledger.map((entry) => (
          <div
            key={entry.id}
            className="group flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-950/50 px-3 py-2.5"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-zinc-200">{entry.label}</p>
              <button
                type="button"
                onClick={() =>
                  setLedger((prev) =>
                    prev.map((e) => (e.id === entry.id ? { ...e, status: statusCycle[e.status] } : e)),
                  )
                }
                className={cn(
                  "mt-1 inline-flex rounded-md border px-1.5 py-0.5 text-[10px] font-medium capitalize transition",
                  statusStyles[entry.status],
                )}
              >
                {entry.status}
              </button>
            </div>
            <span className="font-mono text-sm font-semibold tabular-nums text-zinc-100">
              {formatCurrency(entry.amount)}
            </span>
            <button
              type="button"
              onClick={() => setLedger((prev) => prev.filter((e) => e.id !== entry.id))}
              aria-label="Delete entry"
              className="rounded-md p-1 text-zinc-600 opacity-0 transition hover:text-red-400 group-hover:opacity-100"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Add entry */}
      <div className="mt-4 flex items-center gap-2">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) addEntry()
          }}
          placeholder="Invoice label…"
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-cyan-400/50"
        />
        <input
          type="number"
          min={0}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) addEntry()
          }}
          placeholder="$"
          className="w-24 rounded-lg border border-white/10 bg-zinc-950/80 px-3 py-2 font-mono text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-cyan-400/50"
        />
        <button
          type="button"
          onClick={addEntry}
          aria-label="Add ledger entry"
          className="flex items-center justify-center rounded-lg border border-cyan-400/40 bg-cyan-400/15 p-2 text-cyan-300 transition hover:bg-cyan-400/25"
        >
          <Plus className="size-4" />
        </button>
      </div>
    </section>
  )
}
