"use client"

import { useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { ChevronLeft, Clock, Eye, Tag, Bookmark, Share2, ThumbsUp, Printer, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { useGetKnowledgeBaseArticles } from "@/services/hooks/knowledgeBase"
import type { KnowledgeBaseArticle } from "@/types/knowledgeBase"
import { toast } from "sonner"

export default function ArticlePage() {
  const params = useParams()
  const articleId = params?.id as string

  const { data, isLoading } = useGetKnowledgeBaseArticles()
  const [helpfulFeedback, setHelpfulFeedback] = useState<boolean | null>(null)
  const [isBookmarked, setIsBookmarked] = useState(false)

  const articles: KnowledgeBaseArticle[] = (data as any)?.data?.articles ?? []

  const article: KnowledgeBaseArticle | null = useMemo(() => {
    if (!articleId) return null
    return (
      articles.find(
        (a: KnowledgeBaseArticle) =>
          String(a.id) === String(articleId) ||
          String(a.kb_id).toLowerCase() === String(articleId).toLowerCase()
      ) ?? null
    )
  }, [articles, articleId])

  const relatedArticles: KnowledgeBaseArticle[] = useMemo(() => {
    if (!article) return []
    return articles
      .filter((a: KnowledgeBaseArticle) => a.id !== article.id && a.category === article.category)
      .slice(0, 4)
  }, [articles, article])

  const categories: string[] = useMemo(() => {
    const set = new Set(articles.map((a: KnowledgeBaseArticle) => a.category).filter(Boolean))
    return Array.from(set).sort()
  }, [articles])

  const tags: string[] = useMemo(() => {
    if (!article?.tags) return []
    return article.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
  }, [article])

  if (isLoading) {
    return (
      <div className="container mx-auto py-16 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-sm text-gray-500">Loading knowledge base article...</p>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="container mx-auto py-12 max-w-2xl text-center">
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Article Not Found</h2>
          <p className="text-sm text-gray-600 mb-6">
            The knowledge base article with identifier &quot;{articleId}&quot; does not exist or may have been removed.
          </p>
          <Link href="/admin/support-tickets/knowledge-base">
            <Button className="bg-[#008751] hover:bg-[#007545]">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Knowledge Base
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link href="/admin/support-tickets/knowledge-base">
          <Button variant="ghost" className="gap-1">
            <ChevronLeft className="h-4 w-4" /> Back to Knowledge Base
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200">
                  {article.category || "General"}
                </Badge>
                {article.kb_id && (
                  <span className="text-xs font-mono text-gray-400">ID: {article.kb_id}</span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900">{article.title}</h1>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground border-y border-gray-100 py-3">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    Updated:{" "}
                    {article.updated_at
                      ? new Date(article.updated_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Recently"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{article.views ?? 0} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{(article.helpful ?? 0) + (helpfulFeedback === true ? 1 : 0)} found this helpful</span>
                </div>
              </div>
            </div>

            <div className="prose max-w-none text-gray-800 whitespace-pre-line leading-relaxed">
              {article.content}
            </div>

            {article.attachments && (
              <div className="mt-6 p-4 rounded-lg bg-gray-50 border border-gray-200">
                <h4 className="text-xs font-semibold uppercase text-gray-500 mb-1">Attachments / Reference</h4>
                <a
                  href={article.attachments}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline break-all"
                >
                  {article.attachments}
                </a>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Was this article helpful?</p>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant={helpfulFeedback === true ? "default" : "outline"}
                      size="sm"
                      className={`gap-1 ${helpfulFeedback === true ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}
                      onClick={() => {
                        setHelpfulFeedback(true)
                        toast.success("Thank you for your feedback!")
                      }}
                    >
                      <ThumbsUp className="h-4 w-4" /> Yes
                    </Button>
                    <Button
                      variant={helpfulFeedback === false ? "default" : "outline"}
                      size="sm"
                      className={`gap-1 ${helpfulFeedback === false ? "bg-gray-600 text-white" : ""}`}
                      onClick={() => {
                        setHelpfulFeedback(false)
                        toast.info("Thank you for your feedback. We'll improve this guide.")
                      }}
                    >
                      No
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setIsBookmarked(!isBookmarked)
                      toast.success(isBookmarked ? "Bookmark removed" : "Article bookmarked")
                    }}
                    title="Bookmark"
                  >
                    <Bookmark className={`h-5 w-5 ${isBookmarked ? "fill-emerald-600 text-emerald-600" : ""}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        navigator.clipboard.writeText(window.location.href)
                        toast.success("Article link copied to clipboard")
                      }
                    }}
                    title="Share link"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (typeof window !== "undefined") window.print()
                    }}
                    title="Print"
                  >
                    <Printer className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 text-sm text-gray-900">Related Articles</h3>
              {relatedArticles.length === 0 ? (
                <p className="text-xs text-gray-500">No other articles in this category.</p>
              ) : (
                <ul className="space-y-3">
                  {relatedArticles.map((related: KnowledgeBaseArticle) => (
                    <li key={related.id}>
                      <Link
                        href={`/admin/support-tickets/knowledge-base/article/${related.kb_id || related.id}`}
                        className="text-sm text-emerald-700 hover:underline line-clamp-2"
                      >
                        {related.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 text-sm text-gray-900">Categories</h3>
              {categories.length === 0 ? (
                <p className="text-xs text-gray-500">No categories found.</p>
              ) : (
                <ul className="space-y-2">
                  {categories.map((cat: string) => (
                    <li key={cat}>
                      <Link
                        href="/admin/support-tickets/knowledge-base"
                        className={`text-sm hover:underline block truncate ${
                          cat === article.category ? "font-medium text-emerald-700" : "text-gray-600"
                        }`}
                      >
                        {cat}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2 text-sm text-gray-900">Need Help with This Guide?</h3>
              <p className="text-xs text-muted-foreground mb-3">
                If this article doesn&apos;t answer your question, raise a support ticket directly.
              </p>
              <Link href="/admin/support-tickets">
                <Button className="w-full bg-[#008751] hover:bg-[#007545] text-xs">
                  Create Support Ticket
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
