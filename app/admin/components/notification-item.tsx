"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { Bell, FileText, UserPlus, AlertTriangle, Info, Check, ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"
import { NotificationItemData } from "@/types/notifications"

interface NotificationProps {
  notification: NotificationItemData
  onRead: () => void
  onCloseDropdown?: () => void
}

export function NotificationItem({ notification, onRead, onCloseDropdown }: NotificationProps) {
  const router = useRouter()
  const [isRead, setIsRead] = useState(Boolean(notification.read ?? notification.is_read))

  useEffect(() => {
    setIsRead(Boolean(notification.read ?? notification.is_read))
  }, [notification.read, notification.is_read])

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!isRead) {
      setIsRead(true)
      onRead()
    }

    const targetUrl = notification.actionUrl || notification.action_url
    if (targetUrl) {
      if (onCloseDropdown) onCloseDropdown()
      router.push(targetUrl)
    }
  }

  const handleMarkAsReadOnly = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isRead) {
      setIsRead(true)
      onRead()
    }
  }

  const getIcon = () => {
    switch (notification.type?.toLowerCase()) {
      case "registration":
        return <UserPlus className="h-5 w-5 text-[#008751]" />
      case "document":
        return <FileText className="h-5 w-5 text-[#2563EB]" />
      case "alert":
        return <AlertTriangle className="h-5 w-5 text-amber-600" />
      case "security":
        return <ShieldAlert className="h-5 w-5 text-rose-600" />
      case "system":
        return <Info className="h-5 w-5 text-[#7C3AED]" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getIconWrapperClass = () => {
    switch (notification.type?.toLowerCase()) {
      case "registration":
        return "bg-[#D8F3E5]"
      case "document":
        return "bg-[#EBF3FF]"
      case "alert":
        return "bg-amber-100"
      case "security":
        return "bg-rose-100"
      case "system":
        return "bg-[#E9F7F2]"
      default:
        return "bg-gray-100"
    }
  }

  const getTimeAgo = () => {
    try {
      const dateVal = notification.createdAt || notification.created_at
      if (!dateVal) return "recently"
      return formatDistanceToNow(new Date(dateVal), { addSuffix: true })
    } catch {
      return "recently"
    }
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3.5 cursor-pointer transition-all duration-150 rounded-xl mx-1 my-1 border",
        isRead
          ? "bg-white border-transparent hover:bg-gray-50/80"
          : "bg-[#F0FAF5] border-emerald-100/70 hover:bg-[#E8F7F0]",
      )}
      onClick={handleClick}
    >
      <div className={cn("flex-shrink-0 rounded-full p-2.5 flex items-center justify-center", getIconWrapperClass())}>
        {getIcon()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4
            className={cn(
              "text-sm font-semibold line-clamp-1",
              isRead ? "text-gray-900" : "text-[#008751]",
            )}
          >
            {notification.title}
          </h4>
          {!isRead && (
            <span
              className="flex-shrink-0 rounded-full bg-[#008751] w-2.5 h-2.5 mt-1"
              title="Unread notification"
            />
          )}
        </div>

        <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
          {notification.message}
        </p>

        <div className="flex items-center justify-between mt-2 pt-0.5">
          <span className="text-xs text-gray-500 font-normal">{getTimeAgo()}</span>
          {!isRead && (
            <button
              type="button"
              className="text-xs text-[#008751] hover:text-[#006b40] font-medium flex items-center gap-1 hover:underline transition-colors ml-auto"
              onClick={handleMarkAsReadOnly}
            >
              <Check className="h-3.5 w-3.5 stroke-[2.5]" />
              Mark as read
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
