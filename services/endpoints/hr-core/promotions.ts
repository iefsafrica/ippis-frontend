// import { get, post } from "@/services/axios";
// import {
//   PromotionResponse,
//   PromotedEmployee,
//   Employee,
//   CreatePromotionRequest,
// } from "@/types/hr-core/promotion-management";

// export const getPromotedEmployees = async (): Promise<PromotedEmployee[]> => {
//   const res = await get<{ success: boolean; data: PromotedEmployee[] }>(
//     "/admin/hr/promotions/employees"
//   );
//   if (res && res.success && res.data) return res.data;
//   return [];
// };

// export const getAllEmployees = async (): Promise<Employee[]> => {
//   const res = await get<{ success: boolean; data: Employee[] }>(
//     "/admin/hr/employees"
//   );
//   if (res && res.success && res.data) return res.data;
//   return [];
// };

// export const getPromotedEmployeeDetails = async (
//   employeeId: string
// ): Promise<PromotedEmployee> => {
//   const res = await get<{ success: boolean; data: PromotedEmployee }>(
//     `/admin/hr/promotions/${employeeId}`
//   );
//   return res.data;
// };

// export const createPromotion = async (
//   promotionData: CreatePromotionRequest
// ): Promise<PromotedEmployee> => {
//   const res = await post<{ success: boolean; data: PromotedEmployee }>(
//     "/admin/hr/promotions",
//     promotionData
//   );
//   return res.data;
// };

// export const deletePromotion = async (promotionId: number): Promise<void> => {
//   await post(`/admin/hr/promotions/${promotionId}/delete`);
// };



import { get, post } from "@/services/axios";
import {
  PromotionResponse,
  PromotedEmployee,
  Employee,
  CreatePromotionRequest,
} from "@/types/hr-core/promotion-management";

export const getPromotedEmployees = async (): Promise<PromotedEmployee[]> => {
  const res = await get<{ success: boolean; data: PromotedEmployee[] }>(
    "/admin/hr/promotions/employees"
  );
  if (res && res.success && res.data) return res.data;
  return [];
};

export const getAllEmployees = async (): Promise<Employee[]> => {
  const res = await get<{ success: boolean; data: Employee[] }>(
    "/admin/employees"  
  );
  if (res && res.success && res.data) return res.data;
  return [];
};

export const getPromotedEmployeeDetails = async (
  employeeId: string
): Promise<PromotedEmployee> => {
  const res = await get<{ success: boolean; data: PromotedEmployee }>(
    `/admin/hr/promotions/${employeeId}`
  );
  return res.data;
};

export const createPromotion = async (
  promotionData: CreatePromotionRequest
): Promise<PromotedEmployee> => {
  const res = await post<{ success: boolean; data: PromotedEmployee }>(
    "/admin/hr/promotions",
    promotionData
  );
  return res.data;
};

export const deletePromotion = async (promotionId: number): Promise<void> => {
  await post(`/admin/hr/promotions/${promotionId}/delete`);
};