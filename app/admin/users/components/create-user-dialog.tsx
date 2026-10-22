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
  createUserAccount,
  getAvailableMdas,
  getAvailableRoles,
  getDepartmentsForMda,
} from "@/services/endpoints/users/user-management"
import type { CreateUserRequest, DataScopeLevel, UserAccount, UserStatus } from "@/types/user-management"
import type { Role } from "@/types/roles"
import { KeyRound, RefreshCw, Shield, ShieldCheck, UserPlus, Building2, Briefcase } from "lucide-react"

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (user: UserAccount) => void
}

export function CreateUserDialog({ open, onOpenChange, onSuccess }: CreateUserDialogProps) {
  const [loading, setLoading] = useState(false)
  const [roles, setRoles] = useState<Role[]>([])
  const [mdas, setMdas] = useState<{ id: number; name: string; code: string }[]>([])
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([])

  const [formData, setFormData] = useState<CreateUserRequest>({
    username: "",
    email: "",
    full_name: "",
    password: "",
    staff_id: "",
    phone: "",
    role_ids: [],
    mda_id: undefined,
    mda_name: "",
    department_id: undefined,
    department_name: "",
    scope_level: "assigned_mda",
    approval_role: "none",
    status: "active",
    notes: "",
  })

  useEffect(() => {
    if (open) {
      getAvailableRoles().then(setRoles)
      getAvailableMdas().then(setMdas)
      generateRandomPassword()
    }
  }, [open])

  useEffect(() => {
    if (formData.mda_id) {
      getDepartmentsForMda(formData.mda_id).then((deps) => {
        setDepartments(deps)
        if (deps.length > 0 && !formData.department_id) {
          setFormData((prev) => ({
            ...prev,
            department_id: deps[0].id,
            department_name: deps[0].name,
          }))
        }
      })
    } else {
      setDepartments([])
    }
  }, [formData.mda_id])

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*"
    let pwd = ""
    for (let i = 0; i < 14; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData((prev) => ({ ...prev, password: pwd }))
  }

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

    if (!formData.username.trim() || !formData.email.trim() || !formData.full_name.trim() || !formData.staff_id.trim()) {
      toast.error("Validation Error", { description: "Please fill in all mandatory account identity fields." })
      return
    }

    if (formData.role_ids.length === 0) {
      toast.error("Role Required", { description: "Please select at least one role to grant access (USR04)." })
      return
    }

    try {
      setLoading(true)
      const created = await createUserAccount(formData)
      toast.success("User Account Created", {
        description: `Account for ${created.full_name} (${created.staff_id}) provisioned successfully.`,
      })
      onSuccess(created)
      onOpenChange(false)
    } catch (err: any) {
      toast.error("Creation Failed", { description: err.message || "Failed to create user account" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Create Individual User Account</DialogTitle>
              <DialogDescription>
                Authorised workflow to create a new administrative user with multi-role and MDA scoping (USR01, USR04, USR05).
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          {/* Section 1: User Identity */}
          <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
              <Shield className="h-4 w-4 text-emerald-600" />
              1. Account Identity & Credentials
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="full_name" className="text-xs font-semibold text-gray-700">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="full_name"
                  placeholder="e.g. Amina Yusuf Mohammed"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="staff_id" className="text-xs font-semibold text-gray-700">
                  Staff / Verification ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="staff_id"
                  placeholder="e.g. IPPIS-ADM-2041"
                  value={formData.staff_id}
                  onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-xs font-semibold text-gray-700">
                  Username <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="username"
                  placeholder="e.g. amina.yusuf"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().trim() })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-gray-700">
                  Official Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g. a.mohammed@fmf.gov.ng"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value.trim() })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold text-gray-700">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  placeholder="e.g. +234 803 000 1122"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold text-gray-700">
                    Temporary Password <span className="text-red-500">*</span>
                  </Label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-medium"
                  >
                    <RefreshCw className="h-3 w-3" /> Regenerate
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="font-mono text-sm pr-9"
                  />
                  <KeyRound className="h-4 w-4 absolute right-3 top-3 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Role Assignment (USR04) */}
          <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Briefcase className="h-4 w-4 text-emerald-600" />
                2. Approved Role Assignment (USR04)
              </div>
              <span className="text-xs text-gray-500">Assign one or more roles</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {roles.map((role) => {
                const isChecked = formData.role_ids.includes(role.id)
                return (
                  <label
                    key={role.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                      isChecked
                        ? "border-emerald-500 bg-emerald-50/50 shadow-sm"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => handleRoleToggle(role.id)}
                      className="mt-0.5 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                    <div className="text-xs space-y-0.5">
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        {role.name}
                        {isChecked && (
                          <Badge variant="outline" className="text-[10px] bg-emerald-100 text-emerald-800 border-none">
                            Selected
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-500 leading-relaxed text-[11px]">{role.description || "System authority role"}</p>
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
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                3. Workflow Approval & Reviewer Authority
              </div>
              <Badge variant="outline" className="text-[10px] text-emerald-800 bg-emerald-50 border-emerald-200">
                Workflow Role
              </Badge>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="approval_role" className="text-xs font-semibold text-gray-700">
                Approval / Reviewer Designation <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.approval_role || "none"}
                onValueChange={(val) => setFormData({ ...formData, approval_role: val })}
              >
                <SelectTrigger id="approval_role" className="bg-white">
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
              <Building2 className="h-4 w-4 text-emerald-600" />
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
                <Label className="text-xs font-semibold text-gray-700">Data Visibility Scope</Label>
                <Select
                  value={formData.scope_level}
                  onValueChange={(val: DataScopeLevel) => setFormData({ ...formData, scope_level: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_mdas">All MDAs (Federal Global)</SelectItem>
                    <SelectItem value="assigned_mda">Assigned MDA Only</SelectItem>
                    <SelectItem value="department">Assigned Department Only</SelectItem>
                    <SelectItem value="sub_unit">Sub-unit Scope</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Section 5: Initial Status & Authorisation Note (USR01, USR06, USR09) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Initial Account Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v: UserStatus) => setFormData({ ...formData, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active (Immediate Login)</SelectItem>
                  <SelectItem value="pending">Pending Verification</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <Label htmlFor="notes" className="text-xs font-semibold text-gray-700">
                Authorisation Reason / Approval Reference (USR09)
              </Label>
              <Input
                id="notes"
                placeholder="e.g. Approved per Circular OHCSF/IPPIS/2026/Vol.2"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#008751] hover:bg-[#008751]/90 text-white" disabled={loading}>
              {loading ? "Provisioning..." : "Provision User Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
