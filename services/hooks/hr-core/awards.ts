

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  getAwards, 
  getAward, 
  createAward, 
  updateAward, 
  deleteAward 
} from "@/services/endpoints/hr-core/awards";
import { 
  CREATE_AWARD, 
  GET_AWARDS, 
  GET_AWARD, 
  UPDATE_AWARD, 
  DELETE_AWARD 
} from "@/services/constants/awards";
import { 
  CreateAwardRequest, 
  CreateAwardResponse,
  UpdateAwardRequest,
  UpdateAwardResponse,
  DeleteAwardResponse,
  Award
} from "@/types/hr-core/awards";

export const useGetAwards = () => {
  return useQuery({
    queryKey: [GET_AWARDS],
    queryFn: getAwards,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useGetAward = (id: number) => {
  return useQuery({
    queryKey: [GET_AWARD, id],
    queryFn: () => getAward(id),
    enabled: !!id,
  });
};

export const useCreateAward = () => {
  const queryClient = useQueryClient();
  
  return useMutation<CreateAwardResponse, Error, CreateAwardRequest>({
    mutationKey: [CREATE_AWARD],
    mutationFn: createAward,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_AWARDS] });
    },
  });
};

export const useUpdateAward = () => {
  const queryClient = useQueryClient();
  
  return useMutation<UpdateAwardResponse, Error, { id: number; data: UpdateAwardRequest }>({
    mutationKey: [UPDATE_AWARD],
    mutationFn: ({ id, data }) => updateAward(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_AWARDS] });
    },
  });
};

export const useDeleteAward = () => {
  const queryClient = useQueryClient();
  
  return useMutation<DeleteAwardResponse, Error, number>({
    mutationKey: [DELETE_AWARD],
    mutationFn: deleteAward,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_AWARDS] });
    },
  });
};