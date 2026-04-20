import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  CREATE_ASSET_CATEGORY,
  DELETE_ASSET_CATEGORY,
  GET_ASSET_CATEGORIES,
  GET_ASSET_CATEGORY,
  UPDATE_ASSET_CATEGORY,
} from "@/services/constants/assets"
import {
  createAssetCategory,
  deleteAssetCategory,
  getAssetCategories,
  getAssetCategory,
  updateAssetCategory,
} from "@/services/endpoints/assets/categories"
import type {
  CreateAssetCategoryRequest,
  CreateAssetCategoryResponse,
  DeleteAssetCategoryResponse,
  GetAssetCategoriesResponse,
  GetAssetCategoryResponse,
  UpdateAssetCategoryRequest,
  UpdateAssetCategoryResponse,
} from "@/types/assets/categories"

export const useGetAssetCategories = (params?: { category_id?: string }) => {
  return useQuery<GetAssetCategoriesResponse>({
    queryKey: [GET_ASSET_CATEGORIES, params ?? {}],
    queryFn: () => getAssetCategories(params),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })
}

export const useGetAssetCategory = (categoryId?: string, enabled = true) => {
  return useQuery<GetAssetCategoryResponse>({
    queryKey: [GET_ASSET_CATEGORY, categoryId],
    queryFn: () => getAssetCategory(categoryId || ""),
    enabled: Boolean(categoryId) && enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })
}

export const useCreateAssetCategory = () => {
  const queryClient = useQueryClient()
  return useMutation<CreateAssetCategoryResponse, Error, CreateAssetCategoryRequest>({
    mutationKey: [CREATE_ASSET_CATEGORY],
    mutationFn: createAssetCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_ASSET_CATEGORIES] })
    },
  })
}

export const useUpdateAssetCategory = () => {
  const queryClient = useQueryClient()
  return useMutation<UpdateAssetCategoryResponse, Error, UpdateAssetCategoryRequest>({
    mutationKey: [UPDATE_ASSET_CATEGORY],
    mutationFn: updateAssetCategory,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_ASSET_CATEGORIES] })
      queryClient.invalidateQueries({ queryKey: [GET_ASSET_CATEGORY, variables.category_id] })
    },
  })
}

export const useDeleteAssetCategory = () => {
  const queryClient = useQueryClient()
  return useMutation<DeleteAssetCategoryResponse, Error, string>({
    mutationKey: [DELETE_ASSET_CATEGORY],
    mutationFn: deleteAssetCategory,
    onSuccess: (_, categoryId) => {
      queryClient.invalidateQueries({ queryKey: [GET_ASSET_CATEGORIES] })
      queryClient.invalidateQueries({ queryKey: [GET_ASSET_CATEGORY, categoryId] })
    },
  })
}
