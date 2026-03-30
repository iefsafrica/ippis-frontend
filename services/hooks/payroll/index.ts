import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSafeMutation } from '@/hooks/useSafeMutation';
import {
  PaymentData,
  PaymentListResponse,
  PaymentCreateResponse,
  PaymentUpdateResponse,
  PaymentDeleteResponse,
} from '@/types/payroll';
import {
  getAllPayments,
  createPayment,
  updatePayment,
  deletePayment,
} from '@/services/endpoints/payroll';
import { PAYROLL_QUERY_KEYS } from '@/services/constants/payroll';

/**
 * Hook to fetch all payments
 */
export const useGetPayments = () => {
  return useQuery({
    queryKey: PAYROLL_QUERY_KEYS.lists(),
    queryFn: getAllPayments,
  });
};

/**
 * Hook to create a new payment
 */
export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useSafeMutation<PaymentCreateResponse, Error, PaymentData>({
    mutationFn: createPayment,
    invalidateQueries: [PAYROLL_QUERY_KEYS.lists()],
    successMessage: 'Payment created successfully',
    errorMessage: 'Failed to create payment',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYROLL_QUERY_KEYS.lists() });
    },
  });
};

/**
 * Hook to update a payment
 */
export const useUpdatePayment = () => {
  const queryClient = useQueryClient();

  return useSafeMutation<PaymentUpdateResponse, Error, Partial<PaymentData>>({
    mutationFn: updatePayment,
    invalidateQueries: [PAYROLL_QUERY_KEYS.lists()],
    successMessage: 'Payment updated successfully',
    errorMessage: 'Failed to update payment',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYROLL_QUERY_KEYS.lists() });
    },
  });
};

/**
 * Hook to delete a payment
 */
export const useDeletePayment = () => {
  const queryClient = useQueryClient();

  return useSafeMutation<PaymentDeleteResponse, Error, number>({
    mutationFn: deletePayment,
    invalidateQueries: [PAYROLL_QUERY_KEYS.lists()],
    successMessage: 'Payment deleted successfully',
    errorMessage: 'Failed to delete payment',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYROLL_QUERY_KEYS.lists() });
    },
  });
};
