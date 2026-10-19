import { NextResponse } from "next/server"

const API_BASE_URL =
  process.env.BACKEND_SERVICE_URL ||
  process.env.BACKEND_API_BASE_URL ||
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://ippis-backend.onrender.com/api"
const TARGET_PATH = "/users/admin/import"

const normalizeApiBaseUrl = (value: string) => {
  const trimmed = value.trim().replace(/\/+$/, "")
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`
}

const buildTargetUrl = (request: Request) => {
  const incomingUrl = new URL(request.url)
  const targetUrl = new URL(normalizeApiBaseUrl(API_BASE_URL))
  targetUrl.pathname = `${targetUrl.pathname.replace(/\/$/, "")}${TARGET_PATH}`
  targetUrl.search = incomingUrl.search
  return targetUrl.toString()
}

const forwardHeaders = (request: Request) => {
  const headers = new Headers()
  const authorization = request.headers.get("authorization")
  const contentType = request.headers.get("content-type")

  if (authorization) headers.set("authorization", authorization)
  if (contentType) headers.set("content-type", contentType)
  headers.set("accept", "application/json")

  return headers
}

export async function POST(request: Request) {
  const targetUrl = buildTargetUrl(request)
  const headers = forwardHeaders(request)
  const body = await request.text()

  const response = await fetch(targetUrl, {
    method: "POST",
    headers,
    body,
    cache: "no-store",
  })

  const text = await response.text()
  const responseType = response.headers.get("content-type") || "application/json"

  return new NextResponse(text, {
    status: response.status,
    headers: {
      "content-type": responseType,
    },
  })
}
