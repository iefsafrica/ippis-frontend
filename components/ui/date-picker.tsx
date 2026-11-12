"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export interface DatePickerProps {
  value?: Date
  onValueChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
}

const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  ({ value, onValueChange, placeholder = "Select date", className }, ref) => {
    const [open, setOpen] = React.useState(false)

    const handleSelect = (date: Date | undefined) => {
      onValueChange?.(date)
      setOpen(false)
    }

    const formatted = value ? format(value, "PPP") : placeholder

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            data-empty={!value}
            className={cn(
              "w-full h-10 justify-between text-left font-normal rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-2xs hover:bg-slate-50/70 focus-visible:outline-none focus-visible:border-[#008751] focus-visible:ring-2 focus-visible:ring-[#008751]/15 transition-all",
              !value && "text-slate-400 dark:text-slate-500",
              className,
            )}
          >
            <span className="truncate">{formatted}</span>
            <CalendarIcon className="h-4 w-4 shrink-0 text-slate-400" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white/95 shadow-lg border border-border text-popover-foreground backdrop-blur z-[1000] pointer-events-auto">
          <Calendar mode="single" selected={value} onSelect={handleSelect} />
        </PopoverContent>
      </Popover>
    )
  },
)

DatePicker.displayName = "DatePicker"

export { DatePicker }
