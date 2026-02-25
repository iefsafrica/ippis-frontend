import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createIndicator,
  deleteIndicator,
  getIndicatorById,
  getIndicators,
  updateIndicator,
} from "@/services/endpoints/performance/indicator";
import {
  CREATE_INDICATOR,
  DELETE_INDICATOR,
  GET_INDICATOR,
  GET_INDICATORS,
  UPDATE_INDICATOR,
} from "@/services/constants/performance";
import {
  CreateIndicatorPayload,
  CreateIndicatorResponse,
  DeleteIndicatorResponse,
  GetIndicatorResponse,
  GetIndicatorsResponse,
  Indicator,
  UpdateIndicatorPayload,
  UpdateIndicatorResponse,
} from "@/types/performance/indicator";

export const useGetIndicators = () => {
  return useQuery<GetIndicatorsResponse, Error>({
    queryKey: [GET_INDICATORS],
    queryFn: getIndicators,
  });
};

export const useGetIndicatorById = (id?: string | number) => {
  return useQuery<GetIndicatorResponse, Error>({
    queryKey: [GET_INDICATOR, id],
    queryFn: () => getIndicatorById(id as string | number),
    enabled: id !== undefined && id !== null && `${id}`.length > 0,
  });
};

export const useCreateIndicator = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateIndicatorResponse, Error, CreateIndicatorPayload>({
    mutationKey: [CREATE_INDICATOR],
    mutationFn: createIndicator,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_INDICATORS] });
    },
  });
};

export const useUpdateIndicator = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdateIndicatorResponse, Error, UpdateIndicatorPayload>({
    mutationKey: [UPDATE_INDICATOR],
    mutationFn: updateIndicator,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_INDICATORS] });
      queryClient.invalidateQueries({ queryKey: [GET_INDICATOR, variables.id] });
    },
  });
};

export const useDeleteIndicator = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteIndicatorResponse, Error, string | number>({
    mutationKey: [DELETE_INDICATOR],
    mutationFn: deleteIndicator,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: [GET_INDICATORS] });
      queryClient.invalidateQueries({ queryKey: [GET_INDICATOR, deletedId] });
    },
  });
};

export const useIndicatorsData = () => {
  return useQuery<Indicator[], Error>({
    queryKey: [GET_INDICATORS, "normalized"],
    queryFn: async () => {
      const response = await getIndicators();
      return response.data || [];
    },
  });
};
