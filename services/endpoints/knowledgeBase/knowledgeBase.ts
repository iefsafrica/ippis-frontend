import { del, get, patch, post } from "@/services/axios"
import type {
  CreateKnowledgeBaseArticleRequest,
  CreateKnowledgeBaseArticleResponse,
  DeleteKnowledgeBaseArticleResponse,
  GetKnowledgeBaseArticlesResponse,
  UpdateKnowledgeBaseArticleRequest,
  UpdateKnowledgeBaseArticleResponse,
} from "@/types/knowledgeBase"

const KNOWLEDGE_BASE_ENDPOINT = "/knowledge_base"

export const getKnowledgeBaseArticles = async (): Promise<GetKnowledgeBaseArticlesResponse> => {
  try {
    return await get<GetKnowledgeBaseArticlesResponse>(KNOWLEDGE_BASE_ENDPOINT)
  } catch (err: any) {
    if (typeof window !== "undefined") {
      try {
        const res = await fetch("/api/knowledge_base")
        if (res.ok) {
          return await res.json()
        }
      } catch {
        // continue to throw original error
      }
    }
    throw err
  }
}

export const createKnowledgeBaseArticle = async (
  payload: CreateKnowledgeBaseArticleRequest,
): Promise<CreateKnowledgeBaseArticleResponse> => {
  return post<CreateKnowledgeBaseArticleResponse>(KNOWLEDGE_BASE_ENDPOINT, payload)
}

export const updateKnowledgeBaseArticle = async (
  payload: UpdateKnowledgeBaseArticleRequest,
): Promise<UpdateKnowledgeBaseArticleResponse> => {
  return patch<UpdateKnowledgeBaseArticleResponse>(KNOWLEDGE_BASE_ENDPOINT, payload)
}

export const deleteKnowledgeBaseArticle = async (
  kbId: string,
): Promise<DeleteKnowledgeBaseArticleResponse> => {
  return del<DeleteKnowledgeBaseArticleResponse>(KNOWLEDGE_BASE_ENDPOINT, {
    kb_id: kbId,
  })
}
