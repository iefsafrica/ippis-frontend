import { del, get, patch, post } from "@/services/axios"
import type {
  CreateAssetCategoryRequest,
  CreateAssetCategoryResponse,
  DeleteAssetCategoryResponse,
  GetAssetCategoriesResponse,
  GetAssetCategoryResponse,
  UpdateAssetCategoryRequest,
  UpdateAssetCategoryResponse,
} from "@/types/assets/categories"

const ASSET_CATEGORIES_ENDPOINT = "/assets/categories"

export const createAssetCategory = async (
  payload: CreateAssetCategoryRequest,
): Promise<CreateAssetCategoryResponse> => {
  return post<CreateAssetCategoryResponse>(ASSET_CATEGORIES_ENDPOINT, payload)
}

export const getAssetCategories = async (params?: {
  category_id?: string
}): Promise<GetAssetCategoriesResponse> => {
  return get<GetAssetCategoriesResponse>(ASSET_CATEGORIES_ENDPOINT, params)
}

export const getAssetCategory = async (categoryId: string): Promise<GetAssetCategoryResponse> => {
  return get<GetAssetCategoryResponse>(ASSET_CATEGORIES_ENDPOINT, {
    category_id: categoryId,
  })
}

export const updateAssetCategory = async (
  payload: UpdateAssetCategoryRequest,
): Promise<UpdateAssetCategoryResponse> => {
  return patch<UpdateAssetCategoryResponse>(ASSET_CATEGORIES_ENDPOINT, payload)
}

export const deleteAssetCategory = async (
  categoryId: string,
): Promise<DeleteAssetCategoryResponse> => {
  return del<DeleteAssetCategoryResponse>(ASSET_CATEGORIES_ENDPOINT, {
    category_id: categoryId,
  })
}
