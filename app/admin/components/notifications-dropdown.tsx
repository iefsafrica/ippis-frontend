"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Bell, Check, X } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"

// Define a simple notification type for now
type Notification = {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string
}

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.read).length
  const hasUnread = unreadCount > 0

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true)
        // For now, just use mock data
        // In a real implementation, this would be an API call
        const mockNotifications: Notification[] = [
          {
            id: "1",
            title: "New Registration",
            message: "A new employee has registered and is awaiting approval",
            type: "registration",
            read: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: "2",
            title: "Document Uploaded",
            message: "New documents have been uploaded for verification",
            type: "document",
            read: true,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: "3",
            title: "System Update",
            message: "The system will undergo maintenance tonight at 11 PM",
            type: "system",
            read: false,
            createdAt: new Date(Date.now() - 7200000).toISOString(),
          },
        ]

        setNotifications(mockNotifications)
        setError(null)
      } catch (err) {
        console.error("Error fetching notifications:", err)
        setError("Failed to load notifications")
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  // Mark a notification as read
  const markAsRead = async (id: string) => {
    try {
      // In a real implementation, this would be an API call
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    } catch (err) {
      console.error("Error marking notification as read:", err)
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      // In a real implementation, this would be an API call
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch (err) {
      console.error("Error marking all notifications as read:", err)
    }
  }

  const handleMarkAllAsRead = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation() // Prevent closing dropdown
    markAllAsRead()
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-gray-500 hover:text-primary hover:bg-primary/5 rounded-full"
        >
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#008751] text-[10px] font-medium text-white">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 p-0 overflow-hidden rounded-xl border border-gray-200 shadow-lg bg-white"
        style={{ zIndex: 100 }} // Ensure high z-index
        sideOffset={8} // Add some offset to prevent overlap with the trigger
        alignOffset={0} // Adjust alignment offset
        forceMount // Force mount to ensure proper positioning
      >
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-3 flex items-center justify-between">
          <DropdownMenuLabel className="p-0 flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <span className="text-gray-900 font-bold">Notifications</span>
            {unreadCount > 0 && (
              <Badge className="bg-secondary text-white text-xs rounded-full px-2">{unreadCount} new</Badge>
            )}
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs text-[#008751] hover:text-[#008751]/80 hover:bg-[#008751]/5"
            >
              <Check className="h-3 w-3" />
              Mark all as read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />
        <div className="max-h-[320px] overflow-y-auto py-1">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              <div className="animate-pulse flex flex-col gap-2">
                <div className="h-12 bg-gray-100 rounded-md"></div>
                <div className="h-12 bg-gray-100 rounded-md"></div>
                <div className="h-12 bg-gray-100 rounded-md"></div>
              </div>
            </div>
          ) : error ? (
            <div className="p-4 text-center">
              <X className="h-5 w-5 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-red-600 font-medium">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 text-xs h-8"
                onClick={(e) => {
                  e.stopPropagation()
                  setOpen(false)
                }}
              >
                Dismiss
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center">
              <div className="bg-gray-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Bell className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-700 font-medium">No notifications</p>
              <p className="text-xs text-gray-500 mt-1">You're all caught up!</p>
            </div>
          ) : (
            <DropdownMenuGroup>
              {notifications.map((notification) => (
                <div key={notification.id} className="px-1">
                  <NotificationItem notification={notification} onRead={() => markAsRead(notification.id)} />
                </div>
              ))}
            </DropdownMenuGroup>
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />
        <div className="p-2 bg-gray-50 text-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-gray-700 hover:text-primary hover:bg-primary/5 w-full justify-center"
            onClick={(e) => {
              e.stopPropagation()
              setOpen(false)
            }}
          >
            View all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
