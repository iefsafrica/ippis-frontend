"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Bell, Check, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NotificationItem } from "./notification-item"
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/services/endpoints/notifications/notifications"
import { NotificationItemData } from "@/types/notifications"

export function NotificationsDropdown() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<NotificationItemData[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoaded, setInitialLoaded] = useState(false)
  const [open, setOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !(n.read ?? n.is_read)).length
  const hasUnread = unreadCount > 0

  const loadData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true)
      const res = await fetchNotifications()
      if (res && Array.isArray(res.notifications)) {
        setNotifications(res.notifications)
      }
    } catch (err) {
      console.error("Error loading notifications:", err)
    } finally {
      if (isInitial) {
        setLoading(false)
        setInitialLoaded(true)
      }
    }
  }, [])

  // Initial load
  useEffect(() => {
    loadData(true)

    // Periodic refresh every 45 seconds to keep unread badges up-to-date
    const interval = setInterval(() => {
      loadData(false)
    }, 45000)

    return () => clearInterval(interval)
  }, [loadData])

  // Refresh whenever dropdown opens
  useEffect(() => {
    if (open) {
      loadData(false)
    }
  }, [open, loadData])

  // Mark a single notification as read
  const handleMarkAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true, is_read: true } : n))
    )
    await markNotificationAsRead(id)
  }

  // Mark all notifications as read
  const handleMarkAllAsRead = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true, is_read: true }))
    )
    await markAllNotificationsAsRead()
  }

  const handleViewAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    setOpen(false)
    router.push("/admin/notifications")
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-gray-500 hover:text-[#008751] hover:bg-[#008751]/10 rounded-full transition-colors"
          aria-label="Open notifications"
        >
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[#008751] text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[360px] sm:w-[380px] p-0 overflow-hidden rounded-2xl border border-gray-100 shadow-2xl bg-white"
        style={{ zIndex: 100 }}
        sideOffset={8}
        alignOffset={0}
      >
        {/* Header matching user's design */}
        <div className="px-4 py-3 bg-[#F4F9F6] border-b border-gray-100 flex items-center justify-between">
          <DropdownMenuLabel className="p-0 flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#008751]" />
            <span className="text-gray-900 font-bold text-base tracking-tight">Notifications</span>
            {unreadCount > 0 && (
              <span className="flex flex-col items-center justify-center rounded-full bg-[#C91A25] text-white w-7 h-7 shadow-sm">
                <span className="text-[11px] font-bold leading-none">{unreadCount}</span>
                <span className="text-[8px] font-medium leading-none opacity-90">new</span>
              </span>
            )}
          </DropdownMenuLabel>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs font-semibold text-[#008751] hover:text-[#006b40] hover:bg-[#008751]/10 h-7 px-2.5 gap-1 rounded-md transition-colors"
            >
              <Check className="h-3.5 w-3.5 stroke-[2.5]" />
              Mark all as read
            </Button>
          )}
        </div>

        <DropdownMenuSeparator className="m-0" />

        {/* Notifications list */}
        <div className="max-h-[380px] overflow-y-auto p-1.5 divide-y divide-gray-50/50">
          {loading && !initialLoaded ? (
            <div className="p-4 space-y-2">
              <div className="h-16 bg-gray-100/80 rounded-xl animate-pulse" />
              <div className="h-16 bg-gray-100/80 rounded-xl animate-pulse" />
              <div className="h-16 bg-gray-100/80 rounded-xl animate-pulse" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-10 px-4 text-center">
              <div className="bg-gray-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Bell className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-800 font-semibold">No notifications</p>
              <p className="text-xs text-gray-500 mt-0.5">You're all caught up!</p>
            </div>
          ) : (
            <DropdownMenuGroup>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={() => handleMarkAsRead(notification.id)}
                  onCloseDropdown={() => setOpen(false)}
                />
              ))}
            </DropdownMenuGroup>
          )}
        </div>

        <DropdownMenuSeparator className="m-0" />

        {/* Footer */}
        <div className="p-2.5 bg-[#FAFAFA] border-t border-gray-100 text-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs font-medium text-gray-700 hover:text-[#008751] hover:bg-white w-full justify-center transition-colors h-8"
            onClick={handleViewAll}
          >
            View all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
