export interface KnowledgeBaseArticle {
  id: number
  kb_id: string
  title: string
  category: string
  tags: string
  content: string
  attachments?: string
  views?: number
  helpful?: number
  comments?: number
  created_at: string
  updated_at: string
}

export interface GetKnowledgeBaseArticlesResponse {
  success: boolean
  data: {
    articles: KnowledgeBaseArticle[]
  }
}

export interface CreateKnowledgeBaseArticleRequest {
  title: string
  category: string
  tags?: string
  content: string
  attachments?: string
}

export interface CreateKnowledgeBaseArticleResponse {
  success: boolean
  message: string
  article: KnowledgeBaseArticle
}

export interface UpdateKnowledgeBaseArticleRequest {
  kb_id: string
  title?: string
  category?: string
  tags?: string
  content?: string
  attachments?: string
}

export interface UpdateKnowledgeBaseArticleResponse {
  success: boolean
  message: string
  article: KnowledgeBaseArticle
}

export interface DeleteKnowledgeBaseArticleResponse {
  success: boolean
  message: string
  kb_id: string
}
