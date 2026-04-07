import type { CreateTrainingRequest, Training, UpdateTrainingRequest } from "@/types/trainings"

export interface LocalTraining {
  id: string
  title: string
  type: string
  trainer: string
  startDate: string
  endDate?: string
  participants: number
  cost: number
  status: string
  location: string
  description: string
  objectives: string
  materials: string
  createdAt: string
  updatedAt: string
  email: string
  phone: string
}

export interface TrainingFormData {
  title: string
  type: string
  trainer: string
  startDate: string
  endDate: string
  cost: number | string
  status: string
  location: string
  participants: number | string
  description: string
  objectives: string
  materials: string
}

const toNumber = (value: number | string | undefined, fallback = 0) => {
  if (typeof value === "number") return value
  const parsed = parseFloat(String(value ?? ""))
  return Number.isNaN(parsed) ? fallback : parsed
}

const toIso = (value: string | undefined) => {
  if (!value) return new Date().toISOString()
  const parsed = new Date(value)
  if (Number.isNaN(parsed.valueOf())) {
    return new Date().toISOString()
  }
  return parsed.toISOString()
}

export const mapApiTrainingToLocal = (training: Training): LocalTraining => ({
  id: training.id.toString(),
  title: training.training_title,
  type: training.type,
  trainer: training.trainer,
  startDate: training.start_date,
  endDate: training.end_date,
  participants: training.participants,
  cost: toNumber(training.cost),
  status: training.status,
  location: training.location ?? "",
  description: training.description ?? "",
  objectives: training.objectives ?? "",
  materials: training.materials ?? "",
  email: training.email ?? "",
  phone: training.phone ?? "",
  createdAt: training.created_at,
  updatedAt: training.updated_at,
})

export const transformFormToCreateTraining = (form: TrainingFormData): CreateTrainingRequest => ({
  training_title: form.title,
  type: form.type,
  trainer: form.trainer,
  start_date: toIso(form.startDate),
  participants: toNumber(form.participants),
  cost: toNumber(form.cost).toFixed(2),
  status: form.status,
})

export const transformFormToUpdateTraining = (form: TrainingFormData): UpdateTrainingRequest => ({
  training_title: form.title,
  type: form.type,
  trainer: form.trainer,
  start_date: toIso(form.startDate),
  participants: toNumber(form.participants),
  cost: toNumber(form.cost).toFixed(2),
  status: form.status,
})
