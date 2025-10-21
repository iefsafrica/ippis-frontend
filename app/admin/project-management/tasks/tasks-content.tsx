"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  CalendarIcon,
  Download,
  FileText,
  Printer,
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"

// Mock data for tasks
const tasksData = [
  {
    id: "TSK-001",
    name: "Database Schema Design",
    project: "IPPIS System Upgrade",
    assignedTo: "Adebayo Olamide",
    dueDate: "2023-11-30",
    status: "completed",
    progress: 100,
    priority: "high",
  },
  {
    id: "TSK-002",
    name: "API Development",
    project: "IPPIS System Upgrade",
    assignedTo: "Chioma Eze",
    dueDate: "2023-12-15",
    status: "in-progress",
    progress: 75,
    priority: "high",
  },
  {
    id: "TSK-003",
    name: "Frontend Implementation",
    project: "IPPIS System Upgrade",
    assignedTo: "Emeka Okafor",
    dueDate: "2024-01-20",
    status: "in-progress",
    progress: 40,
    priority: "medium",
  },
  {
    id: "TSK-004",
    name: "User Authentication Module",
    project: "HR Module Enhancement",
    assignedTo: "Fatima Ibrahim",
    dueDate: "2023-12-10",
    status: "completed",
    progress: 100,
    priority: "high",
  },
  {
    id: "TSK-005",
    name: "Payroll Calculation Logic",
    project: "Payroll Integration",
    assignedTo: "Gabriel Okonkwo",
    dueDate: "2024-02-28",
    status: "not-started",
    progress: 0,
    priority: "medium",
  },
  {
    id: "TSK-006",
    name: "Mobile UI Design",
    project: "Mobile App Development",
    assignedTo: "Adebayo Olamide",
    dueDate: "2024-03-15",
    status: "delayed",
    progress: 25,
    priority: "high",
  },
]

export default function TasksContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [projectFilter, setProjectFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  // Filter tasks based on search term, status and project
  const filteredTasks = tasksData.filter((task) => {
    const matchesSearch =
      task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    const matchesProject = projectFilter === "all" || task.project === projectFilter

    return matchesSearch && matchesStatus && matchesProject
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
          </Badge>
        )
      case "in-progress":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">
            <Clock className="w-3 h-3 mr-1" /> In Progress
          </Badge>
        )
      case "not-started":
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600">
            <AlertCircle className="w-3 h-3 mr-1" /> Not Started
          </Badge>
        )
      case "delayed":
        return (
          <Badge className="bg-red-500 hover:bg-red-600">
            <AlertTriangle className="w-3 h-3 mr-1" /> Delayed
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>
      case "medium":
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-500">
            Medium
          </Badge>
        )
      case "low":
        return (
          <Badge variant="outline" className="border-green-500 text-green-500">
            Low
          </Badge>
        )
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const handleViewTask = (task) => {
    setSelectedTask(task)
    setIsViewDialogOpen(true)
  }

  // Get unique projects for filter
  const projects = [...new Set(tasksData.map((task) => task.project))]

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tasks Management</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add New Task
        </Button>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search tasks..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="not-started">Not Started</SelectItem>
            <SelectItem value="delayed">Delayed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((project, index) => (
              <SelectItem key={index} value={project}>
                {project}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" /> Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <FileText className="w-4 h-4 mr-2" /> Export to CSV
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileText className="w-4 h-4 mr-2" /> Export to PDF
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Printer className="w-4 h-4 mr-2" /> Print
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Tasks List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Task ID</th>
                  <th className="text-left py-3 px-4 font-medium">Task Name</th>
                  <th className="text-left py-3 px-4 font-medium">Project</th>
                  <th className="text-left py-3 px-4 font-medium">Assigned To</th>
                  <th className="text-left py-3 px-4 font-medium">Due Date</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Progress</th>
                  <th className="text-left py-3 px-4 font-medium">Priority</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">{task.id}</td>
                    <td className="py-3 px-4 font-medium">{task.name}</td>
                    <td className="py-3 px-4">{task.project}</td>
                    <td className="py-3 px-4">{task.assignedTo}</td>
                    <td className="py-3 px-4">{task.dueDate}</td>
                    <td className="py-3 px-4">{getStatusBadge(task.status)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Progress value={task.progress} className="h-2 w-24" />
                        <span className="text-sm">{task.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{getPriorityBadge(task.priority)}</td>
                    <td className="py-3 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewTask(task)}>
                            <FileText className="w-4 h-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTasks.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">No tasks found matching your criteria</div>
          )}

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {filteredTasks.length} of {tasksData.length} tasks
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add New Task Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="task-name">Task Name</Label>
              <Input id="task-name" placeholder="Enter task name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-project">Project</Label>
              <Select>
                <SelectTrigger id="task-project">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project, index) => (
                    <SelectItem key={index} value={project}>
                      {project}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-assignee">Assigned To</Label>
              <Select>
                <SelectTrigger id="task-assignee">
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adebayo">Adebayo Olamide</SelectItem>
                  <SelectItem value="chioma">Chioma Eze</SelectItem>
                  <SelectItem value="emeka">Emeka Okafor</SelectItem>
                  <SelectItem value="fatima">Fatima Ibrahim</SelectItem>
                  <SelectItem value="gabriel">Gabriel Okonkwo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>Select due date</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-status">Status</Label>
              <Select>
                <SelectTrigger id="task-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-started">Not Started</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-priority">Priority</Label>
              <Select>
                <SelectTrigger id="task-priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="task-description">Description</Label>
              <Textarea id="task-description" placeholder="Enter task description" rows={4} />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button>Create Task</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Task Details Dialog */}
      {selectedTask && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Task Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedTask.name}</h3>
                  <p className="text-muted-foreground">Task ID: {selectedTask.id}</p>
                </div>

                <div className="text-right">
                  {getStatusBadge(selectedTask.status)}
                  <div className="mt-1">{getPriorityBadge(selectedTask.priority)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Task Details</h4>
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-muted-foreground">Project:</span>
                      <span className="col-span-2">{selectedTask.project}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-muted-foreground">Assigned To:</span>
                      <span className="col-span-2">{selectedTask.assignedTo}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-muted-foreground">Due Date:</span>
                      <span className="col-span-2">{selectedTask.dueDate}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Progress</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Progress value={selectedTask.progress} className="h-2 flex-1" />
                      <span>{selectedTask.progress}%</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedTask.progress < 100
                        ? `Task is in progress with ${selectedTask.progress}% completion`
                        : "Task has been completed"}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-muted-foreground">
                  This is a detailed description of the {selectedTask.name} task for the {selectedTask.project} project.
                  The task involves implementing key functionality required for the project success.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Comments</h4>
                <div className="space-y-2">
                  <div className="border-l-2 border-blue-500 pl-4 py-1">
                    <p className="font-medium">Progress update</p>
                    <p className="text-sm">Completed the initial phase of implementation.</p>
                    <p className="text-xs text-muted-foreground">Yesterday at 14:30 by {selectedTask.assignedTo}</p>
                  </div>
                  <div className="border-l-2 border-green-500 pl-4 py-1">
                    <p className="font-medium">Resource allocation</p>
                    <p className="text-sm">Additional resources have been allocated to this task.</p>
                    <p className="text-xs text-muted-foreground">3 days ago by Project Manager</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
              <Button variant="outline">
                <Printer className="w-4 h-4 mr-2" /> Print Details
              </Button>
              <Button>
                <Edit className="w-4 h-4 mr-2" /> Edit Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
