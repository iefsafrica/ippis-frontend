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
              "w-[280px] justify-between text-left font-normal",
              !value && "text-muted-foreground",
              className,
            )}
          >
            <span>{formatted}</span>
            <CalendarIcon className="h-4 w-4" />
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
