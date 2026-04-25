import { get, post, put, del } from '@/services/axios';
import {
  PaymentData,
  PaymentListResponse,
  PaymentCreateResponse,
  PaymentUpdateResponse,
  PaymentDeleteResponse,
} from '@/types/payroll';
import { ApprovalPayload, ApprovalResponse } from "@/types/approval";
import { PAYROLL_ENDPOINTS } from '@/services/constants/payroll';

/**
 * Fetch all payments
 */
export const getAllPayments = async (): Promise<PaymentListResponse> => {
  const response = await get<PaymentListResponse>(PAYROLL_ENDPOINTS.GET_ALL);
  return response;
};

/**
 * Create a new payment
 */
export const createPayment = async (
  paymentData: PaymentData
): Promise<PaymentCreateResponse> => {
  const response = await post<PaymentCreateResponse>(
    PAYROLL_ENDPOINTS.CREATE,
    paymentData
  );
  return response;
};

/**
 * Update an existing payment
 */
export const updatePayment = async (
  paymentData: Partial<PaymentData>
): Promise<PaymentUpdateResponse> => {
  const response = await put<PaymentUpdateResponse>(
    PAYROLL_ENDPOINTS.UPDATE,
    paymentData
  );
  return response;
};

/**
 * Delete a payment
 */
export const deletePayment = async (
  paymentId: number
): Promise<PaymentDeleteResponse> => {
  const response = await del<PaymentDeleteResponse>(
    `${PAYROLL_ENDPOINTS.DELETE}?id=${paymentId}`
  );
  return response;
};

/**
 * Approve one or more payroll payments
 */
export const approvePayments = async (
  payload: ApprovalPayload<string | number>
): Promise<ApprovalResponse> => {
  return post<ApprovalResponse>(PAYROLL_ENDPOINTS.APPROVE, payload);
};
