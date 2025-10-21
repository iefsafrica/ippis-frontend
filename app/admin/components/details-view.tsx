"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Edit, Download, Printer, ArrowLeft, Eye, FileText, Clock } from "lucide-react"
import { format } from "date-fns"

export interface DetailField {
  label: string
  value: any
  type?: "text" | "date" | "status" | "badge" | "image" | "email" | "phone" | "url" | "currency" | "percent" | "file"
  options?: {
    format?: string
    currency?: string
    statusMap?: Record<string, { label: string; color: string }>
  }
}

export interface DetailSection {
  title: string
  fields: DetailField[]
}

export interface DetailTab {
  id: string
  label: string
  sections: DetailSection[]
  content?: React.ReactNode
}

interface DetailsViewProps {
  title: string
  subtitle?: string
  data: Record<string, any>
  tabs: DetailTab[]
  onEdit?: () => void
  onBack?: () => void
  onPrint?: () => void
  onExport?: () => void
  actions?: React.ReactNode
  headerContent?: React.ReactNode
  footerContent?: React.ReactNode
}

export function DetailsView({
  title,
  subtitle,
  data,
  tabs,
  onEdit,
  onBack,
  onPrint,
  onExport,
  actions,
  headerContent,
  footerContent,
}: DetailsViewProps) {
  const renderFieldValue = (field: DetailField) => {
    const { value, type = "text", options = {} } = field

    if (value === null || value === undefined || value === "") {
      return <span className="text-gray-400">Not provided</span>
    }

    switch (type) {
      case "date":
        try {
          const date = new Date(value)
          return format(date, options.format || "PPP")
        } catch (error) {
          return value
        }

      case "status":
        const statusConfig = options.statusMap?.[value] || { label: value, color: "bg-gray-100 text-gray-800" }
        return <Badge className={statusConfig.color}>{statusConfig.label}</Badge>

      case "badge":
        return <Badge variant="outline">{value}</Badge>

      case "image":
        return (
          <Avatar className="h-10 w-10">
            <AvatarImage src={value || "/placeholder.svg"} alt={field.label} />
            <AvatarFallback>{value.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        )

      case "email":
        return (
          <a href={`mailto:${value}`} className="text-blue-600 hover:underline">
            {value}
          </a>
        )

      case "phone":
        return (
          <a href={`tel:${value}`} className="text-blue-600 hover:underline">
            {value}
          </a>
        )

      case "url":
        return (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline flex items-center"
          >
            {value}
            <Eye className="ml-1 h-3 w-3" />
          </a>
        )

      case "currency":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: options.currency || "USD",
        }).format(Number(value))

      case "percent":
        return `${value}%`

      case "file":
        return (
          <a href={value} download className="text-blue-600 hover:underline flex items-center">
            <FileText className="mr-1 h-4 w-4" />
            Download
          </a>
        )

      default:
        return value
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="mb-2 -ml-2 text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
            )}
            <h1 className="text-2xl font-bold">{title}</h1>
            {subtitle && <p className="text-gray-500">{subtitle}</p>}

            {data.createdAt && (
              <div className="flex items-center text-sm text-gray-500 mt-2">
                <Clock className="mr-1 h-3 w-3" />
                Created on {format(new Date(data.createdAt), "PPP")}
                {data.updatedAt && data.updatedAt !== data.createdAt && (
                  <> · Updated on {format(new Date(data.updatedAt), "PPP")}</>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onPrint && (
              <Button variant="outline" size="sm" onClick={onPrint}>
                <Printer className="mr-1 h-4 w-4" />
                Print
              </Button>
            )}

            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="mr-1 h-4 w-4" />
                Export
              </Button>
            )}

            {onEdit && (
              <Button size="sm" onClick={onEdit} className="bg-green-600 hover:bg-green-700">
                <Edit className="mr-1 h-4 w-4" />
                Edit
              </Button>
            )}

            {actions}
          </div>
        </div>

        {headerContent && (
          <>
            <Separator className="my-6" />
            {headerContent}
          </>
        )}
      </div>

      <Tabs defaultValue={tabs[0].id} className="bg-white rounded-lg shadow-sm border">
        <TabsList className="p-0 border-b rounded-none">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-green-600 data-[state=active]:shadow-none"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="p-6">
            {tab.content ? (
              tab.content
            ) : (
              <div className="space-y-8">
                {tab.sections.map((section, index) => (
                  <div key={index} className="space-y-4">
                    <h3 className="text-lg font-medium">{section.title}</h3>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {section.fields.map((field, fieldIndex) => (
                        <div key={fieldIndex} className="space-y-1">
                          <p className="text-sm font-medium text-gray-500">{field.label}</p>
                          <div className="font-medium">{renderFieldValue(field)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {footerContent && <div className="bg-white rounded-lg shadow-sm border p-6">{footerContent}</div>}
    </div>
  )
}
