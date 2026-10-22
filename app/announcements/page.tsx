"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Megaphone,
  Search,
  CalendarDays,
  FileText,
  Printer,
  ArrowRight,
  ChevronRight,
  Home,
  BookOpen,
  Ticket,
  RefreshCw,
  Building2,
  Users,
  ShieldAlert,
} from "lucide-react"
import { useGetAnnouncements } from "@/services/hooks/organizations/announcement/useAnnouncement"
import type { Announcement } from "@/types/organizations/announcement/announcement-management"

export default function AnnouncementsPage() {
  const { data, isLoading, isError, refetch, isFetching } = useGetAnnouncements()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)

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

  const filtered = useMemo(() => {
    return announcements.filter((item) => {
      const cat = (item.audience || item.status || "").toLowerCase()
      const matchCat = selectedCategory === "All" || cat === selectedCategory.toLowerCase()
      const matchQuery =
        !searchQuery.trim() ||
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.company_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.audience?.toLowerCase().includes(searchQuery.toLowerCase())

      return matchCat && matchQuery
    })
  }, [announcements, selectedCategory, searchQuery])

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
    <div className="flex min-h-screen flex-col bg-gray-50/50">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b bg-white">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center">
              <div className="relative h-10 w-10 overflow-hidden rounded-md mr-2 border border-gray-200">
                <Image src="/images/ippis-logo.jpeg" alt="IPPIS Logo" width={40} height={40} className="object-contain" />
              </div>
              <span className="text-xl font-bold text-gray-900">IPPIS</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-gray-700 hover:text-emerald-700">
              Home
            </Link>
            <Link href="/announcements" className="text-sm font-bold text-emerald-700 flex items-center gap-1.5">
              <Megaphone className="h-3.5 w-3.5" />
              Announcements
            </Link>
            <Link href="/knowledge-base" className="text-sm font-medium text-gray-700 hover:text-emerald-700 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
              Knowledge Base
            </Link>
            <Link href="/#tickets" className="text-sm font-medium text-gray-700 hover:text-emerald-700 flex items-center gap-1.5">
              <Ticket className="h-3.5 w-3.5 text-emerald-600" />
              Support Tickets
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="outline" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/portal">
              <Button size="sm" className="bg-[#008751] hover:bg-[#007043] text-white">
                Employee Portal
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-gray-900 to-emerald-950 text-white py-14 px-4 text-center">
        <div className="container max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-700/60 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-medium text-emerald-100">
            <Megaphone className="h-3.5 w-3.5" />
            Official Civil Service Communiqués
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            IPPIS Announcements & Circulars
          </h1>
          <p className="text-emerald-100 text-sm md:text-base max-w-2xl mx-auto">
            Stay up to date with official directives, payroll timelines, system maintenance windows, and MDA guidelines issued by the Federal Government.
          </p>

          {/* Search Box */}
          <div className="pt-4 max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search announcements by title, keyword, or MDA code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 pl-12 pr-4 rounded-full bg-white text-gray-900 shadow-lg text-sm border-0 focus-visible:ring-2 focus-visible:ring-emerald-400"
            />
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="container max-w-6xl mx-auto py-10 px-4 flex-1">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:text-emerald-700 flex items-center gap-1">
            <Home className="h-3.5 w-3.5" />
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-900 font-medium">Announcements & Circulars</span>
        </div>

        {/* Dynamic Category Filter */}
        {categories.length > 1 && (
          <div className="flex items-center gap-2 flex-wrap mb-8 pb-3 border-b border-gray-200">
            <span className="text-xs font-semibold text-gray-500 mr-2">Category:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3.5 py-1.5 rounded-full transition-all font-medium ${
                  selectedCategory === cat
                    ? "bg-[#008751] text-white shadow-xs"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
          <div className="mx-auto max-w-md py-12 text-center">
            <Card className="border-red-200 bg-red-50/50 p-6">
              <ShieldAlert className="h-10 w-10 text-red-500 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-900 mb-1">Unable to Load Announcements</h3>
              <p className="text-sm text-gray-600 mb-4">
                We encountered an error fetching announcements from the server.
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
        {!isLoading && !isError && filtered.length === 0 && (
          <div className="mx-auto max-w-md py-12 text-center">
            <Card className="border border-dashed border-gray-300 bg-white p-8">
              <Megaphone className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-900 mb-1">No Announcements Found</h3>
              <p className="text-sm text-gray-500 mb-4">
                {searchQuery
                  ? `No announcements matched your search for "${searchQuery}".`
                  : "There are currently no active announcements published. Please check back later."}
              </p>
              <div className="flex justify-center gap-2">
                {searchQuery && (
                  <Button variant="outline" size="sm" onClick={() => setSearchQuery("")}>
                    Clear Search
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Announcements Grid */}
        {!isLoading && !isError && filtered.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((announcement, index) => (
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
      </main>

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
    </div>
  )
}
