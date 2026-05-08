// Payment data types
export interface PaymentData {
  employee_id: string;
  amount: number;
  payment_date: string;
  payment_type: 'salary' | 'bonus' | 'deduction' | string;
  status?: 'pending' | 'paid' | 'failed';
  payment_id?: string;
  id?: number;
  employee_name?: string;
  name?: string;
  department?: string;
  position?: string;
  organization?: string;
  command?: string;
  grade?: string;
  step?: string | number;
  gender?: string;
  tax_state?: string;
  location?: string;
  appointment?: string;
  appointment_date?: string;
  dob?: string;
  bank_name?: string;
  account?: string;
  pfa?: string;
  pension?: string;
  legacy_id?: string;
  metadata?: Record<string, unknown> | null;
  employee_snapshot?: Record<string, unknown> | null;
}

export interface PaymentResponse {
  id: number;
  payment_id: string;
  employee_id: string;
  amount: string;
  payment_date: string;
  payment_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  employee_name?: string;
  department?: string;
  paymentDate?: string;
  createdAt?: string;
  updatedAt?: string;
  name?: string;
  position?: string;
  organization?: string;
  command?: string;
  grade?: string;
  step?: string | number;
  gender?: string;
  tax_state?: string;
  location?: string;
  appointment?: string;
  appointment_date?: string;
  dob?: string;
  bank_name?: string;
  account?: string;
  pfa?: string;
  pension?: string;
  legacy_id?: string;
  metadata?: Record<string, unknown> | null;
  employee_snapshot?: Record<string, unknown> | null;
}

// API Response types
export interface PaymentListResponse {
  success: boolean;
  data: {
    payrolls: PaymentResponse[];
  };
}

export interface PaymentCreateResponse {
  success: boolean;
  data: PaymentResponse;
}

export interface PaymentUpdateResponse {
  success: boolean;
  data: PaymentResponse;
}

export interface PaymentDeleteResponse {
  success: boolean;
  message: string;
}
