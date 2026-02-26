"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Menu, Search, User, Settings, LogOut, ChevronDown, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { NotificationsDropdown } from "./notifications-dropdown"
import { useMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/lib/auth-context"
import Image from "next/image"

// Import the user profile components
import UserProfile from "./user-profile"
import ChangePassword from "./change-password"

export function AdminHeader() {
  const pathname = usePathname() || ""
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isMobile, toggleSidebar } = useMobile()
  const [showSearch, setShowSearch] = useState(false)
  const { user, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)

  // Monitor scroll position to add shadow on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // State for dialogs
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user || !user.name) return "U"
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // Get page title based on pathname
  const getPageTitle = () => {
    if (pathname === "/admin") return "Dashboard"
    if (pathname === "/admin/employees") {
      const employeeTab = searchParams.get("tab")
      if (employeeTab === "pending") return "Pending Employee"
      if (employeeTab === "import") return "Import Employees"
      return "Employee"
    }
    if (pathname === "/admin/pending") return "Pending Employee"
    if (pathname === "/admin/documents") return "Documents"
    if (pathname === "/admin/reports") return "Reports"
    if (pathname === "/admin/settings") return "Settings"
    if (pathname === "/admin/backup") return "Backup & Restore"
    if (pathname === "/admin/import") return "Import Data"
    if (pathname === "/admin/help") return "Help & Support"
    if (pathname.startsWith("/admin/hr-reports")) return "HR Reports"
    if (pathname.startsWith("/admin/core-hr")) return "Core HR"
    if (pathname.startsWith("/admin/performance")) return "Performance"
    if (pathname.startsWith("/admin/timesheets")) return "Timesheets"
    return "Admin Dashboard"
  }

  return (
    <header
      className={`bg-white sticky top-0 z-30 transition-all duration-200 ${
        scrolled ? "border-b border-gray-200 shadow-sm" : "border-b border-gray-100"
      }`}
    >
      <div className="px-3 sm:px-6 lg:px-8 flex h-16 items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="mr-1 text-gray-500 hover:text-[#008751] hover:bg-[#008751]/5"
              onClick={toggleSidebar}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          )}
          <div className="relative h-9 w-9 overflow-hidden rounded-full bg-[#008751] flex items-center justify-center">
            <Image src="/images/ippis-logo.jpeg" alt="IPPIS Logo" fill className="object-contain" />
          </div>
          {pathname !== "/admin" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="h-8 px-2 text-gray-600 hover:text-[#008751] hover:bg-[#008751]/5 flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          )}
          <div className="flex flex-col min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight truncate">{getPageTitle()}</h1>
            <p className="text-xs text-gray-500 hidden sm:block">Integrated Personnel and Payroll Information System</p>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
          {showSearch ? (
            <div className="relative w-40 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full bg-gray-50 border-gray-200 pl-8 focus-visible:ring-[#008751] text-gray-900 rounded-full"
                autoFocus
                onBlur={() => setShowSearch(false)}
              />
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSearch(true)}
              className="text-gray-500 hover:text-[#008751] hover:bg-[#008751]/5 rounded-full"
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          )}

          <NotificationsDropdown />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full flex items-center gap-2 px-2 hover:bg-[#008751]/5">
                <Avatar className="h-8 w-8 border-2 border-[#008751]/10">
                  <AvatarImage
                    src={`https://ui-avatars.com/api/?name=${user?.name || "User"}&background=008751&color=fff`}
                    alt={user?.name || "User"}
                  />
                  <AvatarFallback className="bg-[#008751]/10 text-[#008751]">{getUserInitials()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-left hidden sm:flex">
                  <span className="text-sm font-medium text-gray-900">{user?.name || "User"}</span>
                  <span className="text-xs text-gray-500">Administrator</span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500 hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 bg-white">
              <div className="flex items-center justify-start gap-3 p-2 border-b border-gray-100 pb-2 mb-1">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={`https://ui-avatars.com/api/?name=${user?.name || "User"}&background=008751&color=fff`}
                    alt={user?.name || "User"}
                  />
                  <AvatarFallback className="bg-[#008751]/10 text-[#008751]">{getUserInitials()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-0.5 leading-none">
                  {user && (
                    <>
                      <p className="font-semibold text-gray-900">{user.name || "User"}</p>
                      <p className="text-xs text-gray-500">{user.email || ""}</p>
                    </>
                  )}
                </div>
              </div>

              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault()
                  setShowProfileDialog(true)
                }}
                className="text-gray-700 font-medium rounded-md cursor-pointer flex items-center h-9 px-2 py-1.5 my-1 hover:bg-[#008751]/5 hover:text-[#008751]"
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault()
                  setShowPasswordDialog(true)
                }}
                className="text-gray-700 font-medium rounded-md cursor-pointer flex items-center h-9 px-2 py-1.5 my-1 hover:bg-[#008751]/5 hover:text-[#008751]"
              >
                <Settings className="mr-2 h-4 w-4" />
                Change Password
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem
                onClick={() => {
                  if (logout) logout()
                }}
                className="text-gray-700 font-medium rounded-md cursor-pointer flex items-center h-9 px-2 py-1.5 my-1 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-gray-900 font-bold">Edit Profile</DialogTitle>
          </DialogHeader>
          <UserProfile onClose={() => setShowProfileDialog(false)} user={user} />
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-gray-900 font-bold">Change Password</DialogTitle>
          </DialogHeader>
          <ChangePassword onClose={() => setShowPasswordDialog(false)} userId={user?.id} />
        </DialogContent>
      </Dialog>
    </header>
  )
}
