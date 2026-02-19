import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDepartment,
  deleteDepartment,
  getDepartmentById,
  getDepartments,
  updateDepartment,
} from "@/services/endpoints/organizations/department/department";
import {
  CREATE_DEPARTMENT,
  DELETE_DEPARTMENT,
  GET_DEPARTMENT,
  GET_DEPARTMENTS,
  UPDATE_DEPARTMENT,
} from "@/services/constants/organizations/department";
import {
  CreateDepartmentPayload,
  CreateDepartmentResponse,
  DeleteDepartmentResponse,
  Department,
  GetDepartmentByIdResponse,
  GetDepartmentsResponse,
  UpdateDepartmentPayload,
  UpdateDepartmentResponse,
} from "@/types/organizations/department/department-management";

export const useGetDepartments = () => {
  return useQuery<GetDepartmentsResponse, Error>({
    queryKey: [GET_DEPARTMENTS],
    queryFn: getDepartments,
  });
};

export const useGetDepartmentById = (id?: string | number) => {
  return useQuery<GetDepartmentByIdResponse, Error>({
    queryKey: [GET_DEPARTMENT, id],
    queryFn: () => getDepartmentById(id as string | number),
    enabled: id !== undefined && id !== null && `${id}`.length > 0,
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateDepartmentResponse, Error, CreateDepartmentPayload>({
    mutationKey: [CREATE_DEPARTMENT],
    mutationFn: createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_DEPARTMENTS] });
    },
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdateDepartmentResponse, Error, UpdateDepartmentPayload>({
    mutationKey: [UPDATE_DEPARTMENT],
    mutationFn: updateDepartment,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_DEPARTMENTS] });
      queryClient.invalidateQueries({ queryKey: [GET_DEPARTMENT, variables.id] });
    },
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteDepartmentResponse, Error, string | number>({
    mutationKey: [DELETE_DEPARTMENT],
    mutationFn: deleteDepartment,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: [GET_DEPARTMENTS] });
      queryClient.invalidateQueries({ queryKey: [GET_DEPARTMENT, deletedId] });
    },
  });
};

// Optional normalized selectors for UI convenience
export const useDepartmentsData = () => {
  return useQuery<Department[], Error>({
    queryKey: [GET_DEPARTMENTS, "normalized"],
    queryFn: async () => {
      const response = await getDepartments();
      return response.data || [];
    },
  });
};

