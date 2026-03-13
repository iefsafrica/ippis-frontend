"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const wrapAsterisks = (child: React.ReactNode, childIndex: number) => {
  if (typeof child !== "string") return child

  const parts = child.split("*")
  if (parts.length === 1) return child

  return (
    <React.Fragment key={`label-text-${childIndex}`}>
      {parts.map((segment, index) => (
        <React.Fragment key={`label-part-${childIndex}-${index}`}>
          {segment}
          {index < parts.length - 1 && (
            <span className="text-red-500" key={`asterisk-${childIndex}-${index}`}>
              *
            </span>
          )}
        </React.Fragment>
      ))}
    </React.Fragment>
  )
}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, children, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  >
    {React.Children.map(children, wrapAsterisks)}
  </LabelPrimitive.Root>
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
