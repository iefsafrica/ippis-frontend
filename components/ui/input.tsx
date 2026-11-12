import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs transition-all duration-150 focus-visible:outline-none focus-visible:border-[#008751] focus-visible:ring-2 focus-visible:ring-[#008751]/15 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-800",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
