import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TRANSFER_QUERY_KEYS } from "@/services/constants/transfer";
import {
  getTransfersList,
  getTransferById,
  getTransfersByEmployeeId,
  createTransfer,
  updateTransfer,
  deleteTransfer,
//   approveTransfer,
//   rejectTransfer,
} from "@/services/endpoints/hr-core/transfer";
import {
  TransferResponse,
  TransfersListResponse,
  CreateTransferPayload,
  UpdateTransferPayload,
  TransferFilters,
} from "@/types/hr-core/transfer";

export const useTransfers = (filters?: TransferFilters) => {
  return useQuery<TransfersListResponse, Error>({
    queryKey: [TRANSFER_QUERY_KEYS.TRANSFERS, filters],
    queryFn: () => getTransfersList(filters),
    staleTime: 5 * 60 * 1000, 
    //@ts-expect-error - type issue
    cacheTime: 10 * 60 * 1000, 
  });
};

export const useTransfer = (id: number) => {
  return useQuery<TransferResponse, Error>({
    queryKey: [TRANSFER_QUERY_KEYS.TRANSFER, id],
    queryFn: () => getTransferById(id),
    enabled: !!id,
  });
};

export const useTransfersByEmployee = (employee_id: string) => {
  return useQuery<TransfersListResponse, Error>({
    queryKey: [TRANSFER_QUERY_KEYS.TRANSFERS_BY_EMPLOYEE, employee_id],
    queryFn: () => getTransfersByEmployeeId(employee_id),
    enabled: !!employee_id,
  });
};

export const usePendingTransfers = (filters?: Omit<TransferFilters, "status">) => {
  return useQuery<TransfersListResponse, Error>({
    queryKey: [TRANSFER_QUERY_KEYS.PENDING_TRANSFERS, filters],
    queryFn: () => getTransfersList({ ...filters, status: "pending" }),
  });
};

export const useCreateTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation<TransferResponse, Error, CreateTransferPayload>({
    mutationFn: createTransfer,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [TRANSFER_QUERY_KEYS.TRANSFERS] });
      queryClient.invalidateQueries({ queryKey: [TRANSFER_QUERY_KEYS.PENDING_TRANSFERS] });
      if (data.data) {
        queryClient.setQueryData(
          [TRANSFER_QUERY_KEYS.TRANSFER, data.data.id],
          data
        );
      }
    },
    onError: (error) => {
      console.error("Error creating transfer:", error);
    },
  });
};

export const useUpdateTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation<TransferResponse, Error, UpdateTransferPayload>({
    mutationFn: updateTransfer,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [TRANSFER_QUERY_KEYS.TRANSFERS] });
      queryClient.setQueryData(
        [TRANSFER_QUERY_KEYS.TRANSFER, variables.id],
        data
      );
      
      if (variables.status) {
        queryClient.invalidateQueries({ queryKey: [TRANSFER_QUERY_KEYS.PENDING_TRANSFERS] });
      }
      
      if (data.data?.employee_id) {
        queryClient.invalidateQueries({
          queryKey: [TRANSFER_QUERY_KEYS.TRANSFERS_BY_EMPLOYEE, data.data.employee_id],
        });
      }
    },
  });
};

export const useDeleteTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation<TransferResponse, Error, number>({
    mutationFn: deleteTransfer,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [TRANSFER_QUERY_KEYS.TRANSFERS] });
      queryClient.invalidateQueries({ queryKey: [TRANSFER_QUERY_KEYS.PENDING_TRANSFERS] });
      queryClient.removeQueries({ queryKey: [TRANSFER_QUERY_KEYS.TRANSFER, id] });
    },
  });
};

// export const useApproveTransfer = () => {
//   const queryClient = useQueryClient();

//   return useMutation<TransferResponse, Error, number>({
//     mutationFn: approveTransfer,
//     onSuccess: (data, id) => {
//       queryClient.invalidateQueries({ queryKey: [TRANSFER_QUERY_KEYS.TRANSFERS] });
//       queryClient.invalidateQueries({ queryKey: [TRANSFER_QUERY_KEYS.PENDING_TRANSFERS] });
//       queryClient.setQueryData([TRANSFER_QUERY_KEYS.TRANSFER, id], data);
//     },
//   });
// };

// export const useRejectTransfer = () => {
//   const queryClient = useQueryClient();

//   return useMutation<TransferResponse, Error, number>({
//     mutationFn: rejectTransfer,
//     onSuccess: (data, id) => {
//       queryClient.invalidateQueries({ queryKey: [TRANSFER_QUERY_KEYS.TRANSFERS] });
//       queryClient.invalidateQueries({ queryKey: [TRANSFER_QUERY_KEYS.PENDING_TRANSFERS] });
//       queryClient.setQueryData([TRANSFER_QUERY_KEYS.TRANSFER, id], data);
//     },
//   });
// };