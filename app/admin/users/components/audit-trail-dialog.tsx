"use client"

import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { fetchAuditEvents } from "@/services/endpoints/users/user-management"
import type { AuditEvent } from "@/types/user-management"
import { Clock, History, Search, Shield, User, FileText } from "lucide-react"

interface AuditTrailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  targetUserId?: string | number
}

export function AuditTrailDialog({ open, onOpenChange, targetUserId }: AuditTrailDialogProps) {
  const [logs, setLogs] = useState<AuditEvent[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setLoading(true)
      fetchAuditEvents(search)
        .then((items) => {
          if (targetUserId) {
            setLogs(items.filter((l) => String(l.target_user_id) === String(targetUserId)))
          } else {
            setLogs(items)
          }
        })
        .finally(() => setLoading(false))
    }
  }, [open, search, targetUserId])

  const getActionBadge = (action: AuditEvent["action"]) => {
    switch (action) {
      case "CREATE_USER":
        return <Badge className="bg-emerald-100 text-emerald-800 border-none text-[10px]">CREATED</Badge>
      case "STATUS_CHANGE":
        return <Badge className="bg-amber-100 text-amber-800 border-none text-[10px]">STATUS CHANGED</Badge>
      case "ROLE_ASSIGNMENT":
      case "ROLE_REVOCATION":
      case "BULK_ROLE_CHANGE":
        return <Badge className="bg-blue-100 text-blue-800 border-none text-[10px]">ROLE MODIFIED</Badge>
      case "SCOPE_CHANGE":
        return <Badge className="bg-purple-100 text-purple-800 border-none text-[10px]">SCOPE REASSIGNED</Badge>
      case "BULK_IMPORT":
        return <Badge className="bg-teal-100 text-teal-800 border-none text-[10px]">BULK IMPORT</Badge>
      default:
        return <Badge variant="outline" className="text-[10px]">{action}</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gray-100 rounded-lg text-gray-800">
              <History className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                Security Audit Trail & Account Activity (USR09)
              </DialogTitle>
              <DialogDescription>
                Immutable chronological log of all sensitive user account modifications, role reassignments, and administrative reasons.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex items-center gap-2 py-2">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search audit trail by actor, target user, action, or reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
          <span className="text-xs text-gray-500 whitespace-nowrap">{logs.length} audit event(s)</span>
        </div>

        <div className="flex-1 border rounded-xl overflow-hidden mt-1">
          <ScrollArea className="h-96">
            <div className="divide-y text-xs">
              {logs.map((log) => (
                <div key={log.id} className="p-3.5 hover:bg-gray-50/70 transition space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getActionBadge(log.action)}
                      <span className="font-semibold text-gray-900">
                        Target: {log.target_user_name}
                      </span>
                      {log.target_user_id && (
                        <span className="text-gray-400 font-mono text-[11px]">
                          ({log.target_user_id})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>

                  {/* Mandatory Reason Box */}
                  <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200/80 text-[11px] text-gray-700">
                    <span className="font-semibold text-gray-900 mr-1.5">Administrative Reason:</span>
                    <span className="italic">{log.reason || "No documented reason supplied"}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3 text-gray-400" />
                      Authorized By: <strong className="text-gray-700">{log.actor_name}</strong>
                    </span>
                    {log.details && (
                      <span className="font-mono text-[10px] text-gray-400">
                        Event ID: {log.id}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {logs.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No audit log entries matching criteria.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
