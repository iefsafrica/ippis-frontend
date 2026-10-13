"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  CustomSelect,
  CustomSelectContent,
  CustomSelectItem,
  CustomSelectTrigger,
  CustomSelectValue,
} from "@/components/ui/custom-select"

type DateParts = {
  day: string
  month: string
  year: string
}

export interface DateSelectProps {
  value?: string
  onValueChange: (value: string) => void
  maxDate?: Date
  minYear?: number
  className?: string
  triggerClassName?: string
  error?: boolean
  disabled?: boolean
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const DEFAULT_MIN_YEAR = 1900

const MONTH_MAP: Record<string, string> = {
  jan: "01", january: "01",
  feb: "02", february: "02",
  mar: "03", march: "03",
  apr: "04", april: "04",
  may: "05",
  jun: "06", june: "06",
  jul: "07", july: "07",
  aug: "08", august: "08",
  sep: "09", sept: "09", september: "09",
  oct: "10", october: "10",
  nov: "11", november: "11",
  dec: "12", december: "12",
}

export const parseDateValue = (value?: string): DateParts => {
  if (!value) {
    return { day: "", month: "", year: "" }
  }

  const trimmed = String(value).trim()
  if (!trimmed) {
    return { day: "", month: "", year: "" }
  }

  // 1. Match YYYY-MM-DD or YYYY-M-D or with slashes YYYY/MM/DD
  const isoMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/)
  if (isoMatch) {
    return {
      year: isoMatch[1],
      month: isoMatch[2].padStart(2, "0"),
      day: isoMatch[3].padStart(2, "0"),
    }
  }

  // 2. Day-Month-Year e.g. DD-MM-YYYY or DD/MM/YYYY or DD.MM.YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/)
  if (dmyMatch) {
    return {
      year: dmyMatch[3],
      month: dmyMatch[2].padStart(2, "0"),
      day: dmyMatch[1].padStart(2, "0"),
    }
  }

  // 3. Named month formats e.g. 15-AUG-1990, 15-Aug-1990, 15 Aug 1990, Aug 15 1990, 1990-Aug-15
  const cleanTokens = trimmed.replace(/,/g, " ").split(/[-/.\s]+/).filter(Boolean)
  if (cleanTokens.length >= 3) {
    const yearIndex = cleanTokens.findIndex((t) => /^\d{4}$/.test(t))
    if (yearIndex !== -1) {
      const year = cleanTokens[yearIndex]
      const otherTokens = cleanTokens.filter((_, idx) => idx !== yearIndex)
      
      const monthNameIndex = otherTokens.findIndex((t) => MONTH_MAP[t.toLowerCase()])
      if (monthNameIndex !== -1) {
        const month = MONTH_MAP[otherTokens[monthNameIndex].toLowerCase()]
        const dayToken = otherTokens.find((_, idx) => idx !== monthNameIndex)
        if (dayToken && /^\d{1,2}$/.test(dayToken)) {
          return {
            year,
            month,
            day: dayToken.padStart(2, "0"),
          }
        }
      } else {
        const [n1, n2] = otherTokens.map((t) => t.padStart(2, "0"))
        if (Number(n1) > 12) {
          return { year, month: n2, day: n1 }
        } else if (Number(n2) > 12) {
          return { year, month: n1, day: n2 }
        } else {
          return { year, month: n2, day: n1 }
        }
      }
    }
  }

  // 4. Fallback to JS Date parse
  const timestamp = Date.parse(trimmed)
  if (!isNaN(timestamp)) {
    const d = new Date(timestamp)
    return {
      year: String(d.getFullYear()),
      month: String(d.getMonth() + 1).padStart(2, "0"),
      day: String(d.getDate()).padStart(2, "0"),
    }
  }

  return { day: "", month: "", year: "" }
}

const getDaysInMonth = (year: string, month: string) => {
  if (!year || !month) {
    return 31
  }

  return new Date(Number(year), Number(month), 0).getDate()
}

const isSameOrBeforeMaxDate = (year: string, month: string, day: string, maxDate: Date) => {
  const candidate = new Date(Number(year), Number(month) - 1, Number(day))
  const max = new Date(maxDate)

  candidate.setHours(0, 0, 0, 0)
  max.setHours(0, 0, 0, 0)

  return candidate.getTime() <= max.getTime()
}

export function DateSelect({
  value,
  onValueChange,
  maxDate = new Date(),
  minYear = DEFAULT_MIN_YEAR,
  className,
  triggerClassName,
  error,
  disabled,
}: DateSelectProps) {
  const maxYear = maxDate.getFullYear()
  const maxMonth = maxDate.getMonth() + 1
  const maxDay = maxDate.getDate()

  const [parts, setParts] = React.useState<DateParts>(() => parseDateValue(value))

  React.useEffect(() => {
    if (!value) {
      setParts({ day: "", month: "", year: "" })
      return
    }

    const parsed = parseDateValue(value)
    if (parsed.year && parsed.month && parsed.day) {
      setParts(parsed)
      const canonical = `${parsed.year}-${parsed.month}-${parsed.day}`
      if (value !== canonical) {
        onValueChange(canonical)
      }
    } else {
      setParts({ day: "", month: "", year: "" })
    }
  }, [value, onValueChange])

  const emitValue = (nextParts: DateParts) => {
    const { year, month, day } = nextParts

    if (!year || !month || !day) {
      onValueChange("")
      return
    }

    if (!isSameOrBeforeMaxDate(year, month, day, maxDate)) {
      onValueChange("")
      return
    }

    onValueChange(`${year}-${month}-${day}`)
  }

  const updateParts = (nextParts: DateParts) => {
    setParts(nextParts)
    emitValue(nextParts)
  }

  const handleYearChange = (year: string) => {
    const maxDays = getDaysInMonth(year, parts.month)
    const day = parts.day && Number(parts.day) <= maxDays ? parts.day : ""
    updateParts({ ...parts, year, day })
  }

  const handleMonthChange = (month: string) => {
    const maxDays = getDaysInMonth(parts.year, month)
    const day = parts.day && Number(parts.day) <= maxDays ? parts.day : ""
    updateParts({ ...parts, month, day })
  }

  const handleDayChange = (day: string) => {
    updateParts({ ...parts, day })
  }

  const availableMonths = React.useMemo(() => {
    return MONTHS.map((label, index) => {
      const monthNumber = index + 1
      const disabledMonth = parts.year === String(maxYear) && monthNumber > maxMonth

      return {
        value: String(monthNumber).padStart(2, "0"),
        label,
        disabled: disabledMonth,
      }
    })
  }, [maxMonth, maxYear, parts.year])

  const availableDays = React.useMemo(() => {
    const daysInMonth = getDaysInMonth(parts.year, parts.month)
    const limit = parts.year === String(maxYear) && parts.month === String(maxMonth).padStart(2, "0")
      ? Math.min(daysInMonth, maxDay)
      : daysInMonth

    return Array.from({ length: limit }, (_, index) => {
      const day = String(index + 1).padStart(2, "0")
      return {
        value: day,
        label: String(index + 1),
      }
    })
  }, [maxDay, maxMonth, maxYear, parts.month, parts.year])

  const years = React.useMemo(() => {
    const output: string[] = []
    const startYear = Math.min(minYear, parts.year ? Number(parts.year) : minYear)
    for (let year = maxYear; year >= startYear; year -= 1) {
      output.push(String(year))
    }
    return output
  }, [maxYear, minYear, parts.year])

  return (
    <div className={cn("grid gap-2 sm:grid-cols-3", className)}>
      <CustomSelect value={parts.day} onValueChange={handleDayChange} disabled={disabled}>
        <CustomSelectTrigger className={cn(triggerClassName, error && "border-red-500 focus:ring-red-500")}>
          <CustomSelectValue placeholder="Day">
            {parts.day ? String(Number(parts.day)) : undefined}
          </CustomSelectValue>
        </CustomSelectTrigger>
        <CustomSelectContent>
          {availableDays.map((day) => (
            <CustomSelectItem key={day.value} value={day.value}>
              {day.label}
            </CustomSelectItem>
          ))}
        </CustomSelectContent>
      </CustomSelect>

      <CustomSelect value={parts.month} onValueChange={handleMonthChange} disabled={disabled}>
        <CustomSelectTrigger className={cn(triggerClassName, error && "border-red-500 focus:ring-red-500")}>
          <CustomSelectValue placeholder="Month">
            {parts.month && MONTHS[Number(parts.month) - 1] ? MONTHS[Number(parts.month) - 1] : undefined}
          </CustomSelectValue>
        </CustomSelectTrigger>
        <CustomSelectContent>
          {availableMonths.map((month) => (
            <CustomSelectItem key={month.value} value={month.value} disabled={month.disabled}>
              {month.label}
            </CustomSelectItem>
          ))}
        </CustomSelectContent>
      </CustomSelect>

      <CustomSelect value={parts.year} onValueChange={handleYearChange} disabled={disabled}>
        <CustomSelectTrigger className={cn(triggerClassName, error && "border-red-500 focus:ring-red-500")}>
          <CustomSelectValue placeholder="Year">
            {parts.year || undefined}
          </CustomSelectValue>
        </CustomSelectTrigger>
        <CustomSelectContent>
          {years.map((year) => (
            <CustomSelectItem key={year} value={year}>
              {year}
            </CustomSelectItem>
          ))}
        </CustomSelectContent>
      </CustomSelect>
    </div>
  )
}
