import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.BACKEND_API_BASE_URL ||
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://ippis-backend.onrender.com/api";
const TARGET_PATH = "/admin/organization/company";

async function proxyRequest(request: Request, method: string) {
  const incomingUrl = new URL(request.url);
  const query = incomingUrl.searchParams.toString();
  const targetUrl = `${API_BASE_URL}${TARGET_PATH}${query ? `?${query}` : ""}`;

  const headers = new Headers();
  let authorization = request.headers.get("authorization");
  if (!authorization) {
    const cookieHeader = request.headers.get("cookie") || "";
    const match = cookieHeader.match(/(?:^|;\s*)(?:ippis_token|token)=([^;]+)/);
    if (match && match[1]) {
      authorization = `Bearer ${decodeURIComponent(match[1])}`;
    }
  }
  const contentType = request.headers.get("content-type");

  if (authorization) headers.set("authorization", authorization);
  if (contentType) headers.set("content-type", contentType);
  headers.set("accept", "application/json");

  const hasBody = method === "POST" || method === "PUT" || method === "PATCH";
  const body = hasBody ? await request.text() : undefined;

  try {
    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
      cache: "no-store",
    });

    if (method === "GET" && response.status === 401 && !authorization) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "No company records accessible without authentication",
      });
    }

    const text = await response.text();
    const responseType = response.headers.get("content-type") || "application/json";

    return new NextResponse(text, {
      status: response.status,
      headers: {
        "content-type": responseType,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to communicate with company service",
      },
      { status: 502 }
    );
  }
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
