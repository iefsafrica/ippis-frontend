// Payment data types
export interface PaymentData {
  employee_id: string;
  amount: number;
  payment_date: string;
  payment_type: 'salary' | 'bonus' | 'deduction' | string;
  status?: 'pending' | 'paid' | 'failed';
  payment_id?: string;
  id?: number;
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
