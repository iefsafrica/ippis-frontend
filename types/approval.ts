export interface ApprovalPayload<TId = string | number> {
  payment_ids?: TId[]
  asset_ids?: TId[]
  expense_ids?: TId[]
  project_ids?: TId[]
}

export interface ApprovalResponse {
  success: boolean
  message?: string
  approvedIds?: Array<string | number>
  skippedIds?: Array<string | number>
  error?: string
}
