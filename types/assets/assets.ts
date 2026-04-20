export interface Asset {
  id: number
  asset_id: string
  asset_name: string
  category_id: string
  serial_number: string
  status: string
  location: string
  assigned_to?: string | null
  notes?: string | null
  purchase_date?: string | null
  purchase_cost?: number | string | null
  created_at?: string
  updated_at?: string
}

export interface AssetMetricsHighlights {
  total_assets: number
  active_categories: number
  total_inventory_value: number
}

export interface AssetMetricsDistributionRow {
  label?: string
  name?: string
  value?: number
  count?: number
}

export interface AssetMetricsData {
  highlights: AssetMetricsHighlights
  status_distribution?: AssetMetricsDistributionRow[]
  category_distribution?: AssetMetricsDistributionRow[]
}

export interface GetAssetsMetricsResponse {
  success: boolean
  data: AssetMetricsData
  message?: string
}

interface AssetListData {
  assets: Asset[]
}

export interface GetAssetsResponse {
  success: boolean
  data: AssetListData
  message?: string
}

export interface GetAssetResponse {
  success: boolean
  data: Asset
  message?: string
}

export interface CreateAssetRequest {
  asset_name: string
  category_id: string
  serial_number: string
  status: string
  location: string
  assigned_to?: string | null
  notes?: string | null
  purchase_date?: string | null
  purchase_cost?: number | string | null
}

export interface CreateAssetResponse {
  success: boolean
  message: string
  data: Asset
}

export interface UpdateAssetRequest {
  asset_id: string
  status?: string
  location?: string
  notes?: string | null
}

export interface UpdateAssetResponse {
  success: boolean
  message: string
  data: Asset
}

export interface DeleteAssetResponse {
  success: boolean
  message: string
}
