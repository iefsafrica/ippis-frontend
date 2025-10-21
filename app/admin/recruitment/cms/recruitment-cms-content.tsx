"use client"

import { useState } from "react"
import { EnhancedDataTable } from "@/app/admin/components/enhanced-data-table"
import type { FormField } from "@/app/admin/components/enhanced-form"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Mock data
const cmsContents = [
  {
    id: "1",
    title: "Software Engineer Career Path",
    type: "career_path",
    lastUpdated: "2023-05-15T00:00:00.000Z",
    status: "published",
    author: "John Doe",
    authorId: "101",
    authorPhoto: "/thoughtful-man.png",
    content: "# Software Engineer Career Path\n\nJoin our engineering team and grow your career...",
    seoTitle: "Software Engineer Career Path | IPPIS",
    seoDescription: "Explore the career path for software engineers at our organization.",
    tags: ["engineering", "career", "software"],
    views: 1250,
    createdAt: "2023-04-10T00:00:00.000Z",
    updatedAt: "2023-05-15T00:00:00.000Z",
    slug: "software-engineer-career-path",
    featuredImage: "/software-engineering-concept.png",
  },
  {
    id: "2",
    title: "How to Prepare for Your Interview",
    type: "guide",
    lastUpdated: "2023-05-10T00:00:00.000Z",
    status: "published",
    author: "Jane Smith",
    authorId: "102",
    authorPhoto: "/diverse-woman-portrait.png",
    content: "# How to Prepare for Your Interview\n\nFollow these steps to ace your interview...",
    seoTitle: "Interview Preparation Guide | IPPIS",
    seoDescription: "Learn how to prepare for your job interview with our comprehensive guide.",
    tags: ["interview", "preparation", "tips"],
    views: 3450,
    createdAt: "2023-03-20T00:00:00.000Z",
    updatedAt: "2023-05-10T00:00:00.000Z",
    slug: "how-to-prepare-for-your-interview",
    featuredImage: "/job-interview-scene.png",
  },
  {
    id: "3",
    title: "Benefits and Perks",
    type: "benefits",
    lastUpdated: "2023-04-25T00:00:00.000Z",
    status: "published",
    author: "Michael Johnson",
    authorId: "103",
    authorPhoto: "/thoughtful-man.png",
    content: "# Benefits and Perks\n\nDiscover the comprehensive benefits package we offer...",
    seoTitle: "Employee Benefits and Perks | IPPIS",
    seoDescription: "Learn about our competitive benefits package and employee perks.",
    tags: ["benefits", "perks", "employees"],
    views: 2100,
    createdAt: "2023-02-15T00:00:00.000Z",
    updatedAt: "2023-04-25T00:00:00.000Z",
    slug: "benefits-and-perks",
    featuredImage: "/employee-benefits-collage.png",
  },
  {
    id: "4",
    title: "Our Recruitment Process",
    type: "process",
    lastUpdated: "2023-05-18T00:00:00.000Z",
    status: "published",
    author: "Sarah Williams",
    authorId: "104",
    authorPhoto: "/diverse-woman-portrait.png",
    content: "# Our Recruitment Process\n\nUnderstand the steps in our recruitment process...",
    seoTitle: "Recruitment Process | IPPIS",
    seoDescription: "Learn about our recruitment process from application to onboarding.",
    tags: ["recruitment", "process", "hiring"],
    views: 1850,
    createdAt: "2023-04-05T00:00:00.000Z",
    updatedAt: "2023-05-18T00:00:00.000Z",
    slug: "our-recruitment-process",
    featuredImage: "/placeholder.svg?key=njc6t",
  },
  {
    id: "5",
    title: "Diversity and Inclusion Statement",
    type: "policy",
    lastUpdated: "2023-05-05T00:00:00.000Z",
    status: "published",
    author: "David Brown",
    authorId: "105",
    authorPhoto: "/thoughtful-man.png",
    content: "# Diversity and Inclusion Statement\n\nOur commitment to fostering a diverse and inclusive workplace...",
    seoTitle: "Diversity and Inclusion | IPPIS",
    seoDescription: "Read about our commitment to diversity and inclusion in the workplace.",
    tags: ["diversity", "inclusion", "policy"],
    views: 1200,
    createdAt: "2023-03-10T00:00:00.000Z",
    updatedAt: "2023-05-05T00:00:00.000Z",
    slug: "diversity-and-inclusion-statement",
    featuredImage: "/diversity-inclusion-abstract.png",
  },
  {
    id: "6",
    title: "Job Application FAQ",
    type: "faq",
    lastUpdated: "2023-05-20T00:00:00.000Z",
    status: "draft",
    author: "Emily Davis",
    authorId: "106",
    authorPhoto: "/diverse-woman-portrait.png",
    content: "# Job Application FAQ\n\nFrequently asked questions about our job application process...",
    seoTitle: "Job Application FAQ | IPPIS",
    seoDescription: "Find answers to frequently asked questions about our job application process.",
    tags: ["faq", "application", "questions"],
    views: 0,
    createdAt: "2023-05-20T00:00:00.000Z",
    updatedAt: "2023-05-20T00:00:00.000Z",
    slug: "job-application-faq",
    featuredImage: "/placeholder.svg?key=gx199",
  },
]

// Form fields for adding/editing CMS content
const cmsContentFields: FormField[] = [
  {
    name: "title",
    label: "Content Title",
    type: "text",
    placeholder: "Enter content title",
    required: true,
  },
  {
    name: "type",
    label: "Content Type",
    type: "select",
    options: [
      { value: "career_path", label: "Career Path" },
      { value: "guide", label: "Guide" },
      { value: "benefits", label: "Benefits" },
      { value: "process", label: "Process" },
      { value: "policy", label: "Policy" },
      { value: "faq", label: "FAQ" },
      { value: "job_description", label: "Job Description Template" },
    ],
    required: true,
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "draft", label: "Draft" },
      { value: "review", label: "Under Review" },
      { value: "published", label: "Published" },
      { value: "archived", label: "Archived" },
    ],
    required: true,
  },
  {
    name: "slug",
    label: "URL Slug",
    type: "text",
    placeholder: "Enter URL slug (e.g., career-path-software-engineer)",
    required: true,
  },
  {
    name: "featuredImage",
    label: "Featured Image",
    type: "file",
    accept: "image/*",
    description: "Upload a featured image for this content",
  },
  {
    name: "content",
    label: "Content Body",
    type: "textarea",
    placeholder: "Enter content body (Markdown supported)",
    required: true,
  },
  {
    name: "seoTitle",
    label: "SEO Title",
    type: "text",
    placeholder: "Enter SEO title",
    required: true,
  },
  {
    name: "seoDescription",
    label: "SEO Description",
    type: "textarea",
    placeholder: "Enter SEO description",
    required: true,
  },
  {
    name: "tags",
    label: "Tags",
    type: "text",
    placeholder: "Enter tags separated by commas",
    description: "Enter tags to categorize this content",
    required: true,
  },
]

export function RecruitmentCMSContent() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedContent, setSelectedContent] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleAdd = async (data: Record<string, any>) => {
    setIsSubmitting(true)
    try {
      console.log("Adding CMS content:", data)
      // Here you would typically make an API call to add the CMS content
      // For this mockup, we're just logging the data
      setTimeout(() => {
        setIsSubmitting(false)
        setIsAddDialogOpen(false)
      }, 1000)
    } catch (error) {
      console.error("Error adding CMS content:", error)
      setIsSubmitting(false)
    }
  }

  const handleEdit = async (data: Record<string, any>) => {
    setIsSubmitting(true)
    try {
      console.log("Editing CMS content:", data)
      // Here you would typically make an API call to update the CMS content
      // For this mockup, we're just logging the data
      setTimeout(() => {
        setIsSubmitting(false)
        setIsEditDialogOpen(false)
      }, 1000)
    } catch (error) {
      console.error("Error editing CMS content:", error)
      setIsSubmitting(false)
    }
  }

  const handleDelete = (id: string) => {
    console.log("Deleting CMS content:", id)
    // Here you would typically make an API call to delete the CMS content
    // For this mockup, we're just logging the data
  }

  const handleView = (id: string) => {
    const content = cmsContents.find((content) => content.id === id)
    if (content) {
      setSelectedContent(content)
      setIsViewDialogOpen(true)
    }
  }

  const handleEdit2 = (id: string) => {
    const content = cmsContents.find((content) => content.id === id)
    if (content) {
      setSelectedContent(content)
      setIsEditDialogOpen(true)
    }
  }

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500">Published</Badge>
      case "draft":
        return <Badge variant="outline">Draft</Badge>
      case "review":
        return <Badge className="bg-yellow-500">Under Review</Badge>
      case "archived":
        return <Badge variant="secondary">Archived</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const renderTypeBadge = (type: string) => {
    switch (type) {
      case "career_path":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Career Path
          </Badge>
        )
      case "guide":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Guide
          </Badge>
        )
      case "benefits":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800">
            Benefits
          </Badge>
        )
      case "process":
        return (
          <Badge variant="outline" className="bg-orange-100 text-orange-800">
            Process
          </Badge>
        )
      case "policy":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Policy
          </Badge>
        )
      case "faq":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            FAQ
          </Badge>
        )
      case "job_description":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            Job Description
          </Badge>
        )
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <EnhancedDataTable
        title="Recruitment CMS"
        description="Manage recruitment-related content for your career site"
        columns={[
          {
            key: "title",
            label: "Title",
            sortable: true,
          },
          {
            key: "type",
            label: "Type",
            sortable: true,
            render: (value) => renderTypeBadge(value),
          },
          {
            key: "lastUpdated",
            label: "Last Updated",
            sortable: true,
            render: (value) => format(new Date(value), "MMM dd, yyyy"),
          },
          {
            key: "status",
            label: "Status",
            sortable: true,
            render: (value) => renderStatusBadge(value),
          },
          {
            key: "author",
            label: "Author",
            sortable: true,
            render: (value, row) => (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={row.authorPhoto || "/placeholder.svg"} alt={value} />
                  <AvatarFallback>
                    {value
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <span>{value}</span>
              </div>
            ),
          },
          {
            key: "views",
            label: "Views",
            sortable: true,
            render: (value) => value.toLocaleString(),
          },
        ]}
        data={cmsContents}
        filterOptions={[
          {
            id: "type",
            label: "Content Type",
            type: "select",
            options: [
              { value: "career_path", label: "Career Path" },
              { value: "guide", label: "Guide" },
              { value: "benefits", label: "Benefits" },
              { value: "process", label: "Process" },
              { value: "policy", label: "Policy" },
              { value: "faq", label: "FAQ" },
              { value: "job_description", label: "Job Description Template" },
            ],
          },
          {
            id: "status",
            label: "Status",
            type: "select",
            options: [
              { value: "published", label: "Published" },
              { value: "draft", label: "Draft" },
              { value: "review", label: "Under Review" },
              { value: "archived", label: "Archived" },
            ],
          },
          {
            id: "lastUpdated",
            label: "Last Updated",
            type: "date",
          },
        ]}
        onAdd={() => setIsAddDialogOpen(true)}
        onEdit={handleEdit2}
        onDelete={handleDelete}
        onView={handleView}
        formFields={cmsContentFields}
        formTitle="Content Management"
        formDescription="Add or edit recruitment content"
        onSubmit={handleAdd}
        onUpdate={handleEdit}
        isSubmitting={isSubmitting}
        isAddDialogOpen={isAddDialogOpen}
        setIsAddDialogOpen={setIsAddDialogOpen}
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        isViewDialogOpen={isViewDialogOpen}
        setIsViewDialogOpen={setIsViewDialogOpen}
        selectedItem={selectedContent}
        exportOptions={{
          csv: true,
          pdf: true,
          print: true,
        }}
        additionalActions={[
          {
            label: "Preview",
            onClick: (id) => {
              const content = cmsContents.find((content) => content.id === id)
              if (content) {
                setPreviewUrl(`/admin/recruitment/cms/preview/${content.slug}`)
                window.open(`/admin/recruitment/cms/preview/${content.slug}`, "_blank")
              }
            },
            icon: "Eye",
          },
          {
            label: "Publish",
            onClick: (id) => {
              console.log("Publishing content:", id)
              // Here you would typically make an API call to publish the content
            },
            icon: "Upload",
            showIf: (row) => row.status === "draft" || row.status === "review",
          },
          {
            label: "Archive",
            onClick: (id) => {
              console.log("Archiving content:", id)
              // Here you would typically make an API call to archive the content
            },
            icon: "Archive",
            showIf: (row) => row.status === "published",
          },
        ]}
        viewRenderer={(item) => (
          <div className="space-y-4 p-4">
            <div className="flex justify-between">
              <h2 className="text-2xl font-bold">{item.title}</h2>
              {renderStatusBadge(item.status)}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>By {item.author}</span>
              <span>•</span>
              <span>Last updated: {format(new Date(item.lastUpdated), "MMM dd, yyyy")}</span>
              <span>•</span>
              <span>{item.views.toLocaleString()} views</span>
            </div>
            <div className="rounded-md border p-2">
              <h3 className="font-semibold">SEO Information</h3>
              <div className="mt-2 space-y-1 text-sm">
                <p>
                  <span className="font-medium">Title:</span> {item.seoTitle}
                </p>
                <p>
                  <span className="font-medium">Description:</span> {item.seoDescription}
                </p>
                <p>
                  <span className="font-medium">URL:</span> /careers/{item.slug}
                </p>
              </div>
            </div>
            <div className="rounded-md border p-2">
              <h3 className="font-semibold">Tags</h3>
              <div className="mt-2 flex flex-wrap gap-1">
                {item.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline" className="bg-gray-100">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="rounded-md border p-2">
              <h3 className="font-semibold">Content Preview</h3>
              <div className="mt-2 max-h-60 overflow-y-auto rounded bg-gray-50 p-3 text-sm">
                <pre className="whitespace-pre-wrap">{item.content}</pre>
              </div>
            </div>
          </div>
        )}
      />
    </div>
  )
}
