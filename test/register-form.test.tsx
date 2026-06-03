import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import RegisterForm from "@/app/register/register-form"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { usePersonalInfo } from "@/services/hooks/register/personal-info"
import { useEmploymentInfo } from "@/services/hooks/register/employment-info"
import { useRegistrationDocuments } from "@/services/hooks/register/documents"
import { registerEmployee } from "@/services/endpoints/employees/employees"

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}))
jest.mock("@/services/hooks/register/personal-info", () => ({ usePersonalInfo: jest.fn() }))
jest.mock("@/services/hooks/register/employment-info", () => ({ useEmploymentInfo: jest.fn() }))
jest.mock("@/services/hooks/register/documents", () => ({ useRegistrationDocuments: jest.fn() }))
jest.mock("@/services/endpoints/employees/employees", () => ({ registerEmployee: jest.fn() }))

jest.mock("../app/register/verification-step", () => (props: any) => (
  <button type="button" onClick={() => props.onSubmit({ registrationId: "REG-123", nin: "111", verifiedNIN: { firstname: "Ada", surname: "Lovelace", email: "ada@example.com", verified: true } })}>
    submit verification
  </button>
))
jest.mock("../app/register/personal-info-step", () => (props: any) => (
  <button type="button" onClick={() => props.onSubmit({ firstName: "Ada", surname: "Lovelace", email: "ada@example.com" })}>
    submit personal
  </button>
))
jest.mock("../app/register/employment-info-stepII", () => (props: any) => (
  <button type="button" onClick={() => props.handleEmploymentInfoSubmit({ department: "HR", rankPosition: "Officer" })}>
    submit employment
  </button>
))
jest.mock("../app/register/document-upload-step", () => (props: any) => (
  <button type="button" onClick={() => props.onSubmit({ profileImage: new File(["x"], "x.png") })}>
    submit docs
  </button>
))
jest.mock("../app/register/preview-step", () => ({
  PreviewStep: (props: any) => (
    <button type="button" onClick={() => props.onSubmit({ declaration: true })}>
      submit final
    </button>
  ),
}))
jest.mock("../app/register/step-indicator", () => ({ StepIndicator: () => <div data-testid="step-indicator" /> }))

describe("RegisterForm", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ push: jest.fn(), replace: jest.fn() })
    ;(usePathname as jest.Mock).mockReturnValue("/register")
    ;(useSearchParams as jest.Mock).mockReturnValue({ toString: () => "" })
    ;(usePersonalInfo as jest.Mock).mockReturnValue({ mutateAsync: jest.fn().mockResolvedValue({ success: true }) })
    ;(useEmploymentInfo as jest.Mock).mockReturnValue({ mutateAsync: jest.fn().mockResolvedValue({ success: true }) })
    ;(useRegistrationDocuments as jest.Mock).mockReturnValue({ mutateAsync: jest.fn().mockResolvedValue({ success: true }) })
    ;(registerEmployee as jest.Mock).mockResolvedValue({ success: true })
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, registrationId: "REG-123" }),
    }) as jest.Mock
    localStorage.clear()
  })

  it("renders the registration wizard and opens the registration-id modal from verification", async () => {
    render(<RegisterForm />)

    expect(screen.getByTestId("step-indicator")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: /submit verification/i }))

    expect(screen.getByText(/your registration id/i)).toBeInTheDocument()
    expect(screen.getByDisplayValue("REG-123")).toBeInTheDocument()
  })

  it("lets the user confirm a manual registration id", async () => {
    render(<RegisterForm />)

    await userEvent.click(screen.getByRole("button", { name: /submit verification/i }))
    await userEvent.click(screen.getByRole("button", { name: /i have saved it/i }))

    expect(screen.queryByText(/your registration id/i)).not.toBeInTheDocument()
    expect(localStorage.getItem("registration_id")).toBe("REG-123")
  })
})
