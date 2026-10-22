"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  CalendarDays,
  Bell,
  ArrowRight,
  ShieldAlert,
  FileText,
  Megaphone,
  CheckCircle2,
  Printer,
  RefreshCw,
  Building2,
  Users,
} from "lucide-react"
import { useGetAnnouncements } from "@/services/hooks/organizations/announcement/useAnnouncement"
import type { Announcement } from "@/types/organizations/announcement/announcement-management"

export default function NewsSection() {
  const { data, isLoading, isError, refetch, isFetching } = useGetAnnouncements()
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("All")

  const announcements: Announcement[] = useMemo(() => {
    if (data?.data && Array.isArray(data.data)) {
      return data.data
    }
    if (Array.isArray(data)) {
      return data
    }
    return []
  }, [data])

  const categories = useMemo(() => {
    const cats = new Set<string>()
    cats.add("All")
    announcements.forEach((a) => {
      const cat = a.audience || a.status
      if (cat) cats.add(cat)
    })
    return Array.from(cats)
  }, [announcements])

  const filteredAnnouncements = useMemo(() => {
    if (selectedCategory === "All") return announcements
    return announcements.filter((a) => {
      const cat = (a.audience || a.status || "").toLowerCase()
      return cat === selectedCategory.toLowerCase()
    })
  }, [announcements, selectedCategory])

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Recent"
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  const getStatusBadge = (status?: string) => {
    const s = status?.toLowerCase()
    if (s === "published") {
      return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Published</Badge>
    }
    if (s === "urgent") {
      return <Badge className="bg-rose-100 text-rose-800 border-rose-200">Urgent</Badge>
    }
    return <Badge className="bg-blue-100 text-blue-800 border-blue-200">{status || "Notice"}</Badge>
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <section id="announcements" data-section="news" className="w-full py-16 md:py-24 bg-gray-50/60 border-t border-b">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-semibold text-emerald-800">
              <Megaphone className="h-3.5 w-3.5" />
              Official Bulletins & Notices
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-gray-900">
              Latest IPPIS Announcements & Circulars
            </h2>
            <p className="max-w-[750px] text-gray-600 md:text-lg">
              Official communiqués, payroll timelines, and critical directives published for federal civil servants and MDA desk officers.
            </p>
          </div>

          {/* Dynamic Category Filter Pills */}
          {categories.length > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 pb-4">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3.5 py-1.5 text-xs md:text-sm rounded-full font-medium transition-all ${
                    selectedCategory === category
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3 pt-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse border border-gray-200 bg-white">
                <CardHeader className="space-y-3 pb-3">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
                </CardHeader>
                <CardContent className="space-y-2 pb-4">
                  <div className="h-3 w-full bg-gray-200 rounded"></div>
                  <div className="h-3 w-5/6 bg-gray-200 rounded"></div>
                  <div className="h-3 w-2/3 bg-gray-200 rounded"></div>
                </CardContent>
                <CardFooter className="pt-2 border-t">
                  <div className="h-4 w-28 bg-gray-200 rounded"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && isError && (
          <div className="mx-auto max-w-md pt-8 text-center">
            <Card className="border-red-200 bg-red-50/50 p-6">
              <ShieldAlert className="h-10 w-10 text-red-500 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-900 mb-1">Unable to Load Announcements</h3>
              <p className="text-sm text-gray-600 mb-4">
                We encountered an issue fetching announcements from the server.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="gap-2 border-red-200 hover:bg-red-100"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                Retry
              </Button>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && filteredAnnouncements.length === 0 && (
          <div className="mx-auto max-w-md pt-8 text-center">
            <Card className="border border-dashed border-gray-300 bg-white p-8">
              <Megaphone className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-900 mb-1">No Announcements Published</h3>
              <p className="text-sm text-gray-500 mb-4">
                {selectedCategory !== "All"
                  ? `There are no announcements currently available under "${selectedCategory}".`
                  : "There are currently no active public bulletins or notices. Please check back later."}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                Refresh Feed
              </Button>
            </Card>
          </div>
        )}

        {/* Announcements Grid */}
        {!isLoading && !isError && filteredAnnouncements.length > 0 && (
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3 pt-6">
            {filteredAnnouncements.map((announcement, index) => (
              <Card
                key={announcement.id || index}
                className="flex flex-col justify-between border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <CardHeader className="space-y-2 pb-3">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
                      {formatDate(announcement.publish_date || announcement.created_at)}
                    </span>
                    {getStatusBadge(announcement.status)}
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900 line-clamp-2 hover:text-emerald-700 transition-colors">
                    {announcement.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pb-4">
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {announcement.content}
                  </p>
                  {(announcement.audience || announcement.company_code) && (
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 pt-1">
                      {announcement.audience && (
                        <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                          <Users className="h-3 w-3 text-gray-500" />
                          {announcement.audience}
                        </span>
                      )}
                      {announcement.company_code && (
                        <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                          <Building2 className="h-3 w-3 text-gray-500" />
                          {announcement.company_code}
                        </span>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-3 border-t bg-gray-50/50 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedAnnouncement(announcement)}
                    className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 px-2 text-xs font-semibold gap-1"
                  >
                    Read Full Notice
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* View All Announcements Button */}
        <div className="mt-12 flex justify-center">
          <Link href="/announcements">
            <Button variant="outline" className="gap-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-medium">
              <Megaphone className="h-4 w-4" />
              View All Official Announcements & Circulars
            </Button>
          </Link>
        </div>
      </div>

      {/* Reader Modal */}
      <Dialog open={Boolean(selectedAnnouncement)} onOpenChange={(open) => !open && setSelectedAnnouncement(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedAnnouncement && (
            <>
              <DialogHeader className="space-y-3 border-b pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  {getStatusBadge(selectedAnnouncement.status)}
                  {selectedAnnouncement.audience && (
                    <Badge variant="outline" className="border-gray-300 text-gray-700">
                      Audience: {selectedAnnouncement.audience}
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-xl md:text-2xl font-bold text-gray-900 leading-snug">
                  {selectedAnnouncement.title}
                </DialogTitle>
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
                    Published: {formatDate(selectedAnnouncement.publish_date || selectedAnnouncement.created_at)}
                  </span>
                  {selectedAnnouncement.company_code && (
                    <span className="flex items-center gap-1 font-medium text-gray-700">
                      <Building2 className="h-3.5 w-3.5 text-gray-400" />
                      MDA: {selectedAnnouncement.company_code}
                    </span>
                  )}
                </div>
              </DialogHeader>

              <div className="py-4 text-sm text-gray-800 leading-relaxed whitespace-pre-line space-y-3">
                {selectedAnnouncement.content}
              </div>

              <DialogFooter className="flex sm:justify-between items-center border-t pt-4 gap-2">
                <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 text-xs">
                  <Printer className="h-3.5 w-3.5" />
                  Print Notice
                </Button>
                <Button size="sm" onClick={() => setSelectedAnnouncement(null)} className="bg-emerald-700 hover:bg-emerald-800">
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
