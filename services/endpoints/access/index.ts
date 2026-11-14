import { get, post, patch, del } from "@/services/axios";
import {
  CreateAccessRequestPayload,
  GetAccessRequestsResponse,
  AccessRequestActionResponse,
  GetAccessReviewsResponse,
  GetAccessReviewDetailsResponse,
  StartAccessReviewPayload,
  DecideReviewItemPayload,
} from "@/types/access";

/**
 * Fetch all temporary access requests
 */
export const getAccessRequests = async (params?: {
  company_id?: number | string;
  status?: string;
}): Promise<GetAccessRequestsResponse> => {
  return get<GetAccessRequestsResponse>("/access/requests", params);
};

/**
 * Submit a new temporary access request
 */
export const createAccessRequest = async (
  payload: CreateAccessRequestPayload
): Promise<AccessRequestActionResponse> => {
  return post<AccessRequestActionResponse>("/access/requests", payload);
};

/**
 * Approve a temporary access request
 */
export const approveAccessRequest = async (
  requestId: number | string
): Promise<AccessRequestActionResponse> => {
  return post<AccessRequestActionResponse>(`/access/requests/${requestId}/approve`, {});
};

/**
 * Reject a temporary access request
 */
export const rejectAccessRequest = async (
  requestId: number | string,
  reason?: string
): Promise<AccessRequestActionResponse> => {
  return post<AccessRequestActionResponse>(`/access/requests/${requestId}/reject`, { reason });
};

/**
 * Revoke an active temporary access request early
 */
export const revokeAccessRequest = async (
  requestId: number | string,
  reason?: string
): Promise<AccessRequestActionResponse> => {
  return post<AccessRequestActionResponse>(`/access/requests/${requestId}/revoke`, { reason });
};

/**
 * Fetch access reviews (e.g. for an MDA)
 */
export const getAccessReviews = async (params?: {
  company_id?: number | string;
}): Promise<GetAccessReviewsResponse> => {
  return get<GetAccessReviewsResponse>("/access/reviews", params);
};

/**
 * Fetch details of a specific access review
 */
export const getAccessReviewDetails = async (
  reviewId: number | string
): Promise<GetAccessReviewDetailsResponse> => {
  return get<GetAccessReviewDetailsResponse>(`/access/reviews/${reviewId}`);
};

/**
 * Start a new access review for an MDA
 */
export const startAccessReview = async (
  payload: StartAccessReviewPayload
): Promise<{ success: boolean; message: string; data?: any }> => {
  return post("/access/reviews", payload);
};

/**
 * Decide (keep or revoke) a review item
 */
export const decideReviewItem = async (
  reviewId: number | string,
  payload: DecideReviewItemPayload
): Promise<{ success: boolean; message: string; data?: any }> => {
  return post(`/access/reviews/${reviewId}/item`, payload);
};

/**
 * Close an access review once every item is decided
 */
export const closeAccessReview = async (
  reviewId: number | string
): Promise<{ success: boolean; message: string; data?: any }> => {
  return post(`/access/reviews/${reviewId}/close`, {});
};
