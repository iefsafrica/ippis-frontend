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
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
          </div>
        ) : (
          <>
            <div className={cn("text-2xl font-bold", valueClassName)}>{formattedValue}</div>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
            {trend !== undefined && (
              <div className="flex items-center mt-1">
                {trendIcon}
                <span className={cn("text-xs font-medium ml-1", trendColor)}>
                  {Math.abs(trend)}% {trend > 0 ? "increase" : trend < 0 ? "decrease" : ""}
                </span>
                {trendLabel && <span className="text-xs text-muted-foreground ml-1">{trendLabel}</span>}
              </div>
            )}
          </>
        )}
      </CardContent>
      {footer && <CardFooter className="pt-0">{footer}</CardFooter>}
    </Card>
  )
}
