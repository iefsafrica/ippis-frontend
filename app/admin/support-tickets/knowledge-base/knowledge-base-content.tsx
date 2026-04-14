"use client"

import { FormEvent, useMemo, useState } from "react"
import { SupportTicketsShell } from "../components/support-tickets-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { DataTable } from "@/app/admin/core-hr/components/data-table"
import { AlertCircle, Eye, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  useCreateKnowledgeBaseArticle,
  useDeleteKnowledgeBaseArticle,
  useGetKnowledgeBaseArticles,
  useUpdateKnowledgeBaseArticle,
} from "@/services/hooks/knowledgeBase"
import type { KnowledgeBaseArticle } from "@/types/knowledgeBase"

const formDefaults = {
  title: "",
  category: "",
  tags: "",
  content: "",
  attachments: "",
}

type ArticleFormState = typeof formDefaults

const columns = (
  onView: (article: KnowledgeBaseArticle) => void,
  onEdit: (article: KnowledgeBaseArticle) => void,
  onDelete: (article: KnowledgeBaseArticle) => void,
) => [
  { key: "kb_id", label: "KB ID", sortable: true },
  {
    key: "title",
    label: "Title",
    sortable: true,
    render: (value: string) => <span className="font-semibold text-gray-900">{value}</span>,
  },
  { key: "category", label: "Category", sortable: true },
  {
    key: "updated_at",
    label: "Updated",
    sortable: true,
    render: (value: string) =>
      value ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A",
  },
  {
    key: "actions",
    label: "Actions",
    render: (_: any, row: { article: KnowledgeBaseArticle }) => (
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="icon"
          className="text-gray-600 hover:bg-gray-50"
          onClick={() => onView(row.article)}
          title="View article"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="text-blue-600 hover:bg-blue-50"
          onClick={() => onEdit(row.article)}
          title="Edit article"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="text-red-600 hover:bg-red-50"
          onClick={() => onDelete(row.article)}
          title="Delete article"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
]

export default function KnowledgeBaseContent() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState<ArticleFormState>(formDefaults)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editForm, setEditForm] = useState<ArticleFormState>(formDefaults)
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeBaseArticle | null>(null)
  const [deleteCandidate, setDeleteCandidate] = useState<KnowledgeBaseArticle | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [viewArticle, setViewArticle] = useState<KnowledgeBaseArticle | null>(null)

  const {
    data,
    isError,
    refetch,
    isLoading: isArticlesLoading,
  } = useGetKnowledgeBaseArticles()
  const createArticle = useCreateKnowledgeBaseArticle()
  const updateArticle = useUpdateKnowledgeBaseArticle()
  const deleteArticle = useDeleteKnowledgeBaseArticle()

  const articles = data?.data?.articles ?? []
  const categories = useMemo(() => {
    const categorized = Array.from(new Set(articles.map((article) => article.category ?? "Uncategorized")))
    return categorized.sort()
  }, [articles])

  const totalViews = articles.reduce((sum, article) => sum + (article.views ?? 0), 0)
  const recentUpdates = articles.filter((article) => {
    if (!article.updated_at) return false
    const diffMs = Date.now() - new Date(article.updated_at).getTime()
    return diffMs <= 7 * 24 * 60 * 60 * 1000
  }).length

  const stats = [
    { label: "Articles", value: articles.length, subtitle: "Published guides" },
    { label: "Categories", value: categories.length, subtitle: "Topic buckets" },
    { label: "Updated in 7 days", value: recentUpdates, subtitle: "Fresh content" },
  ]

  const tableData = useMemo(() => {
    return articles.map((article) => ({
      id: article.kb_id,
      kb_id: article.kb_id,
      title: article.title,
      category: article.category,
      tags: article.tags ?? "",
      updated_at: article.updated_at,
      article,
    }))
  }, [articles])

  const filteredData = tableData

  const handleCreateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      await createArticle.mutateAsync({
        title: createForm.title,
        category: createForm.category,
        tags: createForm.tags,
        content: createForm.content,
        attachments: createForm.attachments,
      })
      toast.success("Knowledge base article created")
      setCreateForm(formDefaults)
      setIsCreateOpen(false)
    } catch (error: any) {
      toast.error(error?.message || "Failed to create article")
    }
  }

  const handleView = (article: KnowledgeBaseArticle) => {
    setViewArticle(article)
  }

  const handleEditOpen = (article: KnowledgeBaseArticle) => {
    setSelectedArticle(article)
    setEditForm({
      title: article.title,
      category: article.category,
      tags: article.tags ?? "",
      content: article.content,
      attachments: article.attachments ?? "",
    })
    setIsEditOpen(true)
  }

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedArticle) return
    try {
      await updateArticle.mutateAsync({
        kb_id: selectedArticle.kb_id,
        title: editForm.title,
        category: editForm.category,
        tags: editForm.tags,
        content: editForm.content,
        attachments: editForm.attachments,
      })
      toast.success("Knowledge base article updated")
      setIsEditOpen(false)
      setSelectedArticle(null)
    } catch (error: any) {
      toast.error(error?.message || "Failed to update article")
    }
  }

  const handleDeleteRequest = (article: KnowledgeBaseArticle) => {
    setDeleteCandidate(article)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return
    try {
      await deleteArticle.mutateAsync(deleteCandidate.kb_id)
      toast.success("Article removed")
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete article")
    } finally {
      setIsDeleteDialogOpen(false)
      setDeleteCandidate(null)
    }
  }

  const createDialog = (
    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Create Knowledge Base Article</DialogTitle>
        </DialogHeader>
        <form className="grid gap-4 py-4" onSubmit={handleCreateSubmit}>
          <Input
            placeholder="Title"
            value={createForm.title}
            onChange={(event) => setCreateForm({ ...createForm, title: event.target.value })}
            required
          />
          <Input
            placeholder="Category"
            value={createForm.category}
            onChange={(event) => setCreateForm({ ...createForm, category: event.target.value })}
            required
          />
          <Input
            placeholder="Tags (comma separated)"
            value={createForm.tags}
            onChange={(event) => setCreateForm({ ...createForm, tags: event.target.value })}
          />
          <Textarea
            placeholder="Article content..."
            value={createForm.content}
            onChange={(event) => setCreateForm({ ...createForm, content: event.target.value })}
            className="min-h-[200px]"
            required
          />
          <Input
            placeholder="Attachments URL"
            value={createForm.attachments}
            onChange={(event) => setCreateForm({ ...createForm, attachments: event.target.value })}
          />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createArticle.isPending}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )

  const editDialog = (
    <Dialog open={isEditOpen} onOpenChange={(open) => setIsEditOpen(open)}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Edit Knowledge Base Article</DialogTitle>
        </DialogHeader>
        <form className="grid gap-4 py-4" onSubmit={handleEditSubmit}>
          <Input
            placeholder="Title"
            value={editForm.title}
            onChange={(event) => setEditForm({ ...editForm, title: event.target.value })}
            required
          />
          <Input
            placeholder="Category"
            value={editForm.category}
            onChange={(event) => setEditForm({ ...editForm, category: event.target.value })}
            required
          />
          <Input
            placeholder="Tags (comma separated)"
            value={editForm.tags}
            onChange={(event) => setEditForm({ ...editForm, tags: event.target.value })}
          />
          <Textarea
            placeholder="Article content..."
            value={editForm.content}
            onChange={(event) => setEditForm({ ...editForm, content: event.target.value })}
            className="min-h-[200px]"
            required
          />
          <Input
            placeholder="Attachments URL"
            value={editForm.attachments}
            onChange={(event) => setEditForm({ ...editForm, attachments: event.target.value })}
          />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateArticle.isPending}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )

  return (
    <SupportTicketsShell
      title="Knowledge Base"
      description="Browse articles and solutions to common questions and issues."
      stats={stats}
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
        <CardContent className="space-y-4">
          {isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Unable to load articles</AlertTitle>
              <AlertDescription>
                We had trouble fetching knowledge base articles. Try refreshing the list.
              </AlertDescription>
            </Alert>
          )}

          <DataTable
            title="Knowledge Base Articles"
            columns={columns(handleView, handleEditOpen, handleDeleteRequest)}
            data={filteredData}
            searchFields={[
              { name: "title", label: "Title", type: "text" },
              { name: "category", label: "Category", type: "text" },
              { name: "tags", label: "Tags", type: "text" },
            ]}
            exportLabel="Export articles"
            onAdd={() => setIsCreateOpen(true)}
            addButtonLoading={createArticle.isPending}
            addButtonLabel="New Article"
          />
        </CardContent>
      </Card>

      <Dialog open={Boolean(viewArticle)} onOpenChange={(open) => !open && setViewArticle(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Article Preview</DialogTitle>
          </DialogHeader>
          {viewArticle ? (
            <div className="space-y-3">
              <div>
                <p className="text-xs uppercase text-gray-400">Title</p>
                <p className="text-lg font-semibold text-gray-900">{viewArticle.title}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-400">Category</p>
                <p className="text-sm text-gray-700">{viewArticle.category}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-400">Content</p>
                <p className="text-sm text-gray-700 whitespace-pre-line">{viewArticle.content}</p>
              </div>
              {viewArticle.tags && (
                <div>
                  <p className="text-xs uppercase text-gray-400">Tags</p>
                  <p className="text-sm text-gray-700">{viewArticle.tags}</p>
                </div>
              )}
            </div>
          ) : (
            <p>No article selected</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewArticle(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {createDialog}
      {editDialog}

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setDeleteCandidate(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Knowledge Base Article"
        description={`Delete article "${deleteCandidate?.title ?? "this article"}"?`}
        itemName={deleteCandidate ? `Article ${deleteCandidate.kb_id}` : "Article"}
        isLoading={deleteArticle.isPending}
      />
    </SupportTicketsShell>
  )
}
