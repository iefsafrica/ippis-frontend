"use client"

import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FilterIcon } from "lucide-react"
import { useMemo, useState } from "react"

const presetOptions = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7", label: "Last 7 days" },
  { value: "last30", label: "Last 30 days" },
  { value: "thisMonth", label: "This month" },
  { value: "lastMonth", label: "Last month" },
  { value: "thisYear", label: "This year" },
  { value: "custom", label: "Custom range" },
]

export function DateFilter() {
  const [preset, setPreset] = useState("last30")
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()

  const customDatePickers = useMemo(
    () => (
      <div className="flex flex-wrap gap-2">
        <div className="flex-1 min-w-[180px]">
          <label className="text-xs font-medium text-gray-500">Start date</label>
          <DatePicker
            value={startDate}
            onValueChange={setStartDate}
            placeholder="Start date"
            className="w-full mt-1"
          />
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="text-xs font-medium text-gray-500">End date</label>
          <DatePicker
            value={endDate}
            onValueChange={setEndDate}
            placeholder="End date"
            className="w-full mt-1"
          />
        </div>
      </div>
    ),
    [startDate, endDate],
  )

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <Select value={preset} onValueChange={setPreset}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select date range" />
        </SelectTrigger>
        <SelectContent>
          {presetOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {preset === "custom" && customDatePickers}

      <Select defaultValue="all">
        <SelectTrigger className="w-[180px] transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500">
          <SelectValue placeholder="Department" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Departments</SelectItem>
          <SelectItem value="finance">Finance</SelectItem>
          <SelectItem value="hr">Human Resources</SelectItem>
          <SelectItem value="it">Information Technology</SelectItem>
          <SelectItem value="operations">Operations</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" className="gap-2">
        <FilterIcon className="h-4 w-4" />
        More Filters
      </Button>

      <Button className="ml-auto">Apply Filters</Button>
    </div>
  )
}
