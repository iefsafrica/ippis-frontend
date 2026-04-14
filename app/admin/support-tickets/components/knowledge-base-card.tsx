"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Eye,
  Calendar,
  ThumbsUp,
  MessageSquare,
  Bookmark,
  Share2,
  Edit,
  Trash2,
} from "lucide-react"
import type { KnowledgeBaseArticle } from "@/types/knowledgeBase"

interface KnowledgeBaseCardProps {
  article: KnowledgeBaseArticle
  onEdit?: (article: KnowledgeBaseArticle) => void
  onDelete?: (article: KnowledgeBaseArticle) => void
}

export function KnowledgeBaseCard({ article, onEdit, onDelete }: KnowledgeBaseCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const tags = article.tags
    ? article.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
    : []

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge className="mb-2">{article.category}</Badge>
          <Button
            variant="ghost"
            size="icon"
            className={isBookmarked ? "text-yellow-500" : ""}
            onClick={() => setIsBookmarked(!isBookmarked)}
          >
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>
        <CardTitle className="text-lg font-semibold line-clamp-2">{article.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-gray-600 line-clamp-3 mb-3">{article.content}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-2 border-t flex flex-col gap-2 text-xs text-gray-500">
        <div className="flex items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {article.views ?? 0}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(article.updated_at)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <ThumbsUp className="h-3 w-3" />
              {article.helpful ?? 0}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {article.comments ?? 0}
            </span>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Share2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          {onEdit && (
            <Button variant="outline" size="icon" onClick={() => onEdit(article)} title="Edit article">
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button variant="outline" size="icon" onClick={() => onDelete(article)} title="Delete article">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
