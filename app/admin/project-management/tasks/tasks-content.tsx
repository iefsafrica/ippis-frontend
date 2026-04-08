"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DataTable } from "@/app/admin/core-hr/components/data-table"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { useEmployeesList } from "@/services/hooks/employees/useEmployees"
import {
  useCreateTask,
  useDeleteTask,
  useGetTasks,
  useUpdateTask,
} from "@/services/hooks/tasks"
import { useGetProjects } from "@/services/hooks/projects"
import type { Employee } from "@/types/employees/employee-management"
import type { Task } from "@/types/tasks"
import { Eye, Edit, Trash2, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

const statusBadgeClass = (status?: string) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-amber-100 text-amber-700"
    case "completed":
      return "bg-emerald-100 text-emerald-700"
    case "in progress":
    case "in-progress":
      return "bg-blue-100 text-blue-700"
    case "not started":
    case "not-started":
      return "bg-amber-100 text-amber-700"
    case "delayed":
      return "bg-rose-100 text-rose-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

const columns = (
  handleView: (task: Task) => void,
  handleEdit: (task: Task) => void,
  handleDelete: (task: Task) => void,
  getAssigneeDisplayName: (value?: string) => string,
) => [
  {
    key: "task_code",
    label: "Task Code",
    sortable: true,
    render: (value: string, row: Task) => (
      <div className="font-medium text-gray-900">{value}</div>
    ),
  },
  {
    key: "name",
    label: "Task",
    sortable: true,
    render: (value: string, row: Task) => (
      <div>
        <div className="text-sm font-semibold text-gray-900">{value}</div>
        <div className="text-xs text-gray-500">{row.project_name ?? `Project ${row.project_id}`}</div>
      </div>
    ),
  },
  {
    key: "assigned_to",
    label: "Assigned To",
    sortable: true,
    render: (value: string) => (
      <div className="font-medium text-gray-900">{getAssigneeDisplayName(value)}</div>
    ),
  },
  {
    key: "due_date",
    label: "Due Date",
    sortable: true,
    render: (value: string) => format(new Date(value), "PPP"),
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (value: string) => <Badge className={statusBadgeClass(value)}>{value}</Badge>,
  },
  {
    key: "priority",
    label: "Priority",
    sortable: true,
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
    render: (_: any, row: Task) => {
      const normalizedStatus = row.status?.toLowerCase()
      const canModify =
        normalizedStatus?.includes("progress") ||
        normalizedStatus === "in progress" ||
        normalizedStatus === "pending"
      return (
        <div className="flex justify-end space-x-2">
          <Button variant="outline" size="icon" onClick={() => handleView(row)} title="View Task">
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleEdit(row)}
            disabled={!canModify}
            className="text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Edit Task"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleDelete(row)}
            disabled={!canModify}
            className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete Task"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
]

const searchFields = [
  { name: "task_code", label: "Task Code", type: "text" as const },
  { name: "name", label: "Task Name", type: "text" as const },
  { name: "assigned_to", label: "Assignee", type: "text" as const },
]

export default function TasksContent() {
  const [viewTask, setViewTask] = useState<Task | null>(null)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editStatus, setEditStatus] = useState("in-progress")
  const [editProgress, setEditProgress] = useState("0")
  const [editName, setEditName] = useState("")
  const [editProjectId, setEditProjectId] = useState("")
  const [editAssignedTo, setEditAssignedTo] = useState("")
  const [editDueDate, setEditDueDate] = useState("")
  const [editPriority, setEditPriority] = useState("medium")
  const [deleteTaskCandidate, setDeleteTaskCandidate] = useState<Task | null>(null)
  const [isDeleteTaskDialogOpen, setIsDeleteTaskDialogOpen] = useState(false)
  const [newTask, setNewTask] = useState({
    name: "",
    project_id: "",
    assigned_to: "",
    due_date: new Date().toISOString().split("T")[0],
    status: "pending",
    progress: 0,
    priority: "medium",
  })

  const { data: tasksResponse, refetch } = useGetTasks()
  const deleteTask = useDeleteTask()
  const updateTask = useUpdateTask()
  const createTask = useCreateTask()

  const { data: projectsResponse } = useGetProjects()
  const projectOptions = projectsResponse?.data?.projects ?? []
  const pendingProjectOptions = projectOptions.filter(
    (project) => project.status?.toLowerCase() === "pending",
  )

  const {
    data: employeesData,
    isLoading: isEmployeesLoading,
  } = useEmployeesList(1)

  const employeeOptions = employeesData?.employees ?? []
  const getEmployeeIdentifier = (employee: Employee) => String(employee.employee_id ?? employee.id)
  const findEmployeeByValue = (value?: string) =>
    employeeOptions.find(
      (employee) =>
        employee.employee_id === value ||
        employee.id === value ||
        employee.name === value,
    )
  const resolveEmployeeIdentifier = (value?: string) => {
    if (!value) return ""
    const normalized = String(value)
    const employee = findEmployeeByValue(normalized)
    return employee ? getEmployeeIdentifier(employee) : normalized
  }
  const getAssigneeDisplayName = (value?: string) => findEmployeeByValue(value)?.name ?? value ?? ""
  const normalizeTaskStatus = (value?: string) => {
    if (!value) return "pending"
    const normalized = value.trim().toLowerCase()
    if (normalized.includes("pend")) return "pending"
    if (normalized.includes("not")) return "not-started"
    if (normalized.includes("progress")) return "in-progress"
    if (normalized.includes("delayed")) return "delayed"
    if (normalized.includes("complete")) return "completed"
    return normalized
  }
  const normalizeTaskPriority = (value?: string) => {
    const normalized = value?.trim().toLowerCase()
    if (normalized === "high" || normalized === "medium" || normalized === "low") {
      return normalized
    }
    return "medium"
  }
  const formatDateForInput = (value?: string) => {
    if (!value) return new Date().toISOString().split("T")[0]
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return ""
    return parsed.toISOString().split("T")[0]
  }

  const tasks = tasksResponse?.data?.tasks ?? []
  const total = tasks.length
  const completed = tasks.filter((task) => task.status?.toLowerCase() === "completed").length
  const inProgress = tasks.filter((task) => task.status?.toLowerCase().includes("progress")).length

  const stats = [
    {
      label: "Total Tasks",
      value: total,
      subtitle: "Work items tracked",
    },
    {
      label: "Completed",
      value: completed,
      subtitle: "Already delivered",
    },
    {
      label: "In Progress",
      value: inProgress,
      subtitle: "Currently active",
    },
  ]

  const handleView = (task: Task) => {
    setViewTask(task)
    setIsViewOpen(true)
  }

  const handleEdit = (task: Task) => {
    setEditTask(task)
    setEditName(task.name)
    setEditProjectId(task.project_id ? String(task.project_id) : "")
    setEditAssignedTo(resolveEmployeeIdentifier(task.assigned_to))
    setEditDueDate(formatDateForInput(task.due_date))
    setEditPriority(normalizeTaskPriority(task.priority))
    setEditStatus(normalizeTaskStatus(task.status))
    setEditProgress(String(task.progress ?? 0))
    setIsEditOpen(true)
  }

  useEffect(() => {
    if (!editTask) return
    const resolved = resolveEmployeeIdentifier(editTask.assigned_to)
    if (resolved && resolved !== editAssignedTo) {
      setEditAssignedTo(resolved)
    }
  }, [employeeOptions, editTask, editAssignedTo])

  const handleDelete = (task: Task) => {
    setDeleteTaskCandidate(task)
    setIsDeleteTaskDialogOpen(true)
  }

  const handleConfirmDeleteTask = async () => {
    if (!deleteTaskCandidate) return
    try {
      await deleteTask.mutateAsync(deleteTaskCandidate.id)
      toast.success("Task deleted")
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete task")
    } finally {
      setIsDeleteTaskDialogOpen(false)
      setDeleteTaskCandidate(null)
    }
  }

  const handleOpenAdd = () => setIsAddOpen(true)

  const resetNewTaskForm = () => {
    setNewTask({
      name: "",
      project_id: "",
      assigned_to: "",
      due_date: new Date().toISOString().split("T")[0],
      status: "pending",
      progress: 0,
      priority: "medium",
    })
  }

  const handleAddSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      await createTask.mutateAsync({
        name: newTask.name,
        project_id: Number(newTask.project_id),
        assigned_to: newTask.assigned_to,
        due_date: newTask.due_date,
        status: newTask.status,
        progress: Number(newTask.progress),
        priority: newTask.priority,
      })
      toast.success("Task created")
      setIsAddOpen(false)
      resetNewTaskForm()
    } catch (error: any) {
      toast.error(error?.message || "Failed to create task")
    }
  }

  const handleUpdateSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!editTask) return
    try {
      await updateTask.mutateAsync({
        id: editTask.id,
        name: editName || editTask.name,
        project_id: editProjectId ? Number(editProjectId) : editTask.project_id,
        assigned_to: editAssignedTo || editTask.assigned_to,
        due_date: editDueDate || editTask.due_date,
      status: editStatus,
      progress: Number(editProgress || editTask.progress || 0),
      priority: editPriority,
      })
      toast.success("Task updated")
      setIsEditOpen(false)
      setEditTask(null)
    } catch (error: any) {
      toast.error(error?.message || "Failed to update task")
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Tasks</h2>
            <p className="text-sm text-gray-500">Track all project work items</p>
          </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="gap-2 bg-white border border-gray-200 text-gray-600"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {stats.map((item) => (
            <div key={item.label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.4em] text-gray-400">{item.label}</p>
              <p className="text-3xl font-semibold text-gray-900">{item.value}</p>
              <p className="text-xs text-gray-500">{item.subtitle}</p>
            </div>
          ))}
        </div>
      </div>

      <Card className="border border-gray-200 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">Task Records</CardTitle>
            <CardDescription className="text-gray-600">Monitor each task progress and status.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
        <DataTable
          title="Tasks"
          columns={columns(handleView, handleEdit, handleDelete, getAssigneeDisplayName)}
            data={tasks}
            searchFields={searchFields}
            onAdd={handleOpenAdd}
          />
        </CardContent>
      </Card>

      <Dialog open={isAddOpen} onOpenChange={(open) => !open && setIsAddOpen(false)}>
        <DialogContent className="max-w-md">
          <form className="space-y-4" onSubmit={handleAddSubmit}>
            <DialogHeader>
              <DialogTitle>Add Task</DialogTitle>
            </DialogHeader>
            <div>
              <Label>Task Name</Label>
              <Input
                value={newTask.name}
                onChange={(event) => setNewTask({ ...newTask, name: event.target.value })}
                required
              />
            </div>
            <div>
              <Label>Project</Label>
              <Select
                value={newTask.project_id}
                onValueChange={(value) => setNewTask({ ...newTask, project_id: value })}
                required
                disabled={pendingProjectOptions.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {pendingProjectOptions.map((project) => (
                    <SelectItem key={project.id} value={String(project.id)}>
                      {project.name}
                      {project.project_code ? ` (${project.project_code})` : ""}
                    </SelectItem>
                  ))}
                  {pendingProjectOptions.length === 0 && (
                    <SelectItem value="" disabled>
                      No pending projects
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Assigned To</Label>
              <Select
                value={newTask.assigned_to}
                onValueChange={(value) => setNewTask({ ...newTask, assigned_to: value })}
                required
                disabled={isEmployeesLoading || employeeOptions.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employeeOptions.map((employee) => {
                    const identifier = getEmployeeIdentifier(employee)
                    return (
                      <SelectItem key={identifier} value={identifier}>
                        {employee.name}
                        {employee.employee_id ? ` (${employee.employee_id})` : ""}
                      </SelectItem>
                    )
                  })}
                  {!isEmployeesLoading && employeeOptions.length === 0 && (
                    <SelectItem value="" disabled>
                      No employees available
                    </SelectItem>
                  )}
                  {editAssignedTo && !employeeOptions.some((employee) => getEmployeeIdentifier(employee) === editAssignedTo) && (
                    <SelectItem value={editAssignedTo}>
                      {getAssigneeDisplayName(editAssignedTo)}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Due Date</Label>
              <Input
                type="date"
                value={newTask.due_date}
                onChange={(event) => setNewTask({ ...newTask, due_date: event.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Status</Label>
                <Select
                  value={newTask.status}
                  onValueChange={(value) => setNewTask({ ...newTask, status: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="not-started">Not Started</SelectItem>
                    <SelectItem value="delayed">Delayed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
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
              <Label>Progress (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={newTask.progress}
                onChange={(event) => setNewTask({ ...newTask, progress: Number(event.target.value) })}
                required
              />
            </div>
            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createTask.isPending}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>
          {viewTask && (
            <div className="space-y-3">
              {[
                { label: "Task Code", value: viewTask.task_code },
                { label: "Name", value: viewTask.name },
                { label: "Project", value: viewTask.project_name ?? `Project ${viewTask.project_id}` },
                { label: "Assigned To", value: getAssigneeDisplayName(viewTask.assigned_to) },
                { label: "Due Date", value: format(new Date(viewTask.due_date), "PPP") },
                { label: "Status", value: viewTask.status },
                { label: "Progress", value: `${viewTask.progress ?? 0}%` },
                { label: "Priority", value: viewTask.priority },
              ].map((field) => (
                <div key={field.label} className="rounded-xl border border-gray-200 bg-white p-3">
                  <p className="text-xs text-gray-500">{field.label}</p>
                  <p className="text-sm font-semibold text-gray-900">{field.value}</p>
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

      <Dialog open={isEditOpen} onOpenChange={(open) => !open && setIsEditOpen(false)}>
        <DialogContent className="max-w-md">
          <form className="space-y-4" onSubmit={handleUpdateSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
            </DialogHeader>
            <div>
              <Label>Task Name</Label>
              <Input value={editName} onChange={(event) => setEditName(event.target.value)} />
            </div>
            <div>
              <Label>Project ID</Label>
              <Input
                type="number"
                value={editProjectId}
                onChange={(event) => setEditProjectId(event.target.value)}
              />
            </div>
            <div>
              <Label>Assignee</Label>
              <Select
                value={editAssignedTo}
                onValueChange={(value) => setEditAssignedTo(value)}
                disabled={isEmployeesLoading || employeeOptions.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                {employeeOptions.map((employee) => {
                  const identifier = getEmployeeIdentifier(employee)
                  return (
                    <SelectItem key={identifier} value={identifier}>
                      {employee.name}
                      {employee.employee_id ? ` (${employee.employee_id})` : ""}
                    </SelectItem>
                  )
                })}
                {!isEmployeesLoading && employeeOptions.length === 0 && (
                  <SelectItem value="" disabled>
                    No employees available
                  </SelectItem>
                )}
                {editAssignedTo &&
                  !employeeOptions.some((employee) => getEmployeeIdentifier(employee) === editAssignedTo) && (
                    <SelectItem key={editAssignedTo} value={editAssignedTo}>
                      {getAssigneeDisplayName(editAssignedTo)}
                    </SelectItem>
                  )}
              </SelectContent>
            </Select>
          </div>
            <div>
              <Label>Due Date</Label>
              <Input
                type="date"
                value={editDueDate}
                onChange={(event) => setEditDueDate(event.target.value)}
              />
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={editPriority} onValueChange={(value) => setEditPriority(value)}>
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
            <div>
              <Label>Status</Label>
              <Select value={editStatus} onValueChange={(value) => setEditStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="not-started">Not Started</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                </SelectContent>
              </Select>
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
              <Button type="submit" disabled={updateTask.isPending}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <DeleteConfirmationDialog
        isOpen={isDeleteTaskDialogOpen}
        onClose={() => {
          setIsDeleteTaskDialogOpen(false)
          setDeleteTaskCandidate(null)
        }}
        onConfirm={handleConfirmDeleteTask}
        title="Delete Task"
        description={`Delete task "${deleteTaskCandidate?.name ?? "this task"}"?`}
        itemName={deleteTaskCandidate ? `Task ${deleteTaskCandidate.name}` : "Task"}
        isLoading={deleteTask.isPending}
      />
    </div>
  )
}
