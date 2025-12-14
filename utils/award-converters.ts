import { Award, LocalAward, CreateAwardRequest, UpdateAwardRequest } from "@/types/hr-core/awards"

export function convertApiAwardToLocal(apiAward: Award): LocalAward {
  return {
    id: apiAward.id.toString(),
    employeeId: apiAward.employee_id,
    employeeName: apiAward.employee_name,
    department: apiAward.department,
    awardType: apiAward.award_type,
    giftItem: apiAward.gift_item,
    cashPrice: apiAward.cash_prize,
    awardDate: apiAward.award_date.split('T')[0],
    description: apiAward.description,
    status: apiAward.status,
    created_at: apiAward.created_at,
    updated_at: apiAward.updated_at,
  }
}

export function convertLocalAwardToApi(localAward: Partial<LocalAward>): UpdateAwardRequest {
  const result: UpdateAwardRequest = {}

  if (localAward.employeeId !== undefined) result.employee_id = localAward.employeeId
  if (localAward.employeeName !== undefined) result.employee_name = localAward.employeeName
  if (localAward.department !== undefined) result.department = localAward.department
  if (localAward.awardType !== undefined) result.award_type = localAward.awardType
  if (localAward.giftItem !== undefined) result.gift_item = localAward.giftItem
  if (localAward.cashPrice !== undefined) result.cash_prize = parseFloat(localAward.cashPrice)
  if (localAward.awardDate !== undefined) result.award_date = localAward.awardDate
  if (localAward.description !== undefined) result.description = localAward.description
  if (localAward.status !== undefined) result.status = localAward.status

  return result
}

export function convertLocalToCreateAward(localAward: Partial<LocalAward>): CreateAwardRequest {
  return {
    employee_id: localAward.employeeId || '',
    employee_name: localAward.employeeName || '',
    department: localAward.department || '',
    award_type: localAward.awardType || '',
    gift_item: localAward.giftItem || '',
    cash_prize: parseFloat(localAward.cashPrice || '0'),
    award_date: localAward.awardDate || '',
    description: localAward.description || '',
  }
}