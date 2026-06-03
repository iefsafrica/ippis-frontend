import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"

describe("DeleteConfirmationDialog", () => {
  it("calls confirm and close handlers", async () => {
    const onClose = jest.fn()
    const onConfirm = jest.fn().mockResolvedValue(undefined)

    render(
      <DeleteConfirmationDialog
        isOpen
        onClose={onClose}
        onConfirm={onConfirm}
        itemName="Employee record"
      />
    )

    expect(screen.getByText(/delete record/i)).toBeInTheDocument()
    expect(screen.getByText(/employee record/i)).toBeInTheDocument()

    await userEvent.click(screen.getByRole("button", { name: /delete permanently/i }))
    expect(onConfirm).toHaveBeenCalled()

    await userEvent.click(screen.getByRole("button", { name: /cancel/i }))
    expect(onClose).toHaveBeenCalled()
  })
})
