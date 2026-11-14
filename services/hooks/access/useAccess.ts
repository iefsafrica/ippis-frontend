import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAccessRequests,
  createAccessRequest,
  approveAccessRequest,
  rejectAccessRequest,
  revokeAccessRequest,
  getAccessReviews,
  getAccessReviewDetails,
  startAccessReview,
  decideReviewItem,
  closeAccessReview,
} from "@/services/endpoints/access";
import { CreateAccessRequestPayload, DecideReviewItemPayload, StartAccessReviewPayload } from "@/types/access";

export const useGetAccessRequests = (params?: { company_id?: number | string; status?: string }) => {
  return useQuery({
    queryKey: ["access-requests", params],
    queryFn: () => getAccessRequests(params),
  });
};

export const useCreateAccessRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAccessRequestPayload) => createAccessRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["access-requests"] });
    },
  });
};

export const useApproveAccessRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: number | string) => approveAccessRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["access-requests"] });
    },
  });
};

export const useRejectAccessRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, reason }: { requestId: number | string; reason?: string }) =>
      rejectAccessRequest(requestId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["access-requests"] });
    },
  });
};

export const useRevokeAccessRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, reason }: { requestId: number | string; reason?: string }) =>
      revokeAccessRequest(requestId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["access-requests"] });
    },
  });
};

export const useGetAccessReviews = (params?: { company_id?: number | string }) => {
  return useQuery({
    queryKey: ["access-reviews", params],
    queryFn: () => getAccessReviews(params),
  });
};

export const useGetAccessReviewDetails = (reviewId: number | string) => {
  return useQuery({
    queryKey: ["access-review-details", reviewId],
    queryFn: () => getAccessReviewDetails(reviewId),
    enabled: Boolean(reviewId),
  });
};

export const useStartAccessReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: StartAccessReviewPayload) => startAccessReview(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["access-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
};

export const useDecideReviewItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, payload }: { reviewId: number | string; payload: DecideReviewItemPayload }) =>
      decideReviewItem(reviewId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["access-review-details", variables.reviewId] });
      queryClient.invalidateQueries({ queryKey: ["access-reviews"] });
    },
  });
};

export const useCloseAccessReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: number | string) => closeAccessReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["access-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
};
