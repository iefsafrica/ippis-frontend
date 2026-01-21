"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FolderKanban, Loader2, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { useUpdateProject } from "@/services/hooks/calendar/projects"
import type { Project } from "@/types/calendar/projects"

interface ProjectFormData {
  project_title: string
  start_date: string
  end_date: string
  project_manager_id: string
  team_member_ids: string
  project_description: string
  project_status: string
  priority: string
  budget: string
  completion_percentage: string
}

interface EditProjectDialogProps {
  isOpen: boolean
  onClose: () => void
  project: Project | null
}

const toDateInput = (value?: string) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString().split("T")[0]
}

export function EditProjectDialog({ isOpen, onClose, project }: EditProjectDialogProps) {
  const updateProjectMutation = useUpdateProject()
  const [formData, setFormData] = useState<ProjectFormData>({
    project_title: "",
    start_date: "",
    end_date: "",
    project_manager_id: "",
    team_member_ids: "",
    project_description: "",
    project_status: "active",
    priority: "medium",
    budget: "",
    completion_percentage: "0",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (project) {
      setFormData({
        project_title: project.project_title || "",
        start_date: toDateInput(project.start_date),
        end_date: toDateInput(project.end_date),
        project_manager_id: project.project_manager_id || "",
        team_member_ids: project.team_member_ids?.join(", ") || "",
        project_description: project.project_description || "",
        project_status: project.project_status || "active",
        priority: project.priority || "medium",
        budget: project.budget || "",
        completion_percentage: project.completion_percentage?.toString() || "0",
      })
    }
  }, [project])

  useEffect(() => {
    if (!isOpen) {
      setErrors({})
    }
  }, [isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const validateForm = () => {
    const nextErrors: Record<string, string> = {}

    if (!formData.project_title.trim()) nextErrors.project_title = "Project title is required"
    if (!formData.start_date) nextErrors.start_date = "Start date is required"
    if (!formData.end_date) nextErrors.end_date = "End date is required"
    if (!formData.project_manager_id.trim()) nextErrors.project_manager_id = "Manager ID is required"
    if (!formData.project_description.trim()) nextErrors.project_description = "Description is required"
    if (!formData.project_status.trim()) nextErrors.project_status = "Status is required"
    if (!formData.priority.trim()) nextErrors.priority = "Priority is required"
    if (!formData.budget.trim()) nextErrors.budget = "Budget is required"

    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date)
      const endDate = new Date(formData.end_date)
      if (endDate < startDate) {
        nextErrors.end_date = "End date must be on or after start date"
      }
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!project) return
    if (!validateForm()) return

    setIsSubmitting(true)
    const loadingToast = toast.loading("Updating project...")

    try {
      await updateProjectMutation.mutateAsync({
        id: project.id,
        project_title: formData.project_title,
        start_date: formData.start_date,
        end_date: formData.end_date,
        project_manager_id: formData.project_manager_id,
        team_member_ids: formData.team_member_ids
          ? formData.team_member_ids.split(",").map((id) => id.trim()).filter(Boolean)
          : [],
        project_description: formData.project_description,
        project_status: formData.project_status,
        priority: formData.priority,
        budget: Number(formData.budget || 0),
        completion_percentage: Number(formData.completion_percentage || 0),
      })

      toast.success("Project updated successfully!", {
        id: loadingToast,
        duration: 3000,
      })

      onClose()
    } catch (error: any) {
      toast.error(error.message || "Failed to update project", {
        id: loadingToast,
        duration: 4000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLoading = updateProjectMutation.isPending || isSubmitting

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-3xl overflow-hidden border border-gray-200 shadow-xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="px-8 pt-8 pb-6 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <FolderKanban className="h-6 w-6 text-gray-700" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Edit Project
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Update project details for {project?.project_title || "project"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Project Details</h3>
                  <span className="text-xs text-gray-500">Required fields marked with *</span>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="project_title" className="text-sm font-medium text-gray-700 mb-2 block">
                        Project Title *
                      </Label>
                      <Input
                        id="project_title"
                        name="project_title"
                        value={formData.project_title}
                        onChange={handleChange}
                        className="h-11 border-gray-300 text-left"
                        disabled={isLoading}
                      />
                      {errors.project_title && <p className="text-sm text-red-600 mt-2">{errors.project_title}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="project_manager_id" className="text-sm font-medium text-gray-700 mb-2 block">
                        Project Manager ID *
                      </Label>
                      <Input
                        id="project_manager_id"
                        name="project_manager_id"
                        value={formData.project_manager_id}
                        onChange={handleChange}
                        className="h-11 border-gray-300 text-left"
                        disabled={isLoading}
                      />
                      {errors.project_manager_id && (
                        <p className="text-sm text-red-600 mt-2">{errors.project_manager_id}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="start_date" className="text-sm font-medium text-gray-700 mb-2 block">
                        Start Date *
                      </Label>
                      <Input
                        id="start_date"
                        name="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={handleChange}
                        className="h-11 border-gray-300 text-left"
                        disabled={isLoading}
                      />
                      {errors.start_date && <p className="text-sm text-red-600 mt-2">{errors.start_date}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="end_date" className="text-sm font-medium text-gray-700 mb-2 block">
                        End Date *
                      </Label>
                      <Input
                        id="end_date"
                        name="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={handleChange}
                        className="h-11 border-gray-300 text-left"
                        disabled={isLoading}
                      />
                      {errors.end_date && <p className="text-sm text-red-600 mt-2">{errors.end_date}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="team_member_ids" className="text-sm font-medium text-gray-700 mb-2 block">
                      Team Member IDs
                    </Label>
                    <Input
                      id="team_member_ids"
                      name="team_member_ids"
                      value={formData.team_member_ids}
                      onChange={handleChange}
                      className="h-11 border-gray-300 text-left"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="project_description" className="text-sm font-medium text-gray-700 mb-2 block">
                      Description *
                    </Label>
                    <Textarea
                      id="project_description"
                      name="project_description"
                      value={formData.project_description}
                      onChange={handleChange}
                      className="min-h-[120px] border-gray-300 text-gray-900 text-left"
                      disabled={isLoading}
                    />
                    {errors.project_description && (
                      <p className="text-sm text-red-600 mt-2">{errors.project_description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="project_status" className="text-sm font-medium text-gray-700 mb-2 block">
                        Status *
                      </Label>
                      <Input
                        id="project_status"
                        name="project_status"
                        value={formData.project_status}
                        onChange={handleChange}
                        className="h-11 border-gray-300 text-left"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority" className="text-sm font-medium text-gray-700 mb-2 block">
                        Priority *
                      </Label>
                      <Input
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        className="h-11 border-gray-300 text-left"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="budget" className="text-sm font-medium text-gray-700 mb-2 block">
                        Budget *
                      </Label>
                      <Input
                        id="budget"
                        name="budget"
                        type="number"
                        value={formData.budget}
                        onChange={handleChange}
                        className="h-11 border-gray-300 text-left"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="completion_percentage" className="text-sm font-medium text-gray-700 mb-2 block">
                      Completion Percentage
                    </Label>
                    <Input
                      id="completion_percentage"
                      name="completion_percentage"
                      type="number"
                      value={formData.completion_percentage}
                      onChange={handleChange}
                      className="h-11 border-gray-300 text-left"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-5 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">Required fields are marked with *</div>
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                  className="h-10 px-6 border-gray-300 hover:bg-gray-100 text-gray-700 flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-10 px-8 bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Update Project
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
