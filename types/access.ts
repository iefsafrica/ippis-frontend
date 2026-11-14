export type AccessRequestStatus = "pending" | "approved" | "rejected" | "revoked" | "expired";

export interface TemporaryAccessRequest {
  id: number | string;
  user_id: number | string;
  user_name?: string;
  user_email?: string;
  target_company_id: number | string;
  company_name?: string;
  role_id: number | string;
  role_name?: string;
  duration_days: number;
  reason: string;
  status: AccessRequestStatus;
  created_at: string;
  approved_at?: string;
  approved_by?: number | string;
  approved_by_name?: string;
  expires_at?: string;
  revoked_at?: string;
  revoked_by?: number | string;
}

export interface CreateAccessRequestPayload {
  target_company_id: number | string;
  role_id: number | string;
  duration_days: number;
  reason: string;
}

export interface GetAccessRequestsResponse {
  success: boolean;
  data: TemporaryAccessRequest[];
  message?: string;
}

export interface AccessRequestActionResponse {
  success: boolean;
  message: string;
  data?: TemporaryAccessRequest;
}

export type ReviewDecision = "pending" | "keep" | "revoke";

export interface AccessReviewItem {
  id: number | string;
  review_id: number | string;
  user_id: number | string;
  user_name: string;
  user_email: string;
  department_name?: string;
  role_id?: number | string;
  role_name?: string;
  permission_key?: string;
  permission_name?: string;
  decision: ReviewDecision;
  decided_at?: string;
  decided_by?: number | string;
}

export interface AccessReview {
  id: number | string;
  company_id: number | string;
  company_name: string;
  status: "in_progress" | "completed";
  reviewer_id?: number | string;
  reviewer_name?: string;
  total_items: number;
  decided_items: number;
  created_at: string;
  closed_at?: string;
  items?: AccessReviewItem[];
}

export interface GetAccessReviewsResponse {
  success: boolean;
  data: AccessReview[];
  message?: string;
}

export interface GetAccessReviewDetailsResponse {
  success: boolean;
  data: {
    review: AccessReview;
    items: AccessReviewItem[];
  };
  message?: string;
}

export interface StartAccessReviewPayload {
  company_id: number | string;
}

export interface DecideReviewItemPayload {
  item_id: number | string;
  decision: "keep" | "revoke";
}
