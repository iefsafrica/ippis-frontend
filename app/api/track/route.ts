import { NextRequest, NextResponse } from "next/server"

const API_BASE_URL =
  process.env.BACKEND_SERVICE_URL ||
  process.env.BACKEND_API_BASE_URL ||
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://ippis-backend.onrender.com/api"

const buildTargetUrl = (request: NextRequest) => {
  const url = new URL(API_BASE_URL)
  url.pathname = `${url.pathname.replace(/\/$/, "")}/track`
  url.search = request.nextUrl.search
  return url.toString()
}

const forwardHeaders = (request: NextRequest) => {
  const headers = new Headers()
  const authorization = request.headers.get("authorization")

  if (authorization) {
    headers.set("authorization", authorization)
  }

  headers.set("accept", "application/json")
  return headers
}

const proxyRequest = async (request: NextRequest) => {
  const response = await fetch(buildTargetUrl(request), {
    method: "GET",
    headers: forwardHeaders(request),
    cache: "no-store",
  })

  const text = await response.text()
  return new NextResponse(text, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") || "application/json",
    },
  })
}

export async function GET(request: NextRequest) {
  return proxyRequest(request)
}
