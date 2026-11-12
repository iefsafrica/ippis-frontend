"use client"

import { useMemo } from "react"
import { useAuth } from "@/lib/auth-context"
import { useGetCompanies } from "@/services/hooks/organizations/company/useCompany"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Building2 } from "lucide-react"

interface MdaSelectProps {
  value?: string | number
  onChange: (value: string) => void
  label?: string
  required?: boolean
  className?: string
  disabled?: boolean
  placeholder?: string
}

export function MdaSelect({
  value,
  onChange,
  label = "MDA / Organization",
  required = false,
  className = "",
  disabled = false,
  placeholder = "Select MDA (defaults to your MDA)",
}: MdaSelectProps) {
  const { user } = useAuth()
  const { data: companiesResponse, isLoading } = useGetCompanies()

  const companies = useMemo(() => companiesResponse?.data || [], [companiesResponse])

  // Is central admin
  const isCentralAdmin = useMemo(() => {
    if (!user) return false
    const roleLower = (user.role || "").toLowerCase()
    const roleKeyLower = (user.role_key || "").toLowerCase()
    return (
      roleLower.includes("super") ||
      roleKeyLower.includes("super") ||
      roleLower.includes("central") ||
      roleKeyLower.includes("central")
    )
  }, [user])

  // User's own company name if known
  const userCompanyName = useMemo(() => {
    if (!user?.company_id) return null
    const found = companies.find((c) => String(c.id) === String(user.company_id))
    return found ? found.name : `My MDA (#${user.company_id})`
  }, [companies, user])

  // If regular user and they have a company_id, they don't need to change it,
  // but it's helpful to show which MDA the record will go to.
  if (!isCentralAdmin && user?.company_id) {
    return (
      <div className={`space-y-1.5 ${className}`}>
        <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5 text-slate-400" />
          {label}
        </Label>
        <div className="h-10 px-3 flex items-center rounded-md border border-slate-200 bg-slate-50 text-xs text-slate-700 font-medium">
          {userCompanyName}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
        <Building2 className="h-3.5 w-3.5 text-slate-400" />
        {label} {required && <span className="text-rose-500">*</span>}
      </Label>
      <Select
        value={value ? String(value) : ""}
        onValueChange={onChange}
        disabled={disabled || isLoading}
      >
        <SelectTrigger className="h-10 text-xs bg-white">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {companies.map((c) => (
            <SelectItem key={c.id} value={String(c.id)} className="text-xs">
              {c.name} {c.code ? `(${c.code})` : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
