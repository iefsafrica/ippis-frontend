import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createLocation,
  deleteLocation,
  getLocationById,
  getLocations,
  updateLocation,
} from "@/services/endpoints/organizations/location/location";
import {
  CREATE_LOCATION,
  DELETE_LOCATION,
  GET_LOCATION,
  GET_LOCATIONS,
  UPDATE_LOCATION,
} from "@/services/constants/organizations/location";
import {
  CreateLocationPayload,
  CreateLocationResponse,
  DeleteLocationResponse,
  GetLocationByIdResponse,
  GetLocationsResponse,
  Location,
  UpdateLocationPayload,
  UpdateLocationResponse,
} from "@/types/organizations/location/location-management";

export const useGetLocations = () => {
  return useQuery<GetLocationsResponse, Error>({
    queryKey: [GET_LOCATIONS],
    queryFn: getLocations,
  });
};

export const useGetLocationById = (id?: string | number) => {
  return useQuery<GetLocationByIdResponse, Error>({
    queryKey: [GET_LOCATION, id],
    queryFn: () => getLocationById(id as string | number),
    enabled: id !== undefined && id !== null && `${id}`.length > 0,
  });
};

export const useCreateLocation = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateLocationResponse, Error, CreateLocationPayload>({
    mutationKey: [CREATE_LOCATION],
    mutationFn: createLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_LOCATIONS] });
    },
  });
};

export const useUpdateLocation = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdateLocationResponse, Error, UpdateLocationPayload>({
    mutationKey: [UPDATE_LOCATION],
    mutationFn: updateLocation,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_LOCATIONS] });
      queryClient.invalidateQueries({ queryKey: [GET_LOCATION, variables.id] });
    },
  });
};

export const useDeleteLocation = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteLocationResponse, Error, string | number>({
    mutationKey: [DELETE_LOCATION],
    mutationFn: deleteLocation,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: [GET_LOCATIONS] });
      queryClient.invalidateQueries({ queryKey: [GET_LOCATION, deletedId] });
    },
  });
};

export const useLocationsData = () => {
  return useQuery<Location[], Error>({
    queryKey: [GET_LOCATIONS, "normalized"],
    queryFn: async () => {
      const response = await getLocations();
      return response.data || [];
    },
  });
};
