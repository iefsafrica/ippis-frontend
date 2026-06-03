import { render, screen } from "@testing-library/react"
import { AdminSidebar } from "@/app/admin/components/admin-sidebar"
import { usePathname } from "next/navigation"
import { useMobile } from "@/hooks/use-mobile"

jest.mock("next/navigation", () => ({ usePathname: jest.fn() }))
jest.mock("@/hooks/use-mobile", () => ({ useMobile: jest.fn() }))

describe("AdminSidebar", () => {
  it("renders navigation for the active admin section", () => {
    ;(usePathname as jest.Mock).mockReturnValue("/admin/payroll/payment-history")
    ;(useMobile as jest.Mock).mockReturnValue({ isMobile: false, toggleSidebar: jest.fn() })

    render(<AdminSidebar />)

    expect(screen.getByText(/^dashboard$/i)).toBeInTheDocument()
  })
})
