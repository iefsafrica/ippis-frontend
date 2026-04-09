import type { ReactNode } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface RecordsTableSectionProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function RecordsTableSection({
  title,
  description,
  children,
  className,
}: RecordsTableSectionProps) {
  return (
    <Card className={cn("border border-gray-200 shadow-lg rounded-xl overflow-hidden", className)}>
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div>
          <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
          {description && (
            <CardDescription className="text-gray-600">{description}</CardDescription>
          )}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
