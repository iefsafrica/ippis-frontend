import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createKnowledgeBaseArticle,
  deleteKnowledgeBaseArticle,
  getKnowledgeBaseArticles,
  updateKnowledgeBaseArticle,
} from "@/services/endpoints/knowledgeBase/knowledgeBase"
import {
  KNOWLEDGE_BASE_ARTICLES,
  CREATE_KNOWLEDGE_BASE_ARTICLE,
  UPDATE_KNOWLEDGE_BASE_ARTICLE,
  DELETE_KNOWLEDGE_BASE_ARTICLE,
} from "@/services/constants/knowledgeBase"
import type {
  CreateKnowledgeBaseArticleRequest,
  CreateKnowledgeBaseArticleResponse,
  DeleteKnowledgeBaseArticleResponse,
  GetKnowledgeBaseArticlesResponse,
  UpdateKnowledgeBaseArticleRequest,
  UpdateKnowledgeBaseArticleResponse,
} from "@/types/knowledgeBase"

export const useGetKnowledgeBaseArticles = () => {
  return useQuery<GetKnowledgeBaseArticlesResponse>({
    queryKey: [KNOWLEDGE_BASE_ARTICLES],
    queryFn: getKnowledgeBaseArticles,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
  })
}

export const useCreateKnowledgeBaseArticle = () => {
  const queryClient = useQueryClient()
  return useMutation<CreateKnowledgeBaseArticleResponse, Error, CreateKnowledgeBaseArticleRequest>({
    mutationKey: [CREATE_KNOWLEDGE_BASE_ARTICLE],
    mutationFn: createKnowledgeBaseArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KNOWLEDGE_BASE_ARTICLES] })
    },
  })
}

export const useUpdateKnowledgeBaseArticle = () => {
  const queryClient = useQueryClient()
  return useMutation<UpdateKnowledgeBaseArticleResponse, Error, UpdateKnowledgeBaseArticleRequest>({
    mutationKey: [UPDATE_KNOWLEDGE_BASE_ARTICLE],
    mutationFn: updateKnowledgeBaseArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KNOWLEDGE_BASE_ARTICLES] })
    },
  })
}

export const useDeleteKnowledgeBaseArticle = () => {
  const queryClient = useQueryClient()
  return useMutation<DeleteKnowledgeBaseArticleResponse, Error, string>({
    mutationKey: [DELETE_KNOWLEDGE_BASE_ARTICLE],
    mutationFn: deleteKnowledgeBaseArticle,
    onSuccess: (_, kbId) => {
      queryClient.invalidateQueries({ queryKey: [KNOWLEDGE_BASE_ARTICLES] })
    },
  })
}
