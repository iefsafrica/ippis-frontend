export type RestructureAction = "move_department" | "merge_mda";

export interface MoveDepartmentPayload {
  action: "move_department";
  department_id: number | string;
  target_company_id: number | string;
  dry_run?: boolean;
}

export interface MergeMdaPayload {
  action: "merge_mda";
  source_company_id: number | string;
  target_company_id: number | string;
  dry_run?: boolean;
}

export type RestructurePayload = MoveDepartmentPayload | MergeMdaPayload;

export interface LostAccessUser {
  id: string | number;
  name: string;
  email: string;
  role: string;
}

export interface RestructureResponse {
  success: boolean;
  message: string;
  dry_run?: boolean;
  data?: {
    action: RestructureAction;
    dry_run: boolean;
    affected_staff_count: number;
    affected_records_count: number;
    departments_moved_count?: number;
    source_company_name?: string;
    target_company_name?: string;
    department_name?: string;
    lost_access_users?: LostAccessUser[];
    details?: string;
  };
}
