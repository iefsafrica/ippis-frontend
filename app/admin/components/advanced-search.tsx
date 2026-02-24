"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Search, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AdvancedSearchProps {
  onSearch: (searchParams: any) => void
  fields: Array<{
    name: string
    label: string
    type: "text" | "select" | "date"
    options?: Array<{ value: string; label: string }>
  }>
  title: string
}

export function AdvancedSearch({ onSearch, fields, title }: AdvancedSearchProps) {
  const ALL_OPTION_VALUE = "__all__"
  const [open, setOpen] = useState(false)
  const [searchParams, setSearchParams] = useState<Record<string, string>>({})

  const handleInputChange = (name: string, value: string) => {
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSearch = () => {
    const normalizedParams = Object.entries(searchParams).reduce<Record<string, string>>((acc, [key, value]) => {
      if (value && value !== ALL_OPTION_VALUE && value.toLowerCase() !== "all") {
        acc[key] = value
      }
      return acc
    }, {})
    onSearch(normalizedParams)
    setOpen(false)
  }

  const handleClear = () => {
    setSearchParams({})
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="gap-1 w-full sm:w-auto">
        <Search className="h-4 w-4" />
        Advanced Search
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Advanced Search - {title}</DialogTitle>
            <DialogDescription>Use the fields below to filter {title.toLowerCase()}.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {fields.map((field) => (
              <div key={field.name} className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={field.name} className="text-right">
                  {field.label}
                </Label>
                {field.type === "text" && (
                  <Input
                    id={field.name}
                    value={searchParams[field.name] || ""}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    className="col-span-3"
                  />
                )}
                {field.type === "select" && (
                  <Select
                    value={searchParams[field.name] || ALL_OPTION_VALUE}
                    onValueChange={(value) => handleInputChange(field.name, value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder={`Select ${field.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_OPTION_VALUE}>All</SelectItem>
                      {field.options?.filter((option) => option.value && option.value.trim().length > 0).map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {field.type === "date" && (
                  <Input
                    id={field.name}
                    type="date"
                    value={searchParams[field.name] || ""}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    className="col-span-3"
                  />
                )}
              </div>
            ))}
          </div>

          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={handleClear} type="button">
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
            <Button onClick={handleSearch} type="submit">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
