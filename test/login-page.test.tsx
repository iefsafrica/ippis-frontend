import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { waitFor } from "@testing-library/react"
import LoginPage from "@/app/auth/login/page"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}))

jest.mock("next/navigation", () => ({ useRouter: jest.fn() }))
jest.mock("js-cookie", () => ({ __esModule: true, default: { set: jest.fn() } }))

describe("LoginPage", () => {
  const push = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ push })
    localStorage.clear()
  })

  it("shows a validation error for invalid credentials", async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.type(screen.getByLabelText(/username/i), "wrong")
    await user.type(screen.getByLabelText(/password/i), "wrong")
    await user.click(screen.getByRole("button", { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument()
    })
    expect(Cookies.set).not.toHaveBeenCalled()
  })

  it("authenticates the demo admin user and redirects", async () => {
    jest.useFakeTimers()
    try {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })

      render(<LoginPage />)

      await user.type(screen.getByLabelText(/username/i), "admin")
      await user.type(screen.getByLabelText(/password/i), "admin123")
      await user.click(screen.getByRole("button", { name: /sign in/i }))

      await act(async () => {
        await jest.advanceTimersByTimeAsync(1000)
      })

      await waitFor(() => {
        expect(Cookies.set).toHaveBeenCalledWith("ippis_token", "demo-token-value", { expires: 1 })
        expect(localStorage.getItem("ippis_user")).toContain('"username":"admin"')
        expect(push).toHaveBeenCalledWith("/admin")
      })
    } finally {
      jest.useRealTimers()
    }
  })
})
