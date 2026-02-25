import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCompanyPolicy,
  deleteCompanyPolicy,
  getCompanyPolicies,
  getCompanyPolicyById,
  updateCompanyPolicy,
} from "@/services/endpoints/organizations/company-policy/company-policy";
import {
  CREATE_COMPANY_POLICY,
  DELETE_COMPANY_POLICY,
  GET_COMPANY_POLICIES,
  GET_COMPANY_POLICY,
  UPDATE_COMPANY_POLICY,
} from "@/services/constants/organizations/company-policy";
import {
  CompanyPolicy,
  CreateCompanyPolicyPayload,
  CreateCompanyPolicyResponse,
  DeleteCompanyPolicyResponse,
  GetCompanyPoliciesResponse,
  GetCompanyPolicyResponse,
  UpdateCompanyPolicyPayload,
  UpdateCompanyPolicyResponse,
} from "@/types/organizations/company-policy/company-policy-management";

export const useGetCompanyPolicies = () => {
  return useQuery<GetCompanyPoliciesResponse, Error>({
    queryKey: [GET_COMPANY_POLICIES],
    queryFn: getCompanyPolicies,
  });
};

export const useGetCompanyPolicyById = (id?: string | number) => {
  return useQuery<GetCompanyPolicyResponse, Error>({
    queryKey: [GET_COMPANY_POLICY, id],
    queryFn: () => getCompanyPolicyById(id as string | number),
    enabled: id !== undefined && id !== null && `${id}`.length > 0,
  });
};

export const useCreateCompanyPolicy = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateCompanyPolicyResponse, Error, CreateCompanyPolicyPayload>({
    mutationKey: [CREATE_COMPANY_POLICY],
    mutationFn: createCompanyPolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_COMPANY_POLICIES] });
    },
  });
};

export const useUpdateCompanyPolicy = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdateCompanyPolicyResponse, Error, UpdateCompanyPolicyPayload>({
    mutationKey: [UPDATE_COMPANY_POLICY],
    mutationFn: updateCompanyPolicy,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_COMPANY_POLICIES] });
      queryClient.invalidateQueries({ queryKey: [GET_COMPANY_POLICY, variables.id] });
    },
  });
};

export const useDeleteCompanyPolicy = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteCompanyPolicyResponse, Error, string | number>({
    mutationKey: [DELETE_COMPANY_POLICY],
    mutationFn: deleteCompanyPolicy,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: [GET_COMPANY_POLICIES] });
      queryClient.invalidateQueries({ queryKey: [GET_COMPANY_POLICY, deletedId] });
    },
  });
};

export const useCompanyPoliciesData = () => {
  return useQuery<CompanyPolicy[], Error>({
    queryKey: [GET_COMPANY_POLICIES, "normalized"],
    queryFn: async () => {
      const response = await getCompanyPolicies();
      return response.data || [];
    },
  });
};
