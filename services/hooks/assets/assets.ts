import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  CREATE_ASSET,
  DELETE_ASSET,
  GET_ASSET,
  GET_ASSETS,
  GET_ASSETS_METRICS,
  UPDATE_ASSET,
} from "@/services/constants/assets"
import {
  createAsset,
  approveAssets,
  deleteAsset,
  getAsset,
  getAssets,
  getAssetsMetrics,
  updateAsset,
} from "@/services/endpoints/assets/assets"
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
import { ApprovalPayload, ApprovalResponse } from "@/types/approval"

export const useGetAssetsMetrics = () => {
  return useQuery<GetAssetsMetricsResponse>({
    queryKey: [GET_ASSETS_METRICS],
    queryFn: getAssetsMetrics,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })
}

export const useGetAssets = (params?: { asset_id?: string }) => {
  return useQuery<GetAssetsResponse>({
    queryKey: [GET_ASSETS, params ?? {}],
    queryFn: () => getAssets(params),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })
}

export const useGetAsset = (assetId?: string, enabled = true) => {
  return useQuery<GetAssetResponse>({
    queryKey: [GET_ASSET, assetId],
    queryFn: () => getAsset(assetId || ""),
    enabled: Boolean(assetId) && enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })
}

export const useCreateAsset = () => {
  const queryClient = useQueryClient()
  return useMutation<CreateAssetResponse, Error, CreateAssetRequest>({
    mutationKey: [CREATE_ASSET],
    mutationFn: createAsset,
    onSuccess: (response) => {
      queryClient.setQueriesData<GetAssetsResponse>({ queryKey: [GET_ASSETS] }, (current) => {
        const createdAsset = response.data
        if (!current?.data?.assets) {
          return current
        }

        const nextAsset = createdAsset ? { ...createdAsset, status: "pending" } : createdAsset
        return {
          ...current,
          data: {
            ...current.data,
            assets: nextAsset
              ? [...current.data.assets, nextAsset]
              : current.data.assets,
          },
        }
      })
      queryClient.invalidateQueries({ queryKey: [GET_ASSETS_METRICS] })
    },
  })
}

export const useUpdateAsset = () => {
  const queryClient = useQueryClient()
  return useMutation<UpdateAssetResponse, Error, UpdateAssetRequest>({
    mutationKey: [UPDATE_ASSET],
    mutationFn: updateAsset,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_ASSETS] })
      queryClient.invalidateQueries({ queryKey: [GET_ASSET, variables.asset_id] })
      queryClient.invalidateQueries({ queryKey: [GET_ASSETS_METRICS] })
    },
  })
}

export const useDeleteAsset = () => {
  const queryClient = useQueryClient()
  return useMutation<DeleteAssetResponse, Error, string>({
    mutationKey: [DELETE_ASSET],
    mutationFn: deleteAsset,
    onSuccess: (_, assetId) => {
      queryClient.invalidateQueries({ queryKey: [GET_ASSETS] })
      queryClient.invalidateQueries({ queryKey: [GET_ASSET, assetId] })
      queryClient.invalidateQueries({ queryKey: [GET_ASSETS_METRICS] })
    },
  })
}

export const useApproveAssets = () => {
  return useMutation<ApprovalResponse, Error, ApprovalPayload<string | number>>({
    mutationKey: [GET_ASSETS, "approve"],
    mutationFn: approveAssets,
  })
}
