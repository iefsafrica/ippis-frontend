import { renderHook, act } from "@testing-library/react"
import { useMobile } from "@/hooks/use-mobile"

describe("useMobile", () => {
  it("tracks mobile viewport changes and dispatches the sidebar toggle event", () => {
    window.innerWidth = 500

    const { result } = renderHook(() => useMobile())

    expect(result.current.isMobile).toBe(true)

    const listener = jest.fn()
    window.addEventListener("admin-sidebar-toggle", listener as EventListener)
    act(() => {
      result.current.toggleSidebar()
    })

    expect(listener).toHaveBeenCalled()

    window.innerWidth = 1200
    act(() => {
      window.dispatchEvent(new Event("resize"))
    })

    expect(result.current.isMobile).toBe(false)
  })
})
