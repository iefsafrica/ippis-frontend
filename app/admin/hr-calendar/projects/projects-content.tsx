"use client"

import { useMemo, useState } from "react"
import { FolderKanban, Edit, Eye, RefreshCw, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { DataTable } from "@/app/admin/core-hr/components/data-table"
import { useDeleteProject, useGetProjects } from "@/services/hooks/calendar/projects"
import type { Project } from "@/types/calendar/projects"
import { AddProjectDialog } from "./add-project-dialog"
import { EditProjectDialog } from "./edit-project-dialog"
import { ViewProjectDialog } from "./view-project-dialog"

const statusBadgeClasses: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  inactive: "bg-gray-100 text-gray-800",
}

const priorityBadgeClasses: Record<string, string> = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800",
}

const projectSearchFields = [
  { name: "project_title", label: "Title", type: "text" as const },
  { name: "project_manager_id", label: "Manager ID", type: "text" as const },
  { name: "project_status", label: "Status", type: "select" as const, options: [
    { value: "", label: "All" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
    { value: "inactive", label: "Inactive" },
  ] },
  { name: "priority", label: "Priority", type: "select" as const, options: [
    { value: "", label: "All" },
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ] },
  { name: "start_date", label: "Start Date", type: "date" as const },
]

export function ProjectsContent() {
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const {
    data: projectsResponse,
    isLoading: isLoadingProjects,
    isError: isProjectsError,
    error: projectsError,
    refetch: refetchProjects,
  } = useGetProjects()

  const deleteProjectMutation = useDeleteProject()

  const projects = projectsResponse?.data || []
  const sortedProjects = useMemo(() => [...projects].sort((a, b) => b.id - a.id), [projects])

  const totalCount = sortedProjects.length
  const activeCount = sortedProjects.filter((project) => project.project_status === "active").length
  const completedCount = sortedProjects.filter((project) => project.project_status === "completed").length

  const handleManualRefresh = () => {
    refetchProjects()
    toast.info("Refreshing projects...")
  }

  const handleAddProject = () => {
    setCurrentProject(null)
    setIsAddDialogOpen(true)
  }

  const handleViewProject = (id: number) => {
    const project = sortedProjects.find((item) => item.id === id)
    if (!project) {
      toast.error("Project not found")
      return
    }
    setCurrentProject(project)
    setIsViewDialogOpen(true)
  }

  const handleEditProject = (id: number) => {
    const project = sortedProjects.find((item) => item.id === id)
    if (!project) {
      toast.error("Project not found")
      return
    }
    setCurrentProject(project)
    setIsEditDialogOpen(true)
  }

  const handleOpenDeleteDialog = (id: number) => {
    const project = sortedProjects.find((item) => item.id === id)
    if (!project) {
      toast.error("Project not found")
      return
    }
    setCurrentProject(project)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteProject = async () => {
    if (!currentProject) return
    try {
      await deleteProjectMutation.mutateAsync(currentProject.id)
      toast.success("Project deleted successfully")
      setIsDeleteDialogOpen(false)
      setCurrentProject(null)
    } catch (error: any) {
      toast.error(error.message || "Failed to delete project")
    }
  }

  const columns = [
    {
      key: "project_title",
      label: "Project",
      sortable: true,
      render: (value: string, row: Project) => (
        <div className="flex items-center">
          <div className="h-9 w-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center mr-3">
            <FolderKanban className="h-4 w-4 text-blue-600" />
          </div>
          <div className="min-w-0">
            <div className="font-medium text-gray-900 truncate max-w-[220px]">{value}</div>
            <div className="text-xs text-gray-500 truncate max-w-[220px]">{row.project_manager_id}</div>
          </div>
        </div>
      ),
    },
    {
      key: "project_status",
      label: "Status",
      sortable: true,
      render: (value: string) => {
        const badgeClass = statusBadgeClasses[value] || "bg-gray-100 text-gray-800"
        return <Badge className={badgeClass}>{value || "inactive"}</Badge>
      },
    },
    {
      key: "priority",
      label: "Priority",
      sortable: true,
      render: (value: string) => {
        const badgeClass = priorityBadgeClasses[value] || "bg-gray-100 text-gray-800"
        return <Badge className={badgeClass}>{value || "unknown"}</Badge>
      },
    },
    {
      key: "start_date",
      label: "Start Date",
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: "end_date",
      label: "End Date",
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: Project) => (
        <div className="flex justify-start space-x-2">
          <Button variant="outline" size="icon" onClick={() => handleViewProject(row.id)} title="View Details">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => handleEditProject(row.id)} title="Edit">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => handleOpenDeleteDialog(row.id)} title="Delete">
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ]

  if (isLoadingProjects) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 border border-blue-200 animate-pulse" />
            <div>
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-40 bg-gray-200 rounded animate-pulse mt-2" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-xl shadow border border-gray-200 animate-pulse" />
          ))}
        </div>
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
          <div className="flex flex-col space-y-4">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-1/4" />
            <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (isProjectsError) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-10">
            <p className="text-red-500 font-medium">Error loading projects</p>
            <p className="text-gray-600 mt-1 text-sm">{projectsError?.message}</p>
            <button
              onClick={() => refetchProjects()}
              className="mt-6 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium shadow-sm hover:shadow-md transition-all"
            >
              Retry Loading
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shadow-sm">
            <FolderKanban className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Projects
            </h1>
            <p className="text-gray-600 mt-1">
              Manage HR projects
              {projectsResponse?.data && (
                <span className="ml-2 text-sm text-gray-500">({totalCount} projects)</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleManualRefresh}
            disabled={deleteProjectMutation.isPending}
            className="h-10 px-3.5 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-medium rounded-lg"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Refresh</span>
          </Button>
          <Button
            onClick={handleAddProject}
            disabled={deleteProjectMutation.isPending}
            className="h-10 px-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg"
          >
            Add Project
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center mr-3">
                <span className="text-blue-800 font-bold">{totalCount}</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
                <p className="text-xs text-gray-500 mt-1">All projects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-green-100 border border-green-200 flex items-center justify-center mr-3">
                <span className="text-green-800 font-bold">{activeCount}</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{activeCount}</div>
                <p className="text-xs text-gray-500 mt-1">Active projects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center mr-3">
                <span className="text-blue-800 font-bold">{completedCount}</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{completedCount}</div>
                <p className="text-xs text-gray-500 mt-1">Completed projects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center mr-3">
                <span className="text-red-800 font-bold">
                  {sortedProjects.filter((project) => project.priority === "high").length}
                </span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {sortedProjects.filter((project) => project.priority === "high").length}
                </div>
                <p className="text-xs text-gray-500 mt-1">High priority</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-200 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Projects</CardTitle>
              <CardDescription className="text-gray-600">
                View and manage HR projects
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            title="Projects"
            columns={columns}
            data={sortedProjects}
            searchFields={projectSearchFields}
            onAdd={handleAddProject}
          />
        </CardContent>
      </Card>

      <AddProjectDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
      />

      <EditProjectDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false)
          setCurrentProject(null)
        }}
        project={currentProject}
      />

      {currentProject && (
        <ViewProjectDialog
          isOpen={isViewDialogOpen}
          onClose={() => {
            setIsViewDialogOpen(false)
            setCurrentProject(null)
          }}
          project={currentProject}
        />
      )}

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setCurrentProject(null)
        }}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        description={`Are you sure you want to delete ${currentProject?.project_title}?`}
        itemName={currentProject?.project_title || "project"}
        isLoading={deleteProjectMutation.isPending}
      />
    </div>
  )
}
