import { NextResponse } from "next/server"

const API_BASE_URL =
  process.env.BACKEND_SERVICE_URL ||
  process.env.BACKEND_API_BASE_URL ||
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://ippis-backend.onrender.com/api"
const TARGET_PATH = "/admin/reports/export"

const buildTargetUrl = (request: Request) => {
  const incomingUrl = new URL(request.url)
  const targetUrl = new URL(API_BASE_URL)
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

const proxyRequest = async (request: Request) => {
  const targetUrl = buildTargetUrl(request)
  const headers = forwardHeaders(request)
  const hasBody = request.method !== "GET" && request.method !== "HEAD"
  const body = hasBody ? await request.text() : undefined

  const response = await fetch(targetUrl, {
    method: request.method,
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

export async function GET(request: Request) {
  return proxyRequest(request)
}

export async function POST(request: Request) {
  return proxyRequest(request)
}

export async function PUT(request: Request) {
  return proxyRequest(request)
}

export async function DELETE(request: Request) {
  return proxyRequest(request)
}
