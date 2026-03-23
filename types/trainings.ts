export interface Training {
  id: number;
  training_title: string;
  type: string;
  trainer: string;
  start_date: string;
  end_date?: string;
  participants: number;
  cost: string;
  status: string;
  location?: string;
  description?: string;
  objectives?: string;
  materials?: string;
  created_at: string;
  updated_at: string;
  email?: string;
  phone?: string;
}

export interface GetTrainingsResponse {
  success: boolean;
  data: Training[];
}

export interface GetTrainingResponse {
  success: boolean;
  data: Training;
}

export interface CreateTrainingRequest {
  training_title: string;
  type: string;
  trainer: string;
  start_date: string;
  participants: number;
  cost: string;
  status: string;
  email?: string;
  phone?: string;
}

export interface CreateTrainingResponse {
  success: boolean;
  message: string;
  data: Training;
}

export type UpdateTrainingRequest = CreateTrainingRequest;

export interface UpdateTrainingResponse {
  success: boolean;
  message: string;
  data: Training;
}

export interface DeleteTrainingResponse {
  success: boolean;
  message: string;
}

export interface TrainingType {
  type: string;
  status: string;
  trainings: string;
}

export interface GetTrainingTypesResponse {
  success: boolean;
  message: string;
  total?: number;
  data: TrainingType[];
}

export interface TrainerSummary {
  trainer_name: string;
  type: string;
  contact: string;
  experience: string;
  rating: number;
  trainings: number;
  status: string;
}

export interface GetTrainersResponse {
  success: boolean;
  message: string;
  total?: number;
  data: TrainerSummary[];
}
