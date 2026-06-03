jest.mock("next/server", () => {
  const NextResponse = {
    next: jest.fn(() => ({
      headers: new Headers(),
    })),
    redirect: jest.fn((url: URL) => ({
      headers: new Headers({ location: url.toString() }),
    })),
  }

  return { NextResponse }
})

import { middleware } from "@/middleware"

function makeRequest(pathname: string, headers: Record<string, string> = {}, token?: string) {
  return {
    url: `http://localhost${pathname}`,
    headers: {
      get: (key: string) => headers[key.toLowerCase()] ?? headers[key] ?? null,
    },
    nextUrl: { pathname },
    cookies: {
      get: (name: string) => (name === "ippis_token" && token ? { value: token } : undefined),
    },
  } as any
}

describe("middleware", () => {
  it("redirects service worker requests to the blocker endpoint", () => {
    const response = middleware(makeRequest("/sw.js"))
    expect(response.headers.get("location")).toContain("/api/sw-blocker")
  })

  it("redirects authenticated login requests to /admin", () => {
    const response = middleware(makeRequest("/auth/login", {}, "token"))
    expect(response.headers.get("location")).toContain("/admin")
  })

  it("sets anti service-worker headers for normal requests", () => {
    const response = middleware(makeRequest("/admin"))
    expect(response.headers.get("service-worker-allowed")).toBe("false")
    expect(response.headers.get("cache-control")).toContain("no-store")
  })
})
