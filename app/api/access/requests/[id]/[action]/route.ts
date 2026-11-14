import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.BACKEND_SERVICE_URL ||
  process.env.BACKEND_API_BASE_URL ||
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://ippis-backend.onrender.com/api";

const forwardHeaders = (request: Request) => {
  const headers = new Headers();
  const authorization = request.headers.get("authorization");
  const contentType = request.headers.get("content-type");

  if (authorization) headers.set("authorization", authorization);
  if (contentType) headers.set("content-type", contentType);
  headers.set("accept", "application/json");

  return headers;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; action: string }> }
) {
  try {
    const { id, action } = await params;
    const targetUrl = new URL(API_BASE_URL);
    targetUrl.pathname = `${targetUrl.pathname.replace(/\/$/, "")}/access/requests/${id}/${action}`;

    const body = request.method !== "GET" && request.method !== "HEAD" ? await request.text() : undefined;
    const response = await fetch(targetUrl.toString(), {
      method: "POST",
      headers: forwardHeaders(request),
      body,
      cache: "no-store",
    });

    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: { "content-type": response.headers.get("content-type") || "application/json" },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
