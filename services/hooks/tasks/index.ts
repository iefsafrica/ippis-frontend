import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask,
} from "@/services/endpoints/tasks"
import { TASK_QUERY_KEYS } from "@/services/constants/tasks"
import { TaskCreateRequest, TaskResponse, TaskUpdateRequest } from "@/types/tasks"

export const useGetTasks = () => {
  return useQuery({
    queryKey: TASK_QUERY_KEYS.list(),
    queryFn: getTasks,
    staleTime: 1000 * 60 * 5,
  })
}

export const useGetTask = (taskId?: number) => {
  return useQuery({
    queryKey: taskId ? TASK_QUERY_KEYS.detail(taskId) : TASK_QUERY_KEYS.detail("draft"),
    queryFn: () => getTaskById(taskId ?? 0),
    enabled: !!taskId,
  })
}

export const useCreateTask = () => {
  const queryClient = useQueryClient()
  return useMutation<TaskResponse, Error, TaskCreateRequest>({
    mutationKey: TASK_QUERY_KEYS.create(),
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.list() })
    },
  })
}

export const useUpdateTask = () => {
  const queryClient = useQueryClient()
  return useMutation<TaskResponse, Error, TaskUpdateRequest>({
    mutationKey: TASK_QUERY_KEYS.update(),
    mutationFn: updateTask,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.list() })
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.detail(variables.id) })
    },
  })
}

export const useDeleteTask = () => {
  const queryClient = useQueryClient()
  return useMutation<{ success: boolean }, Error, number>({
    mutationKey: TASK_QUERY_KEYS.remove(),
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.list() })
    },
  })
}
