"use client"

import { useState } from "react"
import { History, Loader2, AlertCircle, UserCheck, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useEmployeeHistory } from "@/services/hooks/employees/useEmployees"
import type { EmployeeHistoryChange, EmployeeHistoryEntry } from "@/types/employees/employee-management"

interface EmployeeHistoryTimelineProps {
  employeeId?: string | null
  enabled?: boolean
}

const formatDisplayValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "—"
  if (typeof value === "boolean") return value ? "Yes" : "No"
  if (typeof value === "object") {
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }
  return String(value)
}

const formatFieldLabel = (field: string, explicitLabel?: string): string => {
  if (explicitLabel) return explicitLabel
  return field
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (ch) => ch.toUpperCase())
}

const normalizeChanges = (entry: EmployeeHistoryEntry): EmployeeHistoryChange[] => {
  const raw = entry.changes
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  if (typeof raw === "object") {
    return Object.entries(raw).map(([field, diff]) => ({
      field,
      label: diff?.label,
      old_value: diff?.old_value ?? diff?.old,
      new_value: diff?.new_value ?? diff?.new,
    }))
  }
  return []
}

const resolveActorLabel = (entry: EmployeeHistoryEntry): string => {
  const actor = entry.changed_by ?? entry.updated_by ?? entry.actor
  if (typeof actor === "string" && actor.trim()) return actor
  if (actor && typeof actor === "object") {
    const name = actor.name || actor.email || actor.id
    if (name && actor.role) return `${name} (${actor.role})`
    if (name) return name
  }
  if (entry.actor_name) return entry.actor_name
  return "System Administrator"
}

const formatTimestamp = (entry: EmployeeHistoryEntry): string => {
  const raw = entry.created_at ?? entry.updated_at ?? entry.timestamp
  if (!raw) return "Unknown date"
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return String(raw)
  return date.toLocaleString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function EmployeeHistoryTimeline({
  employeeId,
  enabled = true,
}: EmployeeHistoryTimelineProps) {
  const [page, setPage] = useState(1)
  const limit = 20

  const { data, isLoading, isError, error, refetch, isFetching } = useEmployeeHistory(
    employeeId,
    page,
    limit,
    enabled
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin text-[#008751] mr-2" />
        <span className="text-sm">Loading update history...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50/70 p-4 text-sm text-red-700 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error?.message || "Unable to load update history."}</span>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  const entries = data?.history ?? []
  const pagination = data?.pagination

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 py-10 px-4 text-center">
        <History className="h-8 w-8 text-slate-400 mb-2" />
        <p className="text-sm font-medium text-slate-700">No update history yet</p>
        <p className="text-xs text-slate-500 mt-1">
          Changes made to this employee&apos;s record will appear here with field-level details.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          Showing {entries.length} of {pagination?.total ?? entries.length} update
          {(pagination?.total ?? entries.length) === 1 ? "" : "s"}
        </span>
        {isFetching && (
          <span className="inline-flex items-center gap-1 text-[#008751]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Refreshing
          </span>
        )}
      </div>

      <div className="relative space-y-4 pl-5 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-emerald-200">
        {entries.map((entry) => {
          const changes = normalizeChanges(entry)
          return (
            <div
              key={entry.id}
              className="relative rounded-xl border border-slate-200 bg-white p-4 shadow-2xs"
            >
              <span className="absolute -left-[18px] top-5 h-3 w-3 rounded-full border-2 border-white bg-[#008751] shadow-xs" />

              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-emerald-50 text-[#0B4628] border border-emerald-200 hover:bg-emerald-50 text-[11px] font-semibold uppercase">
                    {entry.action || "UPDATE"}
                  </Badge>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700">
                    <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                    {resolveActorLabel(entry)}
                  </span>
                </div>
                <span className="text-xs text-slate-500">{formatTimestamp(entry)}</span>
              </div>

              {entry.reason && (
                <div className="mt-2.5 rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">Reason:</span> {entry.reason}
                </div>
              )}

              {changes.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {changes.map((change, idx) => {
                    const oldVal = formatDisplayValue(change.old_value ?? change.oldValue)
                    const newVal = formatDisplayValue(change.new_value ?? change.newValue)
                    return (
                      <div
                        key={`${entry.id}-${change.field}-${idx}`}
                        className="grid grid-cols-1 sm:grid-cols-[160px_1fr] items-start gap-1.5 rounded-lg bg-slate-50/70 px-3 py-2 text-xs"
                      >
                        <span className="font-semibold text-slate-700">
                          {formatFieldLabel(change.field, change.label)}
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5 break-all">
                          <span className="rounded bg-red-50 px-1.5 py-0.5 text-red-700 line-through">
                            {oldVal}
                          </span>
                          <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-medium text-emerald-800">
                            {newVal}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="mt-2.5 text-xs text-slate-500 italic">
                  Record updated (no field-level diff attached).
                </p>
              )}
            </div>
          )
        })}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-xs text-slate-500">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

