import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCompany,
  deleteCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
} from "@/services/endpoints/organizations/company/company";
import {
  CREATE_COMPANY,
  DELETE_COMPANY,
  GET_COMPANIES,
  GET_COMPANY,
  UPDATE_COMPANY,
} from "@/services/constants/organizations/company";
import {
  Company,
  CreateCompanyPayload,
  CreateCompanyResponse,
  DeleteCompanyResponse,
  GetCompaniesResponse,
  GetCompanyResponse,
  UpdateCompanyPayload,
  UpdateCompanyResponse,
} from "@/types/organizations/company/company-management";

export const useGetCompanies = () => {
  return useQuery<GetCompaniesResponse, Error>({
    queryKey: [GET_COMPANIES],
    queryFn: getCompanies,
  });
};

export const useGetCompanyById = (id?: string | number) => {
  return useQuery<GetCompanyResponse, Error>({
    queryKey: [GET_COMPANY, id],
    queryFn: () => getCompanyById(id as string | number),
    enabled: id !== undefined && id !== null && `${id}`.length > 0,
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateCompanyResponse, Error, CreateCompanyPayload>({
    mutationKey: [CREATE_COMPANY],
    mutationFn: createCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_COMPANIES] });
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateCompanyResponse,
    Error,
    { id: string | number; payload: UpdateCompanyPayload }
  >({
    mutationKey: [UPDATE_COMPANY],
    mutationFn: ({ id, payload }) => updateCompany(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_COMPANIES] });
      queryClient.invalidateQueries({ queryKey: [GET_COMPANY, variables.id] });
    },
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteCompanyResponse, Error, string | number>({
    mutationKey: [DELETE_COMPANY],
    mutationFn: deleteCompany,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: [GET_COMPANIES] });
      queryClient.invalidateQueries({ queryKey: [GET_COMPANY, deletedId] });
    },
  });
};

export const useCompaniesData = () => {
  return useQuery<Company[], Error>({
    queryKey: [GET_COMPANIES, "normalized"],
    queryFn: async () => {
      const response = await getCompanies();
      return response.data || [];
    },
  });
};

