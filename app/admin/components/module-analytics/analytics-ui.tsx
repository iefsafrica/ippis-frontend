"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Calendar,
  ChevronRight,
  ExternalLink,
  Sparkles,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface KpiItem {
  title: string
  value: string | number
  change?: string
  trend?: "up" | "down" | "neutral"
  comparison?: string
  icon: React.ElementType
  theme?: "emerald" | "blue" | "purple" | "amber" | "rose" | "slate"
}

const themeStyles = {
  emerald: {
    bg: "bg-emerald-50 text-emerald-700",
    border: "border-emerald-100",
    badge: "bg-emerald-100 text-emerald-800",
    iconBg: "bg-emerald-100 text-emerald-800",
  },
  blue: {
    bg: "bg-blue-50 text-blue-700",
    border: "border-blue-100",
    badge: "bg-blue-100 text-blue-800",
    iconBg: "bg-blue-100 text-blue-800",
  },
  purple: {
    bg: "bg-purple-50 text-purple-700",
    border: "border-purple-100",
    badge: "bg-purple-100 text-purple-800",
    iconBg: "bg-purple-100 text-purple-800",
  },
  amber: {
    bg: "bg-amber-50 text-amber-700",
    border: "border-amber-100",
    badge: "bg-amber-100 text-amber-800",
    iconBg: "bg-amber-100 text-amber-800",
  },
  rose: {
    bg: "bg-rose-50 text-rose-700",
    border: "border-rose-100",
    badge: "bg-rose-100 text-rose-800",
    iconBg: "bg-rose-100 text-rose-800",
  },
  slate: {
    bg: "bg-slate-50 text-slate-700",
    border: "border-slate-100",
    badge: "bg-slate-100 text-slate-800",
    iconBg: "bg-slate-100 text-slate-800",
  },
}

export function AnalyticsHeader({
  moduleName,
  description,
  badgeText = "Enterprise Module Analytics",
  onRefresh,
}: {
  moduleName: string
  description: string
  badgeText?: string
  onRefresh?: () => void
}) {
  const [period, setPeriod] = useState("30d")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    if (onRefresh) onRefresh()
    setTimeout(() => setIsRefreshing(false), 600)
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="border-emerald-600/40 bg-emerald-50 text-emerald-800 font-semibold gap-1 text-xs">
            <Sparkles className="h-3 w-3 text-emerald-600" />
            {badgeText}
          </Badge>
          <span className="text-[11px] text-slate-400 font-mono">LIVE INTELLIGENCE</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          {moduleName} Analytics
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">{description}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[140px] h-9 text-xs bg-white border-slate-200">
            <Calendar className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="ytd">Year to Date</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          className="h-9 px-3 gap-1.5 text-xs text-slate-700 bg-white border-slate-200 hover:bg-slate-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (typeof window !== "undefined") window.print()
          }}
          className="h-9 px-3 gap-1.5 text-xs text-emerald-800 border-emerald-300 bg-emerald-50 hover:bg-emerald-100 font-semibold"
        >
          <Download className="h-3.5 w-3.5 text-emerald-700" />
          Export Report
        </Button>
      </div>
    </div>
  )
}

export function AnalyticsKpiGrid({
  items,
  kpis,
}: {
  items?: KpiItem[]
  kpis?: KpiItem[]
}) {
  const list = items || kpis || []
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {list.map((kpi, idx) => {
        const theme = themeStyles[kpi.theme || "emerald"]
        const Icon = kpi.icon

        return (
          <Card
            key={idx}
            className={`border ${theme.border} bg-white shadow-xs transition-all hover:shadow-md hover:border-emerald-300`}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {kpi.title}
                </span>
                <div className={`p-2 rounded-xl ${theme.iconBg}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-2.5">
                <div className="text-2xl font-black tracking-tight text-slate-900">
                  {kpi.value}
                </div>
                {kpi.change && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs">
                    <span
                      className={`inline-flex items-center font-bold px-1.5 py-0.5 rounded text-[11px] ${
                        kpi.trend === "down"
                          ? "bg-rose-50 text-rose-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {kpi.trend === "down" ? (
                        <TrendingDown className="h-3 w-3 mr-0.5" />
                      ) : (
                        <TrendingUp className="h-3 w-3 mr-0.5" />
                      )}
                      {kpi.change}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {kpi.comparison || "vs last month"}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export function AnalyticsChartCard({
  title,
  subtitle,
  badge,
  action,
  children,
  className = "",
}: {
  title: string
  subtitle?: string
  badge?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={`border border-slate-200/90 bg-white shadow-xs ${className}`}>
      <CardHeader className="pb-2 pt-4 px-5 border-b border-slate-100 flex flex-row items-center justify-between space-y-0">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-bold text-slate-900">{title}</CardTitle>
            {badge && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-slate-100 text-slate-700 font-semibold">
                {badge}
              </Badge>
            )}
          </div>
          {subtitle && (
            <CardDescription className="text-xs text-slate-500 mt-0.5">{subtitle}</CardDescription>
          )}
        </div>
        {action}
      </CardHeader>
      <CardContent className="p-5">{children}</CardContent>
    </Card>
  )
}

export function QuickNavGrid({
  links = [],
  title = "Module Quick Navigation",
}: {
  links?: {
    title: string
    description: string
    href: string
    icon: React.ElementType
    badge?: string
  }[]
  title?: string
}) {
  const list = links || []
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">{title}</h3>
        <span className="text-xs text-slate-400">Direct Module Links</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {list.map((link, idx) => {
          const Icon = link.icon
          return (
            <Link
              key={idx}
              href={link.href}
              className="group flex flex-col justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/20 hover:shadow-sm transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-emerald-100 group-hover:text-emerald-800 transition-colors">
                    <Icon className="h-4 w-4" />
                  </div>
                  {link.badge && (
                    <Badge variant="outline" className="text-[10px] border-slate-200">
                      {link.badge}
                    </Badge>
                  )}
                </div>
                <div className="text-sm font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">
                  {link.title}
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">{link.description}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-emerald-700 opacity-90 group-hover:opacity-100">
                <span>Manage</span>
                <ChevronRight className="h-3 w-3 transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
