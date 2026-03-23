import { get, post, put, del } from "@/services/axios"
import type {
  GetTrainingsResponse,
  GetTrainingResponse,
  CreateTrainingRequest,
  CreateTrainingResponse,
  UpdateTrainingRequest,
  UpdateTrainingResponse,
  DeleteTrainingResponse,
  GetTrainingTypesResponse,
  GetTrainersResponse,
} from "@/types/trainings"

const BASE_TRAINING_ENDPOINT = "/trainings"

export const getTrainings = async (): Promise<GetTrainingsResponse> => {
  return get<GetTrainingsResponse>(BASE_TRAINING_ENDPOINT)
}

export const getTraining = async (id: number): Promise<GetTrainingResponse> => {
  return get<GetTrainingResponse>(BASE_TRAINING_ENDPOINT, { id })
}

export const createTraining = async (
  payload: CreateTrainingRequest,
): Promise<CreateTrainingResponse> => {
  return post<CreateTrainingResponse>(BASE_TRAINING_ENDPOINT, payload)
}

export const updateTraining = async (
  id: number,
  payload: UpdateTrainingRequest,
): Promise<UpdateTrainingResponse> => {
  return put<UpdateTrainingResponse>(BASE_TRAINING_ENDPOINT, payload, {
    params: { id },
  })
}

export const deleteTraining = async (id: number): Promise<DeleteTrainingResponse> => {
  return del<DeleteTrainingResponse>(BASE_TRAINING_ENDPOINT, { id })
}

export const getTrainingTypes = async (): Promise<GetTrainingTypesResponse> => {
  return get<GetTrainingTypesResponse>(`${BASE_TRAINING_ENDPOINT}/training-types`)
}

export const getTrainers = async (): Promise<GetTrainersResponse> => {
  return get<GetTrainersResponse>(`${BASE_TRAINING_ENDPOINT}/trainers`)
}
