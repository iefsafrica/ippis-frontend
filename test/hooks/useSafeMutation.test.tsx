import { renderHook, act, waitFor } from "@testing-library/react"
import { useSafeMutation } from "@/hooks/useSafeMutation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}))
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }))

describe("useSafeMutation", () => {
  it("invalidates queries and shows a success toast", async () => {
    const invalidateQueries = jest.fn()
    ;(useQueryClient as jest.Mock).mockReturnValue({ invalidateQueries })
    ;(useMutation as jest.Mock).mockImplementation((options) => ({
      mutateAsync: async (variables: unknown) => {
        const result = await options.mutationFn(variables)
        options.onSuccess?.(result, variables, undefined)
        return result
      },
      isPending: false,
      ...options,
    }))

    const { result } = renderHook(() =>
      useSafeMutation({
        mutationFn: async (value: string) => value,
        invalidateQueries: [["employees"]],
        successMessage: "Saved",
      })
    )

    await act(async () => {
      await result.current.safeMutateAsync("value")
    })

    await waitFor(() => {
      expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["employees"] })
      expect(toast.success).toHaveBeenCalledWith("Saved")
    })
  })
})
