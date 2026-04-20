export interface AssetCategory {
  id: number
  category_id: string
  category_name: string
  description?: string | null
  status?: string | null
  created_at?: string
  updated_at?: string
}

interface AssetCategoryListData {
  categories?: AssetCategory[]
}

export interface GetAssetCategoriesResponse {
  success: boolean
  data: AssetCategory[] | AssetCategoryListData
  message?: string
}

export interface GetAssetCategoryResponse {
  success: boolean
  data: AssetCategory
  message?: string
}

export interface CreateAssetCategoryRequest {
  category_name: string
  description?: string | null
  status: string
}

export interface CreateAssetCategoryResponse {
  success: boolean
  message: string
  data: AssetCategory
}

export interface UpdateAssetCategoryRequest {
  category_id: string
  category_name: string
  description?: string | null
  status: string
}

export interface UpdateAssetCategoryResponse {
  success: boolean
  message: string
  data: AssetCategory
}

export interface DeleteAssetCategoryResponse {
  success: boolean
  message: string
}
