"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow, format } from "date-fns"
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  RefreshCw,
  UserPlus,
  FileText,
  AlertTriangle,
  Info,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "@/services/endpoints/notifications/notifications"
import { NotificationItemData } from "@/types/notifications"
import { cn } from "@/lib/utils"

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<NotificationItemData[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetchNotifications()
      if (res && Array.isArray(res.notifications)) {
        setNotifications(res.notifications)
      }
    } catch (err) {
      console.error("Error loading notifications:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const unreadCount = notifications.filter((n) => !(n.read ?? n.is_read)).length

  const handleMarkAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true, is_read: true } : n))
    )
    await markNotificationAsRead(id)
  }

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true, is_read: true }))
    )
    await markAllNotificationsAsRead()
  }

  const handleDelete = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    await deleteNotification(id)
  }

  const filteredNotifications = notifications.filter((n) => {
    const isRead = Boolean(n.read ?? n.is_read)
    if (filter === "unread" && isRead) return false
    if (filter === "read" && !isRead) return false

    if (typeFilter !== "all" && n.type?.toLowerCase() !== typeFilter.toLowerCase()) {
      return false
    }

    return true
  })

  const getIcon = (type: string) => {
    switch (type?.toLowerCase()) {
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

  const getIconWrapperClass = (type: string) => {
    switch (type?.toLowerCase()) {
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Notification Center
            </h1>
            {unreadCount > 0 && (
              <Badge className="bg-[#C91A25] hover:bg-[#C91A25] text-white px-2.5 py-0.5 rounded-full font-bold">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Real-time activity logs, administrative alerts, and system notices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData()}
            className="h-9 gap-1.5"
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-9 gap-1.5 bg-[#008751] hover:bg-[#006b40] text-white"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <Tabs
            value={filter}
            onValueChange={(val) => setFilter(val as any)}
            className="w-full sm:w-auto"
          >
            <TabsList className="bg-gray-100/80 p-1">
              <TabsTrigger value="all" className="text-xs px-3">
                All ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread" className="text-xs px-3">
                Unread ({unreadCount})
              </TabsTrigger>
              <TabsTrigger value="read" className="text-xs px-3">
                Read ({notifications.length - unreadCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs text-gray-500 font-medium whitespace-nowrap flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" /> Type:
            </span>
            {["all", "registration", "document", "system", "alert"].map((t) => (
              <Button
                key={t}
                variant={typeFilter === t ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setTypeFilter(t)}
                className={cn(
                  "h-7 text-xs px-2.5 rounded-full capitalize",
                  typeFilter === t
                    ? "bg-gray-900 text-white hover:bg-gray-800"
                    : "text-gray-600 hover:text-gray-900",
                )}
              >
                {t}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-white rounded-2xl border border-gray-100 shadow-sm animate-pulse"
              />
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-200 bg-white/50">
            <CardContent className="py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#008751] flex items-center justify-center mx-auto mb-4">
                <Check className="h-7 w-7" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">
                No notifications match your filter
              </h3>
              <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                There are currently no active notifications for the selected category.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notif) => {
            const isRead = Boolean(notif.read ?? notif.is_read)
            const dateVal = notif.createdAt || notif.created_at
            const targetUrl = notif.actionUrl || notif.action_url

            return (
              <div
                key={notif.id}
                className={cn(
                  "p-4 rounded-2xl border transition-all duration-150 flex items-start gap-4 bg-white shadow-sm hover:shadow-md",
                  !isRead && "border-emerald-200/80 bg-[#F4FAF6]",
                )}
              >
                <div
                  className={cn(
                    "flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center mt-0.5",
                    getIconWrapperClass(notif.type),
                  )}
                >
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <h4
                        className={cn(
                          "text-base font-semibold",
                          isRead ? "text-gray-900" : "text-[#008751]",
                        )}
                      >
                        {notif.title}
                      </h4>
                      {!isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#008751]" />
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-xs text-gray-500">
                        {dateVal
                          ? formatDistanceToNow(new Date(dateVal), { addSuffix: true })
                          : "recently"}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[11px] capitalize font-medium">
                        {notif.type}
                      </Badge>
                      {dateVal && (
                        <span className="text-[11px] text-gray-400">
                          {format(new Date(dateVal), "MMM d, yyyy · h:mm a")}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {targetUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(targetUrl)}
                          className="h-8 text-xs text-[#008751] hover:text-[#006b40] hover:bg-[#008751]/10 gap-1 font-semibold"
                        >
                          View Action
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      )}

                      {!isRead && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="h-8 text-xs gap-1 border-emerald-300 text-[#008751] hover:bg-[#008751]/10"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Mark read
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(notif.id)}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete notification"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
