import { del, get, patch, post } from "@/services/axios"
import type {
  CreateAssetRequest,
  CreateAssetResponse,
  DeleteAssetResponse,
  GetAssetResponse,
  GetAssetsMetricsResponse,
  GetAssetsResponse,
  UpdateAssetRequest,
  UpdateAssetResponse,
} from "@/types/assets/assets"

const ASSETS_ENDPOINT = "/assets"
const ASSETS_METRICS_ENDPOINT = "/assets/metrics"

export const getAssetsMetrics = async (): Promise<GetAssetsMetricsResponse> => {
  return get<GetAssetsMetricsResponse>(ASSETS_METRICS_ENDPOINT)
}

export const getAssets = async (params?: { asset_id?: string }): Promise<GetAssetsResponse> => {
  return get<GetAssetsResponse>(ASSETS_ENDPOINT, params)
}

export const getAsset = async (assetId: string): Promise<GetAssetResponse> => {
  return get<GetAssetResponse>(ASSETS_ENDPOINT, { asset_id: assetId })
}

export const createAsset = async (payload: CreateAssetRequest): Promise<CreateAssetResponse> => {
  return post<CreateAssetResponse>(ASSETS_ENDPOINT, payload)
}

export const updateAsset = async (payload: UpdateAssetRequest): Promise<UpdateAssetResponse> => {
  return patch<UpdateAssetResponse>(ASSETS_ENDPOINT, payload)
}

export const deleteAsset = async (assetId: string): Promise<DeleteAssetResponse> => {
  return del<DeleteAssetResponse>(ASSETS_ENDPOINT, {
    asset_id: assetId,
  })
}
