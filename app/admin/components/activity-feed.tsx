"use client"

import { CheckCircle, AlertCircle, Clock, RefreshCw, Plus } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function ActivityFeed({ activities = [] }) {
  if (!activities.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px] text-gray-500">
        <RefreshCw className="h-8 w-8 mb-2 text-gray-300" />
        <p className="text-sm">No recent activities</p>
      </div>
    )
  }

  const getActionIcon = (action) => {
    switch (action) {
      case "approved":
      case "verified":
        return <CheckCircle className="h-4 w-4 text-[#008751]" />
      case "rejected":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />
      case "created":
      case "added":
        return <Plus className="h-4 w-4 text-[#008751]" />
      default:
        return <RefreshCw className="h-4 w-4 text-gray-500" />
    }
  }

  const getActionColor = (action) => {
    switch (action) {
      case "approved":
      case "verified":
      case "created":
      case "added":
        return "bg-[#008751]/10 text-[#008751]"
      case "rejected":
        return "bg-red-100 text-red-600"
      case "pending":
        return "bg-amber-100 text-amber-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  const getUserInitials = (name) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-start space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className={getActionColor(activity.action)}>
              {getUserInitials(activity.user)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-900">{activity.user}</span>
              <span className="mx-1.5 text-gray-500">•</span>
              <span className="text-xs text-gray-500">{activity.time}</span>
            </div>
            <p className="text-sm text-gray-700">{activity.description}</p>
            <div className="flex items-center text-xs">
              {getActionIcon(activity.action)}
              <span className={`ml-1 ${getActionColor(activity.action)}`}>
                {activity.action.charAt(0).toUpperCase() + activity.action.slice(1)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
