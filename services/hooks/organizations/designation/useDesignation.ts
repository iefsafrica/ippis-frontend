import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDesignation,
  deleteDesignation,
  getDesignationById,
  getDesignations,
  updateDesignation,
} from "@/services/endpoints/organizations/designation/designation";
import {
  CREATE_DESIGNATION,
  DELETE_DESIGNATION,
  GET_DESIGNATION,
  GET_DESIGNATIONS,
  UPDATE_DESIGNATION,
} from "@/services/constants/organizations/designation";
import {
  CreateDesignationPayload,
  CreateDesignationResponse,
  DeleteDesignationResponse,
  Designation,
  GetDesignationByIdResponse,
  GetDesignationsResponse,
  UpdateDesignationPayload,
  UpdateDesignationResponse,
} from "@/types/organizations/designation/designation-management";

export const useGetDesignations = () => {
  return useQuery<GetDesignationsResponse, Error>({
    queryKey: [GET_DESIGNATIONS],
    queryFn: getDesignations,
  });
};

export const useGetDesignationById = (id?: string | number) => {
  return useQuery<GetDesignationByIdResponse, Error>({
    queryKey: [GET_DESIGNATION, id],
    queryFn: () => getDesignationById(id as string | number),
    enabled: id !== undefined && id !== null && `${id}`.length > 0,
  });
};

export const useCreateDesignation = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateDesignationResponse, Error, CreateDesignationPayload>({
    mutationKey: [CREATE_DESIGNATION],
    mutationFn: createDesignation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_DESIGNATIONS] });
    },
  });
};

export const useUpdateDesignation = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdateDesignationResponse, Error, UpdateDesignationPayload>({
    mutationKey: [UPDATE_DESIGNATION],
    mutationFn: updateDesignation,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_DESIGNATIONS] });
      queryClient.invalidateQueries({ queryKey: [GET_DESIGNATION, variables.id] });
    },
  });
};

export const useDeleteDesignation = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteDesignationResponse, Error, string | number>({
    mutationKey: [DELETE_DESIGNATION],
    mutationFn: deleteDesignation,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: [GET_DESIGNATIONS] });
      queryClient.invalidateQueries({ queryKey: [GET_DESIGNATION, deletedId] });
    },
  });
};

export const useDesignationsData = () => {
  return useQuery<Designation[], Error>({
    queryKey: [GET_DESIGNATIONS, "normalized"],
    queryFn: async () => {
      const response = await getDesignations();
      return response.data || [];
    },
  });
};
