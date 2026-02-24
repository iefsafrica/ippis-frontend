import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.BACKEND_API_BASE_URL ||
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://ippis-backend.onrender.com/api";
const TARGET_PATH = "/admin/organization/designation";

async function proxyRequest(request: Request, method: string) {
  const incomingUrl = new URL(request.url);
  const query = incomingUrl.searchParams.toString();
  const targetUrl = `${API_BASE_URL}${TARGET_PATH}${query ? `?${query}` : ""}`;

  const headers = new Headers();
  const authorization = request.headers.get("authorization");
  const contentType = request.headers.get("content-type");

  if (authorization) headers.set("authorization", authorization);
  if (contentType) headers.set("content-type", contentType);
  headers.set("accept", "application/json");

  const hasBody = method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE";
  const body = hasBody ? await request.text() : undefined;

  const response = await fetch(targetUrl, {
    method,
    headers,
    body,
    cache: "no-store",
  });

  const text = await response.text();
  const responseType = response.headers.get("content-type") || "application/json";

  return new NextResponse(text, {
    status: response.status,
    headers: {
      "content-type": responseType,
    },
  });
}

export async function GET(request: Request) {
  return proxyRequest(request, "GET");
}

export async function POST(request: Request) {
  return proxyRequest(request, "POST");
}

export async function PUT(request: Request) {
  return proxyRequest(request, "PUT");
}

export async function DELETE(request: Request) {
  return proxyRequest(request, "DELETE");
}
