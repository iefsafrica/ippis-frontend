"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"

import { ShieldCheck } from "lucide-react"
import { EffectiveAccessDrawer } from "../users/components/effective-access-drawer"
import type { UserAccount } from "@/types/user-management"

interface UserProfileProps {
  onClose: () => void
  user: any
}

export default function UserProfile({ onClose, user }: UserProfileProps) {
  const { updateUser } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showAccessDrawer, setShowAccessDrawer] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  })

  const currentUserAccount: UserAccount = {
    id: user?.id || "USR-CURRENT",
    username: user?.username || "admin",
    email: user?.email || "admin@ippis.gov.ng",
    full_name: user?.name || "Administrator",
    staff_id: "IPPIS-HQ-001",
    status: "active",
    roles: [
      {
        id: 1,
        name: user?.role === "superadmin" ? "Super Administrator" : "Administrator",
        description: "Administrative access across IPPIS modules",
      },
    ],
    role_ids: [1],
    mda_name: "Office of the Accountant General of the Federation",
    department_name: "IPPIS Central Operations",
    scope_level: "all_mdas",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.id) {
      toast({
        title: "Error",
        description: "User ID not found",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      const response = await fetch(`/api/admin/users/${user.id}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      // Update the user in context
      updateUser(formData)

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })

      onClose()
    } catch (error) {
      console.error("Profile update error:", error)
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
        </div>

        {/* USR08: Self-service access and permissions inspection */}
        <div className="pt-2 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowAccessDrawer(true)}
            className="w-full flex items-center justify-center gap-2 border-emerald-300 text-emerald-800 bg-emerald-50/60 hover:bg-emerald-100 text-xs py-2"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-700" />
            View My Effective Roles & Permissions (USR08)
          </Button>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="bg-[#008751] hover:bg-[#008751]/90 text-white">
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>

      <EffectiveAccessDrawer
        user={currentUserAccount}
        open={showAccessDrawer}
        onOpenChange={setShowAccessDrawer}
        isSelfService={true}
      />
    </>
  )
}
