"use client"

import type React from "react"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Bell, FileText, UserPlus, AlertTriangle, Info, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface NotificationProps {
  notification: {
    id: string
    title: string
    message: string
    type: string
    read: boolean
    createdAt: string
  }
  onRead: () => void
}

export function NotificationItem({ notification, onRead }: NotificationProps) {
  const [isRead, setIsRead] = useState(notification.read)

  const handleClick = (e: React.MouseEvent) => {
    // Prevent event bubbling
    e.stopPropagation()

    if (!isRead) {
      setIsRead(true)
      onRead()
    }
  }

  const getIcon = () => {
    switch (notification.type) {
      case "registration":
        return <UserPlus className="h-5 w-5 text-primary" />
      case "document":
        return <FileText className="h-5 w-5 text-blue-500" />
      case "alert":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case "system":
        return <Info className="h-5 w-5 text-purple-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getTimeAgo = () => {
    try {
      return formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
    } catch (error) {
      return "recently"
    }
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 cursor-pointer transition-colors rounded-lg mx-1 my-0.5",
        isRead ? "bg-white hover:bg-gray-50" : "bg-primary/5 hover:bg-primary/10",
      )}
      onClick={handleClick}
    >
      <div className={cn("flex-shrink-0 rounded-full p-2", isRead ? "bg-gray-100" : "bg-primary/10")}>{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className={cn("text-sm font-medium line-clamp-1", isRead ? "text-gray-900" : "text-primary")}>
            {notification.title}
          </h4>
          {!isRead && <span className="flex-shrink-0 rounded-full bg-primary w-2 h-2" />}
        </div>
        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{notification.message}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500">{getTimeAgo()}</span>
          {!isRead && (
            <button
              className="text-xs text-primary flex items-center gap-0.5 hover:underline"
              onClick={(e) => {
                e.stopPropagation()
                setIsRead(true)
                onRead()
              }}
            >
              <Check className="h-3 w-3" /> Mark as read
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
