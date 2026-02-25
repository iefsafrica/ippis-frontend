import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAppraiser,
  deleteAppraiser,
  getAppraiserById,
  getAppraisers,
  updateAppraiser,
} from "@/services/endpoints/performance/appraiser";
import {
  CREATE_APPRAISER,
  DELETE_APPRAISER,
  GET_APPRAISER,
  GET_APPRAISERS,
  UPDATE_APPRAISER,
} from "@/services/constants/performance";
import {
  Appraiser,
  CreateAppraiserPayload,
  CreateAppraiserResponse,
  DeleteAppraiserResponse,
  GetAppraiserResponse,
  GetAppraisersResponse,
  UpdateAppraiserPayload,
  UpdateAppraiserResponse,
} from "@/types/performance/appraiser";

export const useGetAppraisers = () => {
  return useQuery<GetAppraisersResponse, Error>({
    queryKey: [GET_APPRAISERS],
    queryFn: getAppraisers,
  });
};

export const useGetAppraiserById = (id?: string | number) => {
  return useQuery<GetAppraiserResponse, Error>({
    queryKey: [GET_APPRAISER, id],
    queryFn: () => getAppraiserById(id as string | number),
    enabled: id !== undefined && id !== null && `${id}`.length > 0,
  });
};

export const useCreateAppraiser = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateAppraiserResponse, Error, CreateAppraiserPayload>({
    mutationKey: [CREATE_APPRAISER],
    mutationFn: createAppraiser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_APPRAISERS] });
    },
  });
};

export const useUpdateAppraiser = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdateAppraiserResponse, Error, UpdateAppraiserPayload>({
    mutationKey: [UPDATE_APPRAISER],
    mutationFn: updateAppraiser,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_APPRAISERS] });
      queryClient.invalidateQueries({ queryKey: [GET_APPRAISER, variables.id] });
    },
  });
};

export const useDeleteAppraiser = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteAppraiserResponse, Error, string | number>({
    mutationKey: [DELETE_APPRAISER],
    mutationFn: deleteAppraiser,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: [GET_APPRAISERS] });
      queryClient.invalidateQueries({ queryKey: [GET_APPRAISER, deletedId] });
    },
  });
};

export const useAppraisersData = () => {
  return useQuery<Appraiser[], Error>({
    queryKey: [GET_APPRAISERS, "normalized"],
    queryFn: async () => {
      const response = await getAppraisers();
      return response.data || [];
    },
  });
};
