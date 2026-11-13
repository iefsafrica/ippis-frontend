"use client";

import React from "react";
import Link from "next/link";
import {
  RefreshCw,
  Printer,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface KpiItem {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  comparison?: string;
  icon: React.ElementType;
  theme?: "emerald" | "blue" | "purple" | "amber" | "rose" | "slate";
}

interface AnalyticsHeaderProps {
  moduleName: string;
  description: string;
  badgeText?: string;
  onRefresh?: () => void;
  onPrint?: () => void;
  onExport?: () => void;
}

export function AnalyticsHeader({
  moduleName,
  description,
  badgeText = "Live Analytics",
  onRefresh,
  onPrint,
  onExport,
}: AnalyticsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 truncate">
            {moduleName}
          </h1>
          {badgeText && (
            <Badge className="rounded-full bg-[#0B4628]/10 text-[#0B4628] border border-[#0B4628]/20 hover:bg-[#0B4628]/15 px-3 py-0.5 text-xs font-semibold">
              <Sparkles className="mr-1 h-3 w-3 text-[#10B981]" />
              {badgeText}
            </Badge>
          )}
        </div>
        <p className="text-sm text-slate-500">{description}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="rounded-full bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50 hover:text-[#0B4628] shadow-2xs"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Refresh
          </Button>
        )}
        {onPrint && (
          <Button
            variant="outline"
            size="sm"
            onClick={onPrint}
            className="rounded-full bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50 hover:text-[#0B4628] shadow-2xs"
          >
            <Printer className="mr-1.5 h-3.5 w-3.5" />
            Print
          </Button>
        )}
        {onExport && (
          <Button
            size="sm"
            onClick={onExport}
            className="rounded-full bg-[#0B4628] hover:bg-[#08351E] text-white shadow-sm"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export
          </Button>
        )}
      </div>
    </div>
  );
}

interface AnalyticsKpiGridProps {
  items?: KpiItem[];
  kpis?: KpiItem[];
}

export function AnalyticsKpiGrid({ items, kpis }: AnalyticsKpiGridProps) {
  const list = items ?? kpis ?? [];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {list.map((item, idx) => {
        const Icon = item.icon;
        const isHero = idx === 0;
        const isUp = item.trend === "up";
        const isDown = item.trend === "down";

        return (
          <div
            key={`${item.title}-${idx}`}
            className={cn(
              "relative overflow-hidden rounded-2xl p-5 transition-all duration-200",
              isHero
                ? "bg-[#0B4628] text-white shadow-md shadow-[#0B4628]/15"
                : "bg-white text-slate-900 border border-slate-200/70 shadow-2xs hover:shadow-sm"
            )}
          >
            {/* Subtle decorative dot pattern on hero card */}
            {isHero && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-4 -top-4 h-28 w-28 rounded-full bg-white/5 blur-xl"
              />
            )}

            <div className="flex items-start justify-between gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  isHero
                    ? "bg-white/15 text-white"
                    : "bg-slate-100 text-[#0B4628]"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>

              {item.change && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    isHero
                      ? isDown
                        ? "bg-rose-500 text-white"
                        : "bg-[#22C55E] text-white"
                      : isDown
                      ? "bg-rose-500 text-white"
                      : isUp
                      ? "bg-[#22C55E] text-white"
                      : "bg-slate-100 text-slate-600"
                  )}
                >
                  {isUp && <ArrowUpRight className="h-3 w-3" />}
                  {isDown && <ArrowDownRight className="h-3 w-3" />}
                  {!isUp && !isDown && <Minus className="h-3 w-3" />}
                  {item.change}
                </span>
              )}
            </div>

            <div className="mt-4">
              <p
                className={cn(
                  "text-xs font-medium",
                  isHero ? "text-emerald-100/85" : "text-slate-500"
                )}
              >
                {item.title}
              </p>
              <div className="mt-1 flex items-baseline justify-between gap-2">
                <span
                  className={cn(
                    "text-2xl sm:text-3xl font-bold tracking-tight tabular-nums",
                    isHero ? "text-white" : "text-slate-900"
                  )}
                >
                  {item.value}
                </span>
                {item.comparison && (
                  <span
                    className={cn(
                      "text-[11px] leading-tight text-right max-w-[110px]",
                      isHero ? "text-emerald-100/75" : "text-slate-400"
                    )}
                  >
                    {item.comparison}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface AnalyticsChartCardProps {
  title: string;
  subtitle?: string;
  badge?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function AnalyticsChartCard({
  title,
  subtitle,
  badge,
  action,
  children,
  className,
}: AnalyticsChartCardProps) {
  return (
    <Card
      className={cn(
        "rounded-2xl border border-slate-200/70 bg-white shadow-2xs overflow-hidden",
        className
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3 border-b border-slate-100/80">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base sm:text-lg font-bold text-slate-900 truncate">
              {title}
            </CardTitle>
            {badge && (
              <Badge
                variant="outline"
                className="rounded-full bg-emerald-50 text-[#0B4628] border-emerald-200/80 text-[11px] font-semibold"
              >
                {badge}
              </Badge>
            )}
          </div>
          {subtitle && (
            <CardDescription className="text-xs sm:text-sm text-slate-500">
              {subtitle}
            </CardDescription>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </CardHeader>
      <CardContent className="pt-4">{children}</CardContent>
    </Card>
  );
}

interface QuickNavLink {
  title: string;
  description?: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

interface QuickNavGridProps {
  links: QuickNavLink[];
  title?: string;
}

export function QuickNavGrid({
  links,
  title = "Quick Navigation",
}: QuickNavGridProps) {
  return (
    <Card className="rounded-2xl border border-slate-200/70 bg-white shadow-2xs overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-100/80">
        <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200/70 bg-slate-50/50 p-3.5 transition-all hover:border-[#0B4628]/30 hover:bg-emerald-50/40 hover:shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#0B4628] shadow-2xs border border-slate-200/60 group-hover:bg-[#0B4628] group-hover:text-white transition-colors">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-[#0B4628]">
                        {link.title}
                      </p>
                      {link.badge && (
                        <Badge className="rounded-full bg-[#0B4628]/10 text-[#0B4628] text-[10px] px-1.5 py-0">
                          {link.badge}
                        </Badge>
                      )}
                    </div>
                    {link.description && (
                      <p className="text-xs text-slate-500 truncate">
                        {link.description}
                      </p>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-[#0B4628] group-hover:translate-x-0.5 transition-all" />
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
