import type React from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"

interface FinanceCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: number
  trendLabel?: string
  footer?: React.ReactNode
  className?: string
  valueClassName?: string
  isLoading?: boolean
  currencySymbol?: string
  isCurrency?: boolean
}

export function FinanceCard({
  title,
  value,
  description,
  icon,
  trend,
  trendLabel,
  footer,
  className,
  valueClassName,
  isLoading = false,
  currencySymbol = "$",
  isCurrency = false,
}: FinanceCardProps) {
  const formattedValue = isCurrency
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        currencyDisplay: "symbol",
      })
        .format(Number(value))
        .replace("$", currencySymbol)
    : value

  const trendIcon =
    trend !== undefined ? (
      trend > 0 ? (
        <ArrowUpIcon className="h-4 w-4 text-green-500" />
      ) : trend < 0 ? (
        <ArrowDownIcon className="h-4 w-4 text-red-500" />
      ) : null
    ) : null

  const trendColor = trend !== undefined ? (trend > 0 ? "text-green-500" : trend < 0 ? "text-red-500" : "") : ""

  return (
    <Card className={cn("overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm", className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">{title}</CardTitle>
          {trend !== undefined && trendLabel ? (
            <p className="text-xs text-slate-500">{trendLabel}</p>
          ) : null}
        </div>
        {icon ? <div className="rounded-2xl border border-slate-100 bg-slate-50 p-2 text-slate-500">{icon}</div> : null}
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
          </div>
        ) : (
          <>
            <div className={cn("text-3xl font-semibold tracking-tight text-slate-950", valueClassName)}>{formattedValue}</div>
            {description && <p className="text-xs text-slate-500">{description}</p>}
            {trend !== undefined && (
              <div className="flex items-center gap-1 pt-1">
                {trendIcon}
                <span className={cn("text-xs font-medium", trendColor)}>
                  {Math.abs(trend)}% {trend > 0 ? "increase" : trend < 0 ? "decrease" : "no change"}
                </span>
              </div>
            )}
          </>
        )}
      </CardContent>
      {footer && <CardFooter className="pt-0">{footer}</CardFooter>}
    </Card>
  )
}
