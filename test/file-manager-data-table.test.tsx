import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { FileManagerDataTable } from "@/app/admin/file-manager/components/file-manager-data-table"

jest.mock("@/components/ui/select", () => ({
  Select: ({ children, onValueChange }: any) => {
    ;(globalThis as any).__fileManagerOnValueChange = onValueChange
    return <div>{children}</div>
  },
  SelectTrigger: ({ children, ...props }: any) => <button type="button" {...props}>{children}</button>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value, onClick }: any) => (
    <button
      type="button"
      role="option"
      aria-label={String(children)}
      data-value={value}
      onClick={(event) => {
        onClick?.(event)
        ;(globalThis as any).__fileManagerOnValueChange?.(value)
      }}
    >
      {children}
    </button>
  ),
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}))

const rows = [
  { id: "1", name: "Alpha File", status: "active", parent_id: null },
  { id: "2", name: "Beta Folder", status: "inactive", parent_id: "1" },
]

describe("FileManagerDataTable", () => {
  it("filters rows by search text", async () => {
    render(
      <FileManagerDataTable
        title="Files"
        columns={[{ key: "name", label: "Name" }]}
        data={rows}
        onAdd={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onView={jest.fn()}
      />
    )

    expect(screen.getByText("Alpha File")).toBeInTheDocument()
    expect(screen.getByText("Beta Folder")).toBeInTheDocument()

    await userEvent.type(screen.getByRole("searchbox"), "Alpha")

    expect(screen.getByText("Alpha File")).toBeInTheDocument()
    expect(screen.queryByText("Beta Folder")).not.toBeInTheDocument()
  })

  it("applies filters and exposes action callbacks", async () => {
    const onDelete = jest.fn()
    render(
      <FileManagerDataTable
        title="Files"
        columns={[{ key: "name", label: "Name" }]}
        data={rows}
        filterOptions={[{ id: "status", label: "Status", options: [{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }] }]}
        onAdd={jest.fn()}
        onEdit={jest.fn()}
        onDelete={onDelete}
        onView={jest.fn()}
      />
    )

    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: /filter/i }))
    const activeOption = screen.getByRole("option", { name: /^active$/i })
    await user.click(activeOption)
    await user.click(screen.getByRole("button", { name: /apply filters/i }))

    await user.click(screen.getAllByRole("button", { name: /delete/i })[0])
    expect(onDelete).toHaveBeenCalledWith("1")
  })
})
