"use client"

import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import {
  getAvailableMdas,
  getAvailableRoles,
  getDepartmentsForMda,
  updateUserAccount,
} from "@/services/endpoints/users/user-management"
import type { DataScopeLevel, UpdateUserRequest, UserAccount } from "@/types/user-management"
import type { Role } from "@/types/roles"
import { AlertCircle, Briefcase, Building2, Edit3, KeyRound, Shield, ShieldCheck } from "lucide-react"

interface EditUserDialogProps {
  user: UserAccount | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (updated: UserAccount) => void
}

export function EditUserDialog({ user, open, onOpenChange, onSuccess }: EditUserDialogProps) {
  const [loading, setLoading] = useState(false)
  const [roles, setRoles] = useState<Role[]>([])
  const [mdas, setMdas] = useState<{ id: number; name: string; code: string }[]>([])
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([])

  const [formData, setFormData] = useState<{
    full_name: string
    email: string
    username: string
    staff_id: string
    phone: string
    role_ids: (string | number)[]
    mda_id: number | undefined
    mda_name: string
    department_id: number | undefined
    department_name: string
    scope_level: DataScopeLevel
    approval_role: string
    reason: string
    new_password: string
  }>({
    full_name: "",
    email: "",
    username: "",
    staff_id: "",
    phone: "",
    role_ids: [],
    mda_id: undefined,
    mda_name: "",
    department_id: undefined,
    department_name: "",
    scope_level: "assigned_mda",
    approval_role: "none",
    reason: "",
    new_password: "",
  })

  useEffect(() => {
    if (open && user) {
      getAvailableRoles().then(setRoles)
      getAvailableMdas().then(setMdas)

      setFormData({
        full_name: user.full_name,
        email: user.email,
        username: user.username,
        staff_id: user.staff_id,
        phone: user.phone || "",
        role_ids: user.roles.map((r) => r.id),
        mda_id: user.mda_id ? Number(user.mda_id) : undefined,
        mda_name: user.mda_name || "",
        department_id: user.department_id ? Number(user.department_id) : undefined,
        department_name: user.department_name || "",
        scope_level: user.scope_level,
        approval_role: user.approval_role || "none",
        reason: "",
        new_password: "",
      })

      if (user.mda_id) {
        getDepartmentsForMda(user.mda_id).then(setDepartments)
      }
    }
  }, [open, user])

  const handleRoleToggle = (roleId: string | number) => {
    setFormData((prev) => {
      const exists = prev.role_ids.includes(roleId)
      const updated = exists ? prev.role_ids.filter((id) => id !== roleId) : [...prev.role_ids, roleId]
      return { ...prev, role_ids: updated }
    })
  }

  const handleMdaChange = (mdaIdStr: string) => {
    const mdaId = Number(mdaIdStr)
    const selectedMda = mdas.find((m) => m.id === mdaId)
    setFormData((prev) => ({
      ...prev,
      mda_id: mdaId,
      mda_name: selectedMda?.name || "",
      department_id: undefined,
      department_name: "",
    }))
    getDepartmentsForMda(mdaId).then(setDepartments)
  }

  const handleDeptChange = (deptIdStr: string) => {
    const deptId = Number(deptIdStr)
    const selectedDept = departments.find((d) => d.id === deptId)
    setFormData((prev) => ({
      ...prev,
      department_id: deptId,
      department_name: selectedDept?.name || "",
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!formData.reason.trim()) {
      toast.error("Audit Justification Required", {
        description: "USR09 requires a documented reason for sensitive account modifications.",
      })
      return
    }

    if (formData.role_ids.length === 0) {
      toast.error("Role Assignment Required", {
        description: "A user account must have at least one approved role assigned (USR04).",
      })
      return
    }

    try {
      setLoading(true)
      const payload: UpdateUserRequest = {
        id: user.id,
        full_name: formData.full_name,
        email: formData.email,
        username: formData.username,
        staff_id: formData.staff_id,
        phone: formData.phone,
        role_ids: formData.role_ids,
        mda_id: formData.mda_id,
        mda_name: formData.mda_name,
        department_id: formData.department_id,
        department_name: formData.department_name,
        scope_level: formData.scope_level,
        approval_role: formData.approval_role,
        password: formData.new_password || undefined,
        reason: formData.reason,
      }

      const updated = await updateUserAccount(payload)
      toast.success("Account Updated", {
        description: `Changes to ${updated.full_name} have been committed and logged to the audit trail.`,
      })
      onSuccess(updated)
      onOpenChange(false)
    } catch (err: any) {
      toast.error("Update Failed", { description: err.message || "Failed to update user account" })
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Edit Account & Authority Scope</DialogTitle>
              <DialogDescription>
                Modify profile, update roles (USR04), change MDA scope (USR05), and record justification (USR09).
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          {/* Identity */}
          <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
              <Shield className="h-4 w-4 text-blue-600" />
              1. Profile & Identifiers
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit_full_name" className="text-xs font-semibold text-gray-700">Full Name</Label>
                <Input
                  id="edit_full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit_staff_id" className="text-xs font-semibold text-gray-700">Staff ID</Label>
                <Input
                  id="edit_staff_id"
                  value={formData.staff_id}
                  onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit_username" className="text-xs font-semibold text-gray-700">Username</Label>
                <Input
                  id="edit_username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit_email" className="text-xs font-semibold text-gray-700">Official Email</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit_phone" className="text-xs font-semibold text-gray-700">Phone</Label>
                <Input
                  id="edit_phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit_new_pwd" className="text-xs font-semibold text-gray-700">
                  Reset Password (Leave blank to keep existing)
                </Label>
                <div className="relative">
                  <Input
                    id="edit_new_pwd"
                    type="password"
                    placeholder="Enter new password"
                    value={formData.new_password}
                    onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                    className="font-mono text-sm"
                  />
                  <KeyRound className="h-4 w-4 absolute right-3 top-3 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Role assignment */}
          <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Briefcase className="h-4 w-4 text-blue-600" />
                2. Effective Role Assignment (USR04)
              </div>
              <span className="text-xs text-gray-500">Multi-role capability enabled</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {roles.map((role) => {
                const isChecked = formData.role_ids.map(String).includes(String(role.id))
                return (
                  <label
                    key={role.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                      isChecked
                        ? "border-blue-500 bg-blue-50/50 shadow-sm"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => handleRoleToggle(role.id)}
                      className="mt-0.5 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <div className="text-xs space-y-0.5">
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        {role.name}
                        {isChecked && (
                          <Badge variant="outline" className="text-[10px] bg-blue-100 text-blue-800 border-none">
                            Assigned
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-500 text-[11px]">{role.description || "System authority role"}</p>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Section 3: Workflow Approval & Reviewer Authority */}
          <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                3. Workflow Approval & Reviewer Authority
              </div>
              <Badge variant="outline" className="text-[10px] text-blue-800 bg-blue-50 border-blue-200">
                Workflow Role
              </Badge>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit_approval_role" className="text-xs font-semibold text-gray-700">
                Approval / Reviewer Designation
              </Label>
              <Select
                value={formData.approval_role || "none"}
                onValueChange={(val) => setFormData({ ...formData, approval_role: val })}
              >
                <SelectTrigger id="edit_approval_role" className="bg-white">
                  <SelectValue placeholder="Select if user will be Approval and Reviewer, or Final Reviewer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approval_and_reviewer">
                    <div className="flex flex-col py-0.5 text-left">
                      <span className="font-semibold text-gray-900">Approval and Reviewer</span>
                      <span className="text-[11px] text-gray-500">First-level review, compliance verification, and initial endorsement</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="final_reviewer">
                    <div className="flex flex-col py-0.5 text-left">
                      <span className="font-semibold text-gray-900">Final Reviewer</span>
                      <span className="text-[11px] text-gray-500">Conclusive audit sign-off, executive validation, and final disbursement authorization</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="none">
                    <div className="flex flex-col py-0.5 text-left">
                      <span className="font-semibold text-gray-900">None / Standard User</span>
                      <span className="text-[11px] text-gray-500">Standard operational access without workflow approval authority</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-gray-500">
                Select if the user will be an <strong>Approval and Reviewer</strong> or <strong>Final Reviewer</strong> in administrative approval workflows.
              </p>
            </div>
          </div>

          {/* Section 4: MDA & Department Scope (USR05) */}
          <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
              <Building2 className="h-4 w-4 text-blue-600" />
              4. Authorised MDA & Department Scope (USR05)
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Authorised MDA</Label>
                <Select value={formData.mda_id ? String(formData.mda_id) : ""} onValueChange={handleMdaChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select MDA" />
                  </SelectTrigger>
                  <SelectContent>
                    {mdas.map((mda) => (
                      <SelectItem key={mda.id} value={String(mda.id)}>
                        {mda.name} ({mda.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Department</Label>
                <Select
                  value={formData.department_id ? String(formData.department_id) : ""}
                  onValueChange={handleDeptChange}
                  disabled={!formData.mda_id || departments.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formData.mda_id ? "Select Department" : "Select MDA first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={String(dept.id)}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Scope Level</Label>
                <Select
                  value={formData.scope_level}
                  onValueChange={(val: DataScopeLevel) => setFormData({ ...formData, scope_level: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_mdas">All MDAs (Global)</SelectItem>
                    <SelectItem value="assigned_mda">Assigned MDA Only</SelectItem>
                    <SelectItem value="department">Assigned Department Only</SelectItem>
                    <SelectItem value="sub_unit">Sub-unit Scope</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Mandatory Reason for Sensitive Changes (USR09) */}
          <div className="border border-amber-200 bg-amber-50/60 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-900">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              Audit Justification (Required by USR09)
            </div>
            <p className="text-xs text-amber-800">
              Please enter the official justification or authorization reference for this account modification. This event will be recorded in the security audit trail.
            </p>
            <Textarea
              placeholder="e.g. Reassigned role and department following Executive Order EO-2026-09..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="bg-white border-amber-300 min-h-[70px] text-xs"
              required
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#008751] hover:bg-[#008751]/90 text-white" disabled={loading}>
              {loading ? "Saving Changes..." : "Save Changes & Log Audit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
