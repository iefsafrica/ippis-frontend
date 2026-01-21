"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Clock, FolderKanban, X } from "lucide-react"
import type { Project } from "@/types/calendar/projects"
import { format } from "date-fns"

interface ViewProjectDialogProps {
  isOpen: boolean
  onClose: () => void
  project: Project
}

const statusStyles: Record<string, string> = {
  active: "bg-green-100 text-green-800 hover:bg-green-100",
  completed: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  inactive: "bg-gray-100 text-gray-800 hover:bg-gray-100",
}

const priorityStyles: Record<string, string> = {
  high: "bg-red-100 text-red-800 hover:bg-red-100",
  medium: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  low: "bg-green-100 text-green-800 hover:bg-green-100",
}

export function ViewProjectDialog({ isOpen, onClose, project }: ViewProjectDialogProps) {
  const [showFullDescription, setShowFullDescription] = useState(false)
  const MAX_PREVIEW = 300

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP")
    } catch {
      return dateString
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPpp")
    } catch {
      return dateString
    }
  }

  const statusClass = statusStyles[project.project_status] || "bg-gray-100 text-gray-800 hover:bg-gray-100"
  const priorityClass = priorityStyles[project.priority] || "bg-gray-100 text-gray-800 hover:bg-gray-100"

  const teamMembers = useMemo(() => {
    return project.team_member_ids?.length ? project.team_member_ids.join(", ") : ""
  }, [project.team_member_ids])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-3xl overflow-hidden border border-gray-200 shadow-xl">
        <DialogHeader className="px-8 pt-8 pb-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <FolderKanban className="h-6 w-6 text-gray-700" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Project Details
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  View project information for {project.project_title}
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-gray-500 hover:text-gray-700"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Project Summary</h3>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-gray-500 font-medium">Project Title</div>
                      <p className="text-sm font-medium text-gray-900">{project.project_title}</p>
                      <p className="text-xs text-gray-500">Manager: {project.project_manager_id}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-gray-500 font-medium">Status</div>
                      <Badge className={`${statusClass} py-1 px-2`} variant="outline">
                        {project.project_status}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 font-medium">Priority</div>
                      <Badge className={`${priorityClass} py-1 px-2`} variant="outline">
                        {project.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-6">Project Details</h3>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-xs text-gray-500 font-medium">Start Date</div>
                    <p className="text-sm text-gray-700">{formatDate(project.start_date)}</p>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-medium">End Date</div>
                    <p className="text-sm text-gray-700">{formatDate(project.end_date)}</p>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 font-medium">Team Members</div>
                  <p className="text-sm text-gray-700">{teamMembers || "No team members listed"}</p>
                </div>

                <div>
                  <div className="text-xs text-gray-500 font-medium">Budget</div>
                  <p className="text-sm text-gray-700">{project.budget}</p>
                </div>

                <div>
                  <div className="text-xs text-gray-500 font-medium">Completion</div>
                  <p className="text-sm text-gray-700">{project.completion_percentage}%</p>
                </div>

                <div>
                  <div className="text-xs text-gray-500 font-medium">Description</div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    {project.project_description ? (
                      <>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {project.project_description.length > MAX_PREVIEW && !showFullDescription
                            ? `${project.project_description.slice(0, MAX_PREVIEW)}...`
                            : project.project_description}
                        </p>
                        {project.project_description.length > MAX_PREVIEW && (
                          <button
                            onClick={() => setShowFullDescription((value) => !value)}
                            className="mt-2 text-sm text-blue-600 hover:underline"
                            aria-expanded={showFullDescription}
                          >
                            {showFullDescription ? "Show less" : "Show more"}
                          </button>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">No description provided</p>
                    )}
                  </div>
                </div>

                {(project.created_at || project.updated_at) && (
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-4">Metadata</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {project.created_at && (
                        <div>
                          <div className="flex items-center mb-2">
                            <Clock className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-xs text-gray-500 font-medium">Created At</span>
                          </div>
                          <p className="text-sm text-gray-600">{formatDateTime(project.created_at)}</p>
                        </div>
                      )}

                      {project.updated_at && (
                        <div>
                          <div className="flex items-center mb-2">
                            <Clock className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-xs text-gray-500 font-medium">Last Updated</span>
                          </div>
                          <p className="text-sm text-gray-600">{formatDateTime(project.updated_at)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
