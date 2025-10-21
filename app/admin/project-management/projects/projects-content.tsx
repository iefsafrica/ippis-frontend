"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
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
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"

// Mock data for projects
const projectsData = [
  {
    id: "PRJ-001",
    name: "IPPIS System Upgrade",
    client: "Federal Government",
    startDate: "2023-10-15",
    endDate: "2024-03-30",
    status: "in-progress",
    progress: 65,
    budget: "₦25,000,000",
    priority: "high",
    teamSize: 8,
  },
  {
    id: "PRJ-002",
    name: "HR Module Enhancement",
    client: "Ministry of Finance",
    startDate: "2023-11-01",
    endDate: "2024-01-15",
    status: "completed",
    progress: 100,
    budget: "₦8,500,000",
    priority: "medium",
    teamSize: 5,
  },
  {
    id: "PRJ-003",
    name: "Payroll Integration",
    client: "Ministry of Education",
    startDate: "2024-01-10",
    endDate: "2024-04-30",
    status: "in-progress",
    progress: 35,
    budget: "₦12,750,000",
    priority: "high",
    teamSize: 6,
  },
  {
    id: "PRJ-004",
    name: "Mobile App Development",
    client: "Civil Service Commission",
    startDate: "2024-02-01",
    endDate: "2024-07-31",
    status: "not-started",
    progress: 0,
    budget: "₦18,300,000",
    priority: "medium",
    teamSize: 7,
  },
  {
    id: "PRJ-005",
    name: "Data Migration Service",
    client: "Ministry of Health",
    startDate: "2023-09-15",
    endDate: "2023-12-31",
    status: "completed",
    progress: 100,
    budget: "₦6,200,000",
    priority: "low",
    teamSize: 4,
  },
]

export default function ProjectsContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  // Filter projects based on search term and status
  const filteredProjects = projectsData.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || project.status === statusFilter

    return matchesSearch && matchesStatus
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

  const handleViewProject = (project) => {
    setSelectedProject(project)
    setIsViewDialogOpen(true)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects Management</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add New Project
        </Button>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search projects..."
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
          <CardTitle>Projects List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Project ID</th>
                  <th className="text-left py-3 px-4 font-medium">Project Name</th>
                  <th className="text-left py-3 px-4 font-medium">Client</th>
                  <th className="text-left py-3 px-4 font-medium">Timeline</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Progress</th>
                  <th className="text-left py-3 px-4 font-medium">Priority</th>
                  <th className="text-left py-3 px-4 font-medium">Budget</th>
                  <th className="text-left py-3 px-4 font-medium">Team</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">{project.id}</td>
                    <td className="py-3 px-4 font-medium">{project.name}</td>
                    <td className="py-3 px-4">{project.client}</td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <div>Start: {project.startDate}</div>
                        <div>End: {project.endDate}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(project.status)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Progress value={project.progress} className="h-2 w-24" />
                        <span className="text-sm">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{getPriorityBadge(project.priority)}</td>
                    <td className="py-3 px-4">{project.budget}</td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <Users className="h-4 w-4 mr-1" /> {project.teamSize}
                      </Button>
                    </td>
                    <td className="py-3 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewProject(project)}>
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

          {filteredProjects.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">No projects found matching your criteria</div>
          )}

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {filteredProjects.length} of {projectsData.length} projects
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

      {/* Add New Project Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="details" className="mt-4">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="details">Project Details</TabsTrigger>
              <TabsTrigger value="team">Team & Budget</TabsTrigger>
              <TabsTrigger value="tasks">Tasks & Milestones</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input id="project-name" placeholder="Enter project name" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project-client">Client</Label>
                  <Select>
                    <SelectTrigger id="project-client">
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fg">Federal Government</SelectItem>
                      <SelectItem value="mof">Ministry of Finance</SelectItem>
                      <SelectItem value="moe">Ministry of Education</SelectItem>
                      <SelectItem value="csc">Civil Service Commission</SelectItem>
                      <SelectItem value="moh">Ministry of Health</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        <span>Select start date</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        <span>Select end date</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project-status">Status</Label>
                  <Select>
                    <SelectTrigger id="project-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not-started">Not Started</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project-priority">Priority</Label>
                  <Select>
                    <SelectTrigger id="project-priority">
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
                  <Label htmlFor="project-description">Description</Label>
                  <Textarea id="project-description" placeholder="Enter project description" rows={4} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="team" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="project-budget">Budget (₦)</Label>
                  <Input id="project-budget" placeholder="Enter budget amount" type="number" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project-manager">Project Manager</Label>
                  <Select>
                    <SelectTrigger id="project-manager">
                      <SelectValue placeholder="Select project manager" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="john-doe">John Doe</SelectItem>
                      <SelectItem value="jane-smith">Jane Smith</SelectItem>
                      <SelectItem value="robert-johnson">Robert Johnson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Team Members</Label>
                <div className="border rounded-md p-4 space-y-2">
                  {["Adebayo Olamide", "Chioma Eze", "Emeka Okafor", "Fatima Ibrahim", "Gabriel Okonkwo"].map(
                    (member, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Checkbox id={`member-${index}`} />
                        <Label htmlFor={`member-${index}`} className="font-normal">
                          {member}
                        </Label>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-notes">Budget Notes</Label>
                <Textarea id="project-notes" placeholder="Enter budget notes or special considerations" rows={3} />
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Project Milestones</Label>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" /> Add Milestone
                  </Button>
                </div>
                <div className="border rounded-md p-4">
                  <div className="text-center text-muted-foreground py-8">No milestones added yet</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Initial Tasks</Label>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" /> Add Task
                  </Button>
                </div>
                <div className="border rounded-md p-4">
                  <div className="text-center text-muted-foreground py-8">No tasks added yet</div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button>Create Project</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Project Details Dialog */}
      {selectedProject && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Project Details</DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="overview" className="mt-4">
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedProject.name}</h3>
                    <p className="text-muted-foreground">Project ID: {selectedProject.id}</p>
                  </div>

                  <div className="text-right">
                    {getStatusBadge(selectedProject.status)}
                    <div className="mt-1">{getPriorityBadge(selectedProject.priority)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Project Details</h4>
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-muted-foreground">Client:</span>
                        <span className="col-span-2">{selectedProject.client}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-muted-foreground">Start Date:</span>
                        <span className="col-span-2">{selectedProject.startDate}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-muted-foreground">End Date:</span>
                        <span className="col-span-2">{selectedProject.endDate}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-muted-foreground">Budget:</span>
                        <span className="col-span-2">{selectedProject.budget}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Progress</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Progress value={selectedProject.progress} className="h-2 flex-1" />
                        <span>{selectedProject.progress}%</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {selectedProject.progress < 100
                          ? `Project is in progress with ${selectedProject.progress}% completion`
                          : "Project has been completed"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">
                    This is a detailed description of the {selectedProject.name} project for {selectedProject.client}.
                    The project aims to improve the efficiency and effectiveness of the integrated personnel and payroll
                    system.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Recent Activities</h4>
                  <div className="space-y-2">
                    <div className="border-l-2 border-blue-500 pl-4 py-1">
                      <p className="font-medium">Task completed: Database migration</p>
                      <p className="text-sm text-muted-foreground">Yesterday at 14:30 by Adebayo Olamide</p>
                    </div>
                    <div className="border-l-2 border-green-500 pl-4 py-1">
                      <p className="font-medium">Milestone reached: Phase 1 completion</p>
                      <p className="text-sm text-muted-foreground">3 days ago by Project Manager</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tasks" className="mt-4">
                <div className="text-center py-12 text-muted-foreground">Task details would be displayed here</div>
              </TabsContent>

              <TabsContent value="team" className="mt-4">
                <div className="text-center py-12 text-muted-foreground">
                  Team member details would be displayed here
                </div>
              </TabsContent>

              <TabsContent value="files" className="mt-4">
                <div className="text-center py-12 text-muted-foreground">Project files would be displayed here</div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
              <Button variant="outline">
                <Printer className="w-4 h-4 mr-2" /> Print Details
              </Button>
              <Button>
                <Edit className="w-4 h-4 mr-2" /> Edit Project
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
