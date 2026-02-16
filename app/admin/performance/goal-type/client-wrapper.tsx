"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import GoalTypeContent, { type TableGoalType } from "./goal-type-content"
import {
  useGoalTypes,
  useCreateGoalType,
  useUpdateGoalTypeStatus,
  useDeleteGoalType,
} from "@/services/hooks/performance/useGoalTypes"

const transformToTableGoalType = (data: any): TableGoalType => {
  return {
    id: data.id?.toString() || Math.random().toString(),
    goalType: data.goal_type || data.name || "Unknown",
    description: data.description || "",
    status: data.status || "active",
    createdDate: data.created_date || data.createdAt || new Date().toISOString(),
  }
}

export default function ClientWrapper() {
  const [tableGoalTypes, setTableGoalTypes] = useState<TableGoalType[]>([])
  const [needsRefresh, setNeedsRefresh] = useState(false)
  const [isManualRefreshing, setIsManualRefreshing] = useState(false)

  const {
    data: goalTypesData = [],
    isLoading: isLoadingGoalTypes,
    error: goalTypesError,
    refetch: refetchGoalTypes,
  } = useGoalTypes()

  const refreshGoalTypesData = async () => {
    try {
      setIsManualRefreshing(true)
      const { data: newData } = await refetchGoalTypes()

      if (newData && newData.length > 0) {
        const transformed = newData.map(transformToTableGoalType)
        setTableGoalTypes(transformed)
        toast.success("Goal types updated")
      } else {
        setTableGoalTypes([])
      }

      setNeedsRefresh(false)
    } catch (error) {
      console.error("Error refreshing goal types:", error)
      toast.error("Failed to refresh goal types")
    } finally {
      setIsManualRefreshing(false)
    }
  }

  const createGoalTypeMutation = useCreateGoalType({
    onSuccess: () => {
      setNeedsRefresh(true)
      toast.success("Goal type created successfully!")
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create goal type")
    },
  })

  const updateGoalTypeStatusMutation = useUpdateGoalTypeStatus({
    onSuccess: () => {
      refreshGoalTypesData()
      toast.success("Goal type status updated!")
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update goal type status")
    },
  })

  const deleteGoalTypeMutation = useDeleteGoalType({
    onSuccess: () => {
      refreshGoalTypesData()
      toast.success("Goal type deleted successfully!")
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete goal type")
    },
  })

  useEffect(() => {
    if (goalTypesData && goalTypesData.length > 0) {
      const transformed = goalTypesData.map(transformToTableGoalType)
      setTableGoalTypes(transformed)
    } else {
      setTableGoalTypes([])
    }
  }, [goalTypesData])

  useEffect(() => {
    if (needsRefresh && !isManualRefreshing) {
      refreshGoalTypesData()
    }
  }, [needsRefresh, isManualRefreshing])

  useEffect(() => {
    if (goalTypesError) {
      toast.error("Failed to load goal types. Please try again.")
    }
  }, [goalTypesError])

  const handleAddGoalType = async (data: { goal_type: string; description: string; status: "active" | "inactive" }) => {
    try {
      const result = await createGoalTypeMutation.mutateAsync(data)
      return result
    } catch (error) {
      throw error
    }
  }

  const handleToggleStatus = async (id: string, nextStatus: "active" | "inactive") => {
    try {
      const goalTypeId = parseInt(id)
      if (!isNaN(goalTypeId)) {
        await updateGoalTypeStatusMutation.mutateAsync({
          id: goalTypeId,
          status: nextStatus,
        })
      } else {
        toast.error("Invalid goal type ID")
        throw new Error("Invalid goal type ID")
      }
    } catch (error) {
      throw error
    }
  }

  const handleEditGoalType = async (
    id: string,
    data: { goal_type: string; description: string; status: "active" | "inactive" }
  ) => {
    try {
      const goalTypeId = parseInt(id)
      if (!isNaN(goalTypeId)) {
        await updateGoalTypeStatusMutation.mutateAsync({
          id: goalTypeId,
          status: data.status,
          goal_type: data.goal_type,
          description: data.description,
        })
      } else {
        toast.error("Invalid goal type ID")
        throw new Error("Invalid goal type ID")
      }
    } catch (error) {
      throw error
    }
  }

  const handleDeleteGoalType = async (id: string) => {
    try {
      const goalTypeId = parseInt(id)
      if (!isNaN(goalTypeId)) {
        await deleteGoalTypeMutation.mutateAsync({ id: goalTypeId })
      } else {
        toast.error("Invalid goal type ID")
        throw new Error("Invalid goal type ID")
      }
    } catch (error) {
      throw error
    }
  }

  const isLoading =
    isLoadingGoalTypes ||
    createGoalTypeMutation.isPending ||
    updateGoalTypeStatusMutation.isPending ||
    deleteGoalTypeMutation.isPending ||
    isManualRefreshing

  return (
    <GoalTypeContent
      goalTypes={tableGoalTypes}
      isLoading={isLoading}
      isError={!!goalTypesError}
      errorMessage={goalTypesError?.message || "Failed to load goal types"}
      onRefresh={refreshGoalTypesData}
      onAddGoalType={handleAddGoalType}
      onEditGoalType={handleEditGoalType}
      onDeleteGoalType={handleDeleteGoalType}
    />
  )
}
