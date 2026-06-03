import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import DashboardContent from "@/app/admin/dashboard-content"
import { useDashboardStats } from "@/services/hooks/overview/useOverview"
import { useRecentActivities } from "@/services/hooks/overview/recent"
import { useRecentEmployees } from "@/services/hooks/employees/useEmployees"

jest.mock("../app/admin/components/dashboard-chart", () => ({
  DashboardChart: () => <div data-testid="dashboard-chart" />,
}))
jest.mock("../app/admin/components/fallback-chart", () => ({
  FallbackChart: () => <div data-testid="fallback-chart" />,
}))
jest.mock("@/services/hooks/overview/useOverview", () => ({ useDashboardStats: jest.fn() }))
jest.mock("@/services/hooks/overview/recent", () => ({ useRecentActivities: jest.fn() }))
jest.mock("@/services/hooks/employees/useEmployees", () => ({ useRecentEmployees: jest.fn() }))

describe("DashboardContent", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders loading skeletons while data is loading", () => {
    ;(useDashboardStats as jest.Mock).mockReturnValue({ data: null, isLoading: true, error: null, refetch: jest.fn() })
    ;(useRecentActivities as jest.Mock).mockReturnValue({ data: null, isLoading: true, error: null, refetch: jest.fn() })
    ;(useRecentEmployees as jest.Mock).mockReturnValue({ data: null, isLoading: true, error: null, refetch: jest.fn() })

    render(<DashboardContent />)

    expect(screen.getByText(/dashboard overview/i)).toBeInTheDocument()
    expect(screen.getAllByText(/all registered employees/i)).toHaveLength(1)
  })

  it("renders dashboard data and recent activity records", async () => {
    const user = userEvent.setup()
    ;(useDashboardStats as jest.Mock).mockReturnValue({
      data: {
        totalEmployees: 12,
        activeEmployees: 9,
        pendingEmployees: 3,
        verifiedDocuments: 10,
        pendingDocuments: 2,
        rejectedDocuments: 1,
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })
    ;(useRecentActivities as jest.Mock).mockReturnValue({
      data: { data: [{ id: "1", name: "Jane Doe", type: "joined", created_at: "2026-05-25T08:00:00Z" }] },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })
    ;(useRecentEmployees as jest.Mock).mockReturnValue({
      data: { employees: [{ id: "EMP-1", name: "John Smith", email: "john@example.com", department: "HR", position: "Analyst", status: "active", join_date: "2026-05-20", registration_id: "REG-1" }] },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })

    render(<DashboardContent />)

    expect(screen.getByText("12")).toBeInTheDocument()
    expect(screen.getByText("Jane Doe")).toBeInTheDocument()
    expect(screen.getByText("John Smith")).toBeInTheDocument()
    expect(screen.getByTestId("dashboard-chart")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /refresh/i }))
  })

  it("shows an activities error state", () => {
    ;(useDashboardStats as jest.Mock).mockReturnValue({ data: null, isLoading: false, error: null, refetch: jest.fn() })
    ;(useRecentActivities as jest.Mock).mockReturnValue({ data: { data: [] }, isLoading: false, error: new Error("boom"), refetch: jest.fn() })
    ;(useRecentEmployees as jest.Mock).mockReturnValue({ data: { employees: [] }, isLoading: false, error: null, refetch: jest.fn() })

    render(<DashboardContent />)

    expect(screen.getByText(/failed to load activities/i)).toBeInTheDocument()
  })
})
