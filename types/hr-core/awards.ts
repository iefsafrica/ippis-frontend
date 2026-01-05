


export interface Award {
  id: number;
  employee_id: string;
  employee_name: string;
  department: string;
  award_type: string;
  gift_item: string;
  cash_prize: string;
  award_date: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface LocalAward {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  awardType: string;
  giftItem: string;
  cashPrice: string;
  awardDate: string;
  description: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface GetAwardsResponse {
  success: boolean;
  data: Award[];
}

export interface CreateAwardRequest {
  employee_id: string;
  employee_name: string;
  department: string;
  award_type: string;
  gift_item: string;
  cash_prize: number;
  award_date: string;
  description: string;
}

export interface CreateAwardResponse {
  success: boolean;
  message: string;
  data: Award;
}

export interface UpdateAwardRequest {
  employee_id?: string;
  employee_name?: string;
  department?: string;
  award_type?: string;
  gift_item?: string;
  cash_prize?: number;
  award_date?: string;
  description?: string;
  status?: string;
}

export interface UpdateAwardResponse {
  success: boolean;
  message: string;
  data: Award;
}

export interface DeleteAwardResponse {
  success: boolean;
  message: string;
}