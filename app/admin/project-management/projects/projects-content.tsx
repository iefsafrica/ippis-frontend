"use client"

import type React from "react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { RefreshCw, Eye, Edit, Trash2, FolderKanban, Plus } from "lucide-react"
import { toast } from "sonner"
import { DataTable } from "@/app/admin/core-hr/components/data-table"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { useEmployeesList } from "@/services/hooks/employees/useEmployees"
import {
  useCreateProject,
  useDeleteProject,
  useGetProjects,
  useUpdateProject,
} from "@/services/hooks/projects"
import type { Project } from "@/types/projects"
import type { Employee } from "@/types/employees/employee-management"

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "inactive", label: "Inactive" },
]

const PRIORITY_OPTIONS = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
]

const statusBadge = (status?: string) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-amber-100 text-amber-700"
    case "active":
      return "bg-emerald-100 text-emerald-700"
    case "completed":
      return "bg-blue-100 text-blue-700"
    case "inactive":
      return "bg-gray-100 text-gray-600"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

const priorityBadge = (value?: string) => {
  switch (value?.toLowerCase()) {
    case "high":
      return "bg-red-100 text-red-700"
    case "medium":
      return "bg-yellow-100 text-amber-700"
    case "low":
      return "bg-green-100 text-green-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

const columns = (handleView: (project: Project) => void, openEdit: (project: Project) => void, openDelete: (project: Project) => void) => [
  {
    key: "project_code",
    label: "Code",
    sortable: true,
    render: (value: string, row: Project) => (
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
          <FolderKanban className="h-4 w-4 text-blue-600" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-gray-900 truncate">{row.name}</div>
          <div className="text-xs text-gray-500 truncate">{value}</div>
        </div>
      </div>
    ),
  },
  {
    key: "client",
    label: "Client",
    sortable: true,
  },
  {
    key: "start_date",
    label: "Start",
    sortable: true,
    render: (value: string) => new Date(value).toLocaleDateString(),
  },
  {
    key: "end_date",
    label: "End",
    sortable: true,
    render: (value: string) => new Date(value).toLocaleDateString(),
  },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => (
        <Badge className={statusBadge(value)}>{value ?? "Unknown"}</Badge>
      ),
    },
    {
      key: "priority",
      label: "Priority",
      sortable: true,
      render: (value: string) => (
        <Badge className={priorityBadge(value)}>{value ?? "Medium"}</Badge>
      ),
    },
  {
    key: "progress",
    label: "Progress",
    sortable: true,
    render: (value: number) => `${value ?? 0}%`,
  },
  {
    key: "actions",
    label: "Actions",
    render: (_: any, row: Project) => {
      const normalizedStatus = row.status?.toLowerCase()
      const canModify =
        normalizedStatus?.includes("progress") || normalizedStatus === "in progress"
      return (
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleView(row)}
            title="View Project"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => openEdit(row)}
            disabled={!canModify}
            className="text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Edit Project"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => openDelete(row)}
            disabled={!canModify}
            className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete Project"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
]

const searchFields = [
  { name: "project_code", label: "Project Code", type: "text" as const },
  { name: "name", label: "Project Name", type: "text" as const },
  {
    name: "status",
    label: "Status",
    type: "select" as const,
    options: [
      { value: "active", label: "Active" },
      { value: "completed", label: "Completed" },
      { value: "inactive", label: "Inactive" },
    ],
  },
]

export function ProjectsContent() {
  const [viewProject, setViewProject] = useState<Project | null>(null)
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newProject, setNewProject] = useState({
    name: "",
    client: "",
    manager_id: "",
    project_code: "",
    priority: "medium",
    status: "pending",
    budget: "",
    progress: 0,
  })
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editStatus, setEditStatus] = useState("active")
  const [editProgress, setEditProgress] = useState("0")
  const [editName, setEditName] = useState("")
  const [editClient, setEditClient] = useState("")
  const [newProjectStartDate, setNewProjectStartDate] = useState<Date>(new Date())
  const [newProjectEndDate, setNewProjectEndDate] = useState<Date>(new Date())
  const [editStartDate, setEditStartDate] = useState<Date>(new Date())
  const [editEndDate, setEditEndDate] = useState<Date>(new Date())
  const [editManagerId, setEditManagerId] = useState("")
  const [editProjectCode, setEditProjectCode] = useState("")
  const [editPriority, setEditPriority] = useState("medium")
  const [editBudget, setEditBudget] = useState("")
  const [deleteProjectCandidate, setDeleteProjectCandidate] = useState<Project | null>(null)
  const [isDeleteProjectDialogOpen, setIsDeleteProjectDialogOpen] = useState(false)

  const {
    data: projectsResponse,
    isLoading,
    refetch,
  } = useGetProjects()

  const deleteProject = useDeleteProject()
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()

  const {
    data: employeesData,
    isLoading: isEmployeesLoading,
  } = useEmployeesList(1)
  const managerOptions = employeesData?.employees ?? []
  const getManagerIdentifier = (employee: Employee) => employee.employee_id || employee.id

  const toDate = (value?: string) => {
    if (!value) return new Date()
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed
  }

  const formatDateForApi = (date: Date) => date.toISOString().split("T")[0]

  const normalizeOption = (value: string | undefined, options: string[], fallback: string) => {
    if (!value) return fallback
    const normalized = value.toLowerCase()
    return options.includes(normalized) ? normalized : fallback
  }

  const projects = projectsResponse?.data?.projects ?? []

  const total = projects.length
  const active = projects.filter((project) => project.status?.toLowerCase() === "active").length
  const completed = projects.filter((project) => project.status?.toLowerCase() === "completed").length

  const handleView = (project: Project) => {
    setViewProject(project)
    setIsViewOpen(true)
  }

  const handleStatusSelection = (value: string) =>
    setNewProject((prev) => ({
      ...prev,
      status: normalizeOption(value, STATUS_OPTIONS.map((item) => item.value), "pending"),
    }))

  const handlePrioritySelection = (value: string) =>
    setNewProject((prev) => ({
      ...prev,
      priority: normalizeOption(value, PRIORITY_OPTIONS.map((item) => item.value), "medium"),
    }))

  const handleEdit = (project: Project) => {
    setEditProject(project)
    setEditName(project.name)
    setEditClient(project.client)
    setEditStartDate(toDate(project.start_date))
    setEditEndDate(toDate(project.end_date))
    setEditManagerId(project.manager_id)
    setEditProjectCode(project.project_code ?? "")
    setEditPriority(normalizeOption(project.priority, PRIORITY_OPTIONS.map((item) => item.value), "medium"))
    setEditBudget(project.budget ?? "")
    setEditStatus(normalizeOption(project.status, STATUS_OPTIONS.map((item) => item.value), "active"))
    setEditProgress(String(project.progress ?? 0))
    setIsEditOpen(true)
  }

  const handleDelete = (project: Project) => {
    setDeleteProjectCandidate(project)
    setIsDeleteProjectDialogOpen(true)
  }

  const handleConfirmDeleteProject = async () => {
    if (!deleteProjectCandidate) return
    await deleteProject.mutateAsync(deleteProjectCandidate.id)
    setIsDeleteProjectDialogOpen(false)
    setDeleteProjectCandidate(null)
  }

  const resetNewProjectForm = () => {
    setNewProject({
      name: "",
      client: "",
      manager_id: "",
      project_code: "",
      priority: "medium",
      status: "pending",
      budget: "",
      progress: 0,
    })
    setNewProjectStartDate(new Date())
    setNewProjectEndDate(new Date())
  }

  const handleAddSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      await createProject.mutateAsync({
        name: newProject.name,
        client: newProject.client,
        start_date: formatDateForApi(newProjectStartDate),
        end_date: formatDateForApi(newProjectEndDate),
        manager_id: newProject.manager_id,
        project_code: newProject.project_code,
        priority: normalizeOption(newProject.priority, PRIORITY_OPTIONS.map((item) => item.value), "medium"),
        status: normalizeOption(newProject.status, STATUS_OPTIONS.map((item) => item.value), "pending"),
        budget: newProject.budget,
        progress: newProject.progress,
      })
      toast.success("Project created")
      setIsAddOpen(false)
      resetNewProjectForm()
    } catch (error: any) {
      toast.error(error?.message || "Failed to create project")
    }
  }

  const handleUpdateSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!editProject) return
    await updateProject.mutateAsync({
      id: editProject.id,
      name: editName,
      client: editClient,
      start_date: formatDateForApi(editStartDate),
      end_date: formatDateForApi(editEndDate),
      manager_id: editManagerId,
      project_code: editProjectCode,
      priority: editPriority.toLowerCase(),
      budget: editBudget,
      status: editStatus.toLowerCase(),
      progress: Number(editProgress || editProject.progress || 0),
    })
    setIsEditOpen(false)
    setEditProject(null)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Projects</h2>
            <p className="text-sm text-gray-500">Manage ongoing initiatives</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2 bg-white border border-gray-200 text-gray-600">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={() => setIsAddOpen(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus className="h-4 w-4" />
              Add New
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            {
              label: "Total Projects",
              value: total,
              subtitle: "Recognized initiatives recorded",
            },
            {
              label: "Active",
              value: active,
              subtitle: "Currently in progress",
            },
            {
              label: "Completed",
              value: completed,
              subtitle: "Finished successfully",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <p className="text-xs uppercase tracking-[0.4em] text-gray-400">{item.label}</p>
              <p className="text-3xl font-semibold text-gray-900">{item.value}</p>
              <p className="text-xs text-gray-500">{item.subtitle}</p>
            </div>
          ))}
        </div>
      </div>


      <Card className="border border-gray-200 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Project Records</CardTitle>
              <CardDescription className="text-gray-600">Track projects from kickoff to completion.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            title="Projects"
            columns={columns(handleView, handleEdit, handleDelete)}
            data={projects}
            searchFields={searchFields}
          />
        </CardContent>
      </Card>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Project Details</DialogTitle>
          </DialogHeader>
          {viewProject && (
            <div className="space-y-3">
              {[
                { label: "Project Code", value: viewProject.project_code },
                { label: "Name", value: viewProject.name },
                { label: "Client", value: viewProject.client },
                { label: "Start Date", value: new Date(viewProject.start_date).toLocaleDateString() },
                { label: "End Date", value: new Date(viewProject.end_date).toLocaleDateString() },
                { label: "Status", value: viewProject.status },
                { label: "Priority", value: viewProject.priority },
                { label: "Progress", value: `${viewProject.progress ?? 0}%` },
              ].map((row) => (
                <div key={row.label} className="rounded-xl border border-gray-200 bg-white p-3">
                  <p className="text-xs text-gray-500">{row.label}</p>
                  <p className="text-sm font-semibold text-gray-900">{row.value}</p>
                </div>
              ))}
            </div>
          )}
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddOpen} onOpenChange={(open) => !open && setIsAddOpen(open)}>
        <DialogContent className="max-w-md">
          <form className="space-y-4" onSubmit={handleAddSubmit}>
            <DialogHeader>
              <DialogTitle>Add Project</DialogTitle>
            </DialogHeader>
            <div>
              <Label>Project Name</Label>
              <Input
                value={newProject.name}
                onChange={(event) => setNewProject({ ...newProject, name: event.target.value })}
                required
              />
            </div>
            <div>
              <Label>Client</Label>
              <Input
                value={newProject.client}
                onChange={(event) => setNewProject({ ...newProject, client: event.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start Date</Label>
                <DatePicker
                  value={newProjectStartDate}
                  onValueChange={(date) => date && setNewProjectStartDate(date)}
                  placeholder="Select start date"
                  className="w-full"
                />
              </div>
              <div>
                <Label>End Date</Label>
                <DatePicker
                  value={newProjectEndDate}
                  onValueChange={(date) => date && setNewProjectEndDate(date)}
                  placeholder="Select end date"
                  className="w-full"
                />
              </div>
            </div>
            <div>
              <Label>Manager</Label>
              <Select
                value={newProject.manager_id}
                onValueChange={(value) => setNewProject({ ...newProject, manager_id: value })}
                disabled={isEmployeesLoading || managerOptions.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isEmployeesLoading ? "Loading managers..." : "Select manager"} />
                </SelectTrigger>
                <SelectContent>
                  {managerOptions.map((manager) => {
                    const managerId = getManagerIdentifier(manager)
                    return (
                      <SelectItem key={managerId} value={managerId}>
                        {manager.name}
                        {manager.employee_id ? ` (${manager.employee_id})` : ""}
                      </SelectItem>
                    )
                  })}
                  {!isEmployeesLoading && managerOptions.length === 0 && (
                    <SelectItem value="" disabled>
                      No employees available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Project Code</Label>
              <Input
                value={newProject.project_code}
                onChange={(event) => setNewProject({ ...newProject, project_code: event.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Status</Label>
                <Select
                  value={newProject.status}
                  onValueChange={handleStatusSelection}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select
                  value={newProject.priority}
                  onValueChange={handlePrioritySelection}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Budget</Label>
              <Input
                value={newProject.budget}
                onChange={(event) => setNewProject({ ...newProject, budget: event.target.value })}
                placeholder="₦"
              />
            </div>
            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createProject.isPending}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={(open) => !open && setIsEditOpen(false)}>
        <DialogContent className="max-w-md">
          <form className="space-y-4" onSubmit={handleUpdateSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
            </DialogHeader>
            <div>
              <Label>Project Name</Label>
              <Input value={editName} onChange={(event) => setEditName(event.target.value)} />
            </div>
            <div>
              <Label>Client</Label>
              <Input value={editClient} onChange={(event) => setEditClient(event.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start Date</Label>
                <DatePicker
                  value={editStartDate}
                  onValueChange={(date) => date && setEditStartDate(date)}
                  placeholder="Select start date"
                  className="w-full"
                />
              </div>
              <div>
                <Label>End Date</Label>
                <DatePicker
                  value={editEndDate}
                  onValueChange={(date) => date && setEditEndDate(date)}
                  placeholder="Select end date"
                  className="w-full"
                />
              </div>
            </div>
            <div>
              <Label>Manager</Label>
              <Select
                value={editManagerId}
                onValueChange={(value) => setEditManagerId(value)}
                disabled={isEmployeesLoading || managerOptions.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select manager" />
                </SelectTrigger>
                <SelectContent>
                  {managerOptions.map((manager) => {
                    const managerId = getManagerIdentifier(manager)
                    return (
                      <SelectItem key={managerId} value={managerId}>
                        {manager.name}
                        {manager.employee_id ? ` (${manager.employee_id})` : ""}
                      </SelectItem>
                    )
                  })}
                  {!isEmployeesLoading && managerOptions.length === 0 && (
                    <SelectItem value="" disabled>
                      No employees available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Project Code</Label>
              <Input value={editProjectCode} onChange={(event) => setEditProjectCode(event.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Status</Label>
                <Select
                  value={editStatus}
                  onValueChange={(value) =>
                    setEditStatus(normalizeOption(value, STATUS_OPTIONS.map((item) => item.value), "active"))
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select
                  value={editPriority}
                  onValueChange={(value) =>
                    setEditPriority(normalizeOption(value, PRIORITY_OPTIONS.map((item) => item.value), "medium"))
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Budget</Label>
              <Input value={editBudget} onChange={(event) => setEditBudget(event.target.value)} placeholder="₦" />
            </div>
            <div>
              <Label>Progress (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={editProgress}
                onChange={(event) => setEditProgress(event.target.value)}
              />
            </div>
            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateProject.isPending}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <DeleteConfirmationDialog
        isOpen={isDeleteProjectDialogOpen}
        onClose={() => {
          setIsDeleteProjectDialogOpen(false)
          setDeleteProjectCandidate(null)
        }}
        onConfirm={handleConfirmDeleteProject}
        title="Delete Project"
        description={`Delete project "${deleteProjectCandidate?.name ?? "this project"}"?`}
        itemName={deleteProjectCandidate ? `Project ${deleteProjectCandidate.name}` : "Project"}
        isLoading={deleteProject.isPending}
      />
    </div>
  )
}
