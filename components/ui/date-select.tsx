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

const parseDateValue = (value?: string): DateParts => {
  if (!value) {
    return { day: "", month: "", year: "" }
  }

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) {
    return { day: "", month: "", year: "" }
  }

  return {
    year: match[1],
    month: match[2],
    day: match[3],
  }
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
    }
  }, [value])

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
    for (let year = maxYear; year >= minYear; year -= 1) {
      output.push(String(year))
    }
    return output
  }, [maxYear, minYear])

  return (
    <div className={cn("grid gap-2 sm:grid-cols-3", className)}>
      <CustomSelect value={parts.day} onValueChange={handleDayChange} disabled={disabled}>
        <CustomSelectTrigger className={cn(triggerClassName, error && "border-red-500 focus:ring-red-500")}>
          <CustomSelectValue placeholder="Day" />
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
          <CustomSelectValue placeholder="Month" />
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
          <CustomSelectValue placeholder="Year" />
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
