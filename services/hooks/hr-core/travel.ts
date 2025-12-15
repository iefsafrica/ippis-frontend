import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  getTravels, 
  getTravel, 
  createTravel, 
  updateTravel, 
  deleteTravel 
} from "@/services/endpoints/hr-core/travel";
import { 
  CREATE_TRAVEL, 
  GET_TRAVELS, 
  GET_TRAVEL, 
  UPDATE_TRAVEL, 
  DELETE_TRAVEL 
} from "@/services/constants/travel";
import { 
  CreateTravelRequest, 
  CreateTravelResponse,
  UpdateTravelRequest,
  UpdateTravelResponse,
  DeleteTravelResponse,
  TravelQueryParams,
  LocalTravel,
  Travel
} from "@/types/hr-core/travel";

export const useGetTravels = (params?: TravelQueryParams) => {
  return useQuery({
    queryKey: [GET_TRAVELS, params],
    queryFn: () => getTravels(params),
    staleTime: 1000 * 60 * 5, 
    gcTime: 1000 * 60 * 10, 
  });
};

export const useGetTravel = (params: TravelQueryParams) => {
  return useQuery({
    queryKey: [GET_TRAVEL, params],
    queryFn: () => getTravel(params),
    enabled: !!(params.id || params.employee_id),
  });
};

export const useCreateTravel = () => {
  const queryClient = useQueryClient();
  
  return useMutation<CreateTravelResponse, Error, CreateTravelRequest>({
    mutationKey: [CREATE_TRAVEL],
    mutationFn: createTravel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_TRAVELS] });
    },
  });
};

export const useUpdateTravel = () => {
  const queryClient = useQueryClient();
  
  return useMutation<UpdateTravelResponse, Error, UpdateTravelRequest>({
    mutationKey: [UPDATE_TRAVEL],
    mutationFn: updateTravel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_TRAVELS] });
    },
  });
};

export const useDeleteTravel = () => {
  const queryClient = useQueryClient();
  
  return useMutation<DeleteTravelResponse, Error, number>({
    mutationKey: [DELETE_TRAVEL],
    mutationFn: deleteTravel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_TRAVELS] });
    },
  });
};

// Helper functions for type conversion
export const mapTravelToLocal = (travel: Travel): LocalTravel => ({
  id: travel.id.toString(),
  employeeId: travel.employee_id,
  employeeName: travel.employee_name,
  department: travel.department,
  purpose: travel.purpose,
  startDate: travel.start_date.split('T')[0], // Extract date part
  endDate: travel.end_date.split('T')[0], // Extract date part
  destination: travel.destination,
  travelMode: travel.travel_mode,
  accommodation: travel.accommodation,
  estimatedCost: travel.estimated_cost,
  advanceAmount: travel.advance_amount,
  status: travel.status,
  created_at: travel.created_at,
  updated_at: travel.updated_at
});

export const mapLocalToTravelRequest = (localTravel: LocalTravel): CreateTravelRequest => ({
  employee_id: localTravel.employeeId,
  employee_name: localTravel.employeeName,
  department: localTravel.department,
  purpose: localTravel.purpose,
  start_date: localTravel.startDate,
  end_date: localTravel.endDate,
  destination: localTravel.destination,
  travel_mode: localTravel.travelMode,
  accommodation: localTravel.accommodation,
  estimated_cost: parseFloat(localTravel.estimatedCost) || 0,
  advance_amount: parseFloat(localTravel.advanceAmount) || 0
});

export const mapLocalToUpdateRequest = (localTravel: LocalTravel): UpdateTravelRequest => ({
  id: parseInt(localTravel.id),
  employee_id: localTravel.employeeId,
  employee_name: localTravel.employeeName,
  department: localTravel.department,
  purpose: localTravel.purpose,
  start_date: localTravel.startDate,
  end_date: localTravel.endDate,
  destination: localTravel.destination,
  travel_mode: localTravel.travelMode,
  accommodation: localTravel.accommodation,
  estimated_cost: parseFloat(localTravel.estimatedCost) || 0,
  advance_amount: parseFloat(localTravel.advanceAmount) || 0,
  status: localTravel.status
});