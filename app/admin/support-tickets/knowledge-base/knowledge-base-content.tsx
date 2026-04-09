"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { KnowledgeBaseCard } from "../components/knowledge-base-card"
import { ExportButtons } from "../components/export-buttons"
import { SupportTicketsShell } from "../components/support-tickets-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Search,
  Plus,
  FileText,
  HelpCircle,
  Folder,
  FolderOpen,
  Settings,
  Users,
  Shield,
  Database,
  Laptop,
} from "lucide-react"

const mockArticles = [
  {
    id: "kb-1001",
    title: "How to Reset Your Password",
    excerpt: "Learn how to reset your password if you've forgotten it or need to update it for security reasons.",
    category: "Account Management",
    tags: ["password", "security", "account"],
    views: 1245,
    lastUpdated: "2023-04-15",
    helpful: 89,
    comments: 5,
  },
  {
    id: "kb-1002",
    title: "Accessing Employee Self-Service Portal",
    excerpt:
      "Step-by-step guide to accessing and navigating the employee self-service portal for managing your information.",
    category: "Portal Access",
    tags: ["portal", "access", "employee"],
    views: 987,
    lastUpdated: "2023-05-02",
    helpful: 76,
    comments: 3,
  },
  {
    id: "kb-1003",
    title: "Submitting Time Off Requests",
    excerpt: "Learn how to submit time off requests through the HR system and track their approval status.",
    category: "HR Procedures",
    tags: ["time-off", "leave", "hr"],
    views: 1532,
    lastUpdated: "2023-03-28",
    helpful: 124,
    comments: 8,
  },
  {
    id: "kb-1004",
    title: "Troubleshooting VPN Connection Issues",
    excerpt: "Common solutions for VPN connection problems when working remotely or accessing internal systems.",
    category: "IT Support",
    tags: ["vpn", "remote", "connection"],
    views: 2156,
    lastUpdated: "2023-05-10",
    helpful: 187,
    comments: 12,
  },
  {
    id: "kb-1005",
    title: "Expense Report Submission Guidelines",
    excerpt: "Guidelines and best practices for submitting expense reports for timely processing and reimbursement.",
    category: "Finance",
    tags: ["expenses", "reimbursement", "finance"],
    views: 876,
    lastUpdated: "2023-04-05",
    helpful: 65,
    comments: 4,
  },
  {
    id: "kb-1006",
    title: "Setting Up Multi-Factor Authentication",
    excerpt: "Instructions for setting up multi-factor authentication to enhance the security of your account.",
    category: "Security",
    tags: ["mfa", "security", "authentication"],
    views: 1345,
    lastUpdated: "2023-05-08",
    helpful: 112,
    comments: 6,
  },
]

const categoryIcons: Record<string, React.ReactNode> = {
  "Account Management": <Users className="h-5 w-5" />,
  "Portal Access": <Laptop className="h-5 w-5" />,
  "HR Procedures": <FileText className="h-5 w-5" />,
  "IT Support": <Settings className="h-5 w-5" />,
  Finance: <Database className="h-5 w-5" />,
  Security: <Shield className="h-5 w-5" />,
}

export default function KnowledgeBaseContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const categories = useMemo(() => Array.from(new Set(mockArticles.map((article) => article.category))), [])

  const filteredArticles = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase()
    return mockArticles.filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(lowerSearch) ||
        article.excerpt.toLowerCase().includes(lowerSearch) ||
        article.tags.some((tag) => tag.toLowerCase().includes(lowerSearch))

      const matchesCategory = selectedCategory === "all" || article.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [searchTerm, selectedCategory])

  const totalViews = mockArticles.reduce((sum, article) => sum + article.views, 0)

  const stats = [
    { label: "Articles", value: mockArticles.length, subtitle: "Published guides" },
    { label: "Categories", value: categories.length, subtitle: "Topic buckets" },
    { label: "Total Views", value: totalViews.toLocaleString(), subtitle: "Reader engagement" },
  ]

  const createArticleDialog = (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          New Article
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Create Knowledge Base Article</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="title" className="text-right">
              Title
            </label>
            <Input id="title" placeholder="Article title" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="category" className="text-right">
              Category
            </label>
            <select id="category" className="col-span-3 border rounded-md p-2">
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
              <option value="new">+ Add New Category</option>
            </select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="tags" className="text-right">
              Tags
            </label>
            <Input id="tags" placeholder="Enter tags separated by commas" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <label htmlFor="content" className="text-right pt-2">
              Content
            </label>
            <div className="col-span-3 border rounded-md p-2 min-h-[300px]">
              <div className="border-b pb-2 mb-2 flex gap-2">
                <Button variant="outline" size="sm">
                  B
                </Button>
                <Button variant="outline" size="sm">
                  I
                </Button>
                <Button variant="outline" size="sm">
                  U
                </Button>
                <Button variant="outline" size="sm">
                  Link
                </Button>
                <Button variant="outline" size="sm">
                  Image
                </Button>
                <Button variant="outline" size="sm">
                  List
                </Button>
              </div>
              <textarea
                id="content"
                placeholder="Article content..."
                className="w-full min-h-[250px] resize-none border-none focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="attachments" className="text-right">
              Attachments
            </label>
            <Input id="attachments" type="file" multiple className="col-span-3" />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline">Save as Draft</Button>
          <Button>Publish Article</Button>
        </div>
      </DialogContent>
    </Dialog>
  )

  return (
    <SupportTicketsShell
      title="Knowledge Base"
      description="Browse articles and solutions to common questions and issues."
      stats={stats}
      actions={createArticleDialog}
    >
      <Card className="border border-gray-200 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">Knowledge Library</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Surface helpful documentation and reduce repeated questions.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <ExportButtons />
            </div>
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search knowledge base..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card
              className={`cursor-pointer hover:bg-gray-50 ${selectedCategory === "all" ? "border-primary" : ""}`}
              onClick={() => setSelectedCategory("all")}
            >
              <CardContent className="flex flex-col items-center justify-center p-4">
                <FolderOpen className="h-8 w-8 mb-2 text-primary" />
                <CardTitle className="text-sm font-medium text-center">All Categories</CardTitle>
                <CardDescription className="text-xs text-center">{mockArticles.length} articles</CardDescription>
              </CardContent>
            </Card>

            {categories.map((category) => (
              <Card
                key={category}
                className={`cursor-pointer hover:bg-gray-50 ${selectedCategory === category ? "border-primary" : ""}`}
                onClick={() => setSelectedCategory(category)}
              >
                <CardContent className="flex flex-col items-center justify-center p-4">
                  {categoryIcons[category] || <Folder className="h-8 w-8 mb-2 text-primary" />}
                  <CardTitle className="text-sm font-medium text-center">{category}</CardTitle>
                  <CardDescription className="text-xs text-center">
                    {mockArticles.filter((a) => a.category === category).length} articles
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="featured">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="featured">Featured</TabsTrigger>
              <TabsTrigger value="recent">Recently Updated</TabsTrigger>
              <TabsTrigger value="popular">Most Viewed</TabsTrigger>
            </TabsList>

            <TabsContent value="featured" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.slice(0, 6).map((article) => (
                  <KnowledgeBaseCard key={article.id} article={article} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recent" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles
                  .slice()
                  .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
                  .slice(0, 6)
                  .map((article) => (
                    <KnowledgeBaseCard key={article.id} article={article} />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="popular" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles
                  .slice()
                  .sort((a, b) => b.views - a.views)
                  .slice(0, 6)
                  .map((article) => (
                    <KnowledgeBaseCard key={article.id} article={article} />
                  ))}
              </div>
            </TabsContent>
          </Tabs>

          {filteredArticles.length === 0 && (
            <Card className="bg-gray-50">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <HelpCircle className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Can't find what you're looking for?</h3>
                <p className="text-gray-500 mb-4">Try adjusting your search or browse through different categories.</p>
                <Button>Create Support Ticket</Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </SupportTicketsShell>
  )
}
