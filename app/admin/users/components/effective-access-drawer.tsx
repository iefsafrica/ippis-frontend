"use client"

import React, { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getUserEffectiveAccess } from "@/services/endpoints/users/user-management"
import type { UserAccount } from "@/types/user-management"
import type { Permission } from "@/types/permissions"
import {
  Building2,
  CheckCircle2,
  KeyRound,
  LayoutGrid,
  Lock,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react"

interface EffectiveAccessDrawerProps {
  user: UserAccount | null
  open: boolean
  onOpenChange: (open: boolean) => void
  isSelfService?: boolean
}

export function EffectiveAccessDrawer({
  user,
  open,
  onOpenChange,
  isSelfService = false,
}: EffectiveAccessDrawerProps) {
  const [accessData, setAccessData] = useState<{
    modules: { name: string; accessible: boolean; access_level: string; resource: string }[]
    granular_permissions: Permission[]
  } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && user) {
      setLoading(true)
      getUserEffectiveAccess(user)
        .then((res) => {
          setAccessData(res)
        })
        .finally(() => setLoading(false))
    }
  }, [open, user])

  if (!user) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl flex flex-col p-0">
        <SheetHeader className="p-6 pb-4 border-b bg-gray-50/70">
          <div className="flex items-center gap-2 text-emerald-700">
            <ShieldCheck className="h-6 w-6" />
            <SheetTitle className="text-lg font-bold">
              {isSelfService ? "My Effective Roles & Accessible Modules" : "User Effective Access Policy"}
            </SheetTitle>
          </div>
          <SheetDescription className="text-xs">
            Evaluation of active roles, assigned scopes, and effective module privileges per security policy (USR08).
          </SheetDescription>

          {/* User profile banner */}
          <div className="mt-3 p-3 rounded-xl bg-white border border-gray-200/80 shadow-xs flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-900 text-sm">{user.full_name}</div>
              <div className="text-xs text-gray-500 font-mono">
                {user.staff_id} &bull; {user.email}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge
                className={
                  user.status === "active"
                    ? "bg-emerald-100 text-emerald-800 border-none font-semibold text-[10px]"
                    : "bg-red-100 text-red-800 border-none font-semibold text-[10px]"
                }
              >
                {user.status.toUpperCase()}
              </Badge>
              <span className="text-[10px] text-gray-500 capitalize">{user.scope_level.replace(/_/g, " ")}</span>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <Tabs defaultValue="modules" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="modules" className="text-xs">Accessible Modules</TabsTrigger>
              <TabsTrigger value="roles" className="text-xs">Effective Roles</TabsTrigger>
              <TabsTrigger value="permissions" className="text-xs">Granular Matrix</TabsTrigger>
            </TabsList>

            {/* TAB 1: ACCESSIBLE MODULES (USR08) */}
            <TabsContent value="modules" className="space-y-3 pt-3">
              <div className="text-xs text-gray-500 flex items-center justify-between">
                <span>Modules and feature sets authorized for this user:</span>
                <span className="text-emerald-700 font-medium font-mono text-[11px]">
                  {accessData?.modules.filter((m) => m.accessible).length || 0} Authorized
                </span>
              </div>

              <div className="space-y-2">
                {accessData?.modules.map((mod, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-center justify-between transition ${
                      mod.accessible ? "bg-white border-gray-200" : "bg-gray-50/80 border-gray-200 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          mod.accessible ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {mod.accessible ? <LayoutGrid className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-900">{mod.name}</div>
                        <div className="text-[11px] text-gray-500 font-mono">Resource: {mod.resource}</div>
                      </div>
                    </div>

                    <div>
                      {mod.accessible ? (
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700 border-emerald-300 font-medium text-[11px]"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600 inline" /> {mod.access_level}
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-gray-100 text-gray-500 border-gray-300 text-[11px]"
                        >
                          <XCircle className="h-3 w-3 mr-1 text-gray-400 inline" /> No Access
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* TAB 2: EFFECTIVE ROLES & SCOPES (USR04, USR05) */}
            <TabsContent value="roles" className="space-y-4 pt-3">
              <div className="space-y-3">
                <div className="text-xs font-semibold text-gray-700">Authorised Scope (USR05)</div>
                <div className="p-3.5 rounded-xl border bg-gray-50 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">MDA Jurisdiction:</span>
                    <span className="font-semibold text-gray-900">{user.mda_name || "Unrestricted (Federal HQ)"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Department Scope:</span>
                    <span className="font-semibold text-gray-900">{user.department_name || "All Departments"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Data Visibility:</span>
                    <Badge variant="outline" className="text-[10px] bg-white text-gray-800">
                      {user.scope_level.replace(/_/g, " ").toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="text-xs font-semibold text-gray-700 pt-2">Assigned Roles ({user.roles.length})</div>
                <div className="space-y-2">
                  {user.roles.map((role) => (
                    <div key={role.id} className="p-3 rounded-xl border bg-white space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-gray-900">{role.name}</span>
                        <Badge className="bg-emerald-100 text-emerald-800 border-none text-[10px]">Active Role</Badge>
                      </div>
                      <p className="text-[11px] text-gray-500">{role.description || "System authority role"}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: GRANULAR PERMISSION MATRIX */}
            <TabsContent value="permissions" className="space-y-3 pt-3">
              <div className="text-xs text-gray-500">
                Detailed granular resource permissions aggregated from roles and user assignments:
              </div>

              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 border-b text-gray-600">
                    <tr>
                      <th className="p-2.5 text-left font-semibold">Permission</th>
                      <th className="p-2.5 text-left font-semibold">Resource</th>
                      <th className="p-2.5 text-left font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {accessData?.granular_permissions.map((perm) => (
                      <tr key={perm.id} className="hover:bg-gray-50/50">
                        <td className="p-2.5">
                          <div className="font-semibold text-gray-900">{perm.name}</div>
                          <div className="text-[10px] text-gray-500">{perm.description}</div>
                        </td>
                        <td className="p-2.5 font-mono text-gray-700">{perm.resource}</td>
                        <td className="p-2.5">
                          <Badge variant="outline" className="text-[10px] font-mono capitalize">
                            {perm.action}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}
