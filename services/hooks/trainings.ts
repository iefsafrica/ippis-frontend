import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getTrainings,
  getTraining,
  createTraining,
  updateTraining,
  deleteTraining,
  getTrainingTypes,
  getTrainers,
} from "@/services/endpoints/trainings/trainings"
import {
  GET_TRAININGS,
  GET_TRAINING,
  CREATE_TRAINING,
  UPDATE_TRAINING,
  DELETE_TRAINING,
  GET_TRAINING_TYPES,
  GET_TRAINERS,
} from "@/services/constants/trainings"
import type {
  CreateTrainingRequest,
  CreateTrainingResponse,
  DeleteTrainingResponse,
  GetTrainingTypesResponse,
  GetTrainersResponse,
  GetTrainingResponse,
  GetTrainingsResponse,
  UpdateTrainingRequest,
  UpdateTrainingResponse,
} from "@/types/trainings"

export const useGetTrainings = () => {
  return useQuery<GetTrainingsResponse>({
    queryKey: [GET_TRAININGS],
    queryFn: getTrainings,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
  })
}

export const useGetTraining = (id?: number) => {
  return useQuery<GetTrainingResponse>({
    queryKey: [GET_TRAINING, id],
    queryFn: () => {
      if (!id) throw new Error("Training id is required")
      return getTraining(id)
    },
    enabled: typeof id === "number",
  })
}

export const useGetTrainingTypes = () => {
  return useQuery<GetTrainingTypesResponse>({
    queryKey: [GET_TRAINING_TYPES],
    queryFn: getTrainingTypes,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
  })
}

export const useGetTrainers = () => {
  return useQuery<GetTrainersResponse>({
    queryKey: [GET_TRAINERS],
    queryFn: getTrainers,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
  })
}

export const useCreateTraining = () => {
  const queryClient = useQueryClient()
  return useMutation<CreateTrainingResponse, Error, CreateTrainingRequest>({
    mutationKey: [CREATE_TRAINING],
    mutationFn: createTraining,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_TRAININGS] })
    },
  })
}

export const useUpdateTraining = () => {
  const queryClient = useQueryClient()
  return useMutation<UpdateTrainingResponse, Error, { id: number; data: UpdateTrainingRequest }>({
    mutationKey: [UPDATE_TRAINING],
    mutationFn: ({ id, data }) => updateTraining(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_TRAININGS] })
      queryClient.invalidateQueries({ queryKey: [GET_TRAINING, variables.id] })
    },
  })
}

export const useDeleteTraining = () => {
  const queryClient = useQueryClient()
  return useMutation<DeleteTrainingResponse, Error, number>({
    mutationKey: [DELETE_TRAINING],
    mutationFn: deleteTraining,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [GET_TRAININGS] })
      queryClient.invalidateQueries({ queryKey: [GET_TRAINING, id] })
    },
  })
}
