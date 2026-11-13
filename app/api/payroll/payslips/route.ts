import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const API_BASE_URL =
  process.env.BACKEND_SERVICE_URL ||
  process.env.BACKEND_API_BASE_URL ||
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://ippis-backend.onrender.com/api";

const forwardHeaders = (request: NextRequest) => {
  const headers = new Headers();
  const authorization = request.headers.get("authorization");
  const cookie = request.headers.get("cookie");
  const contentType = request.headers.get("content-type");

  if (authorization) headers.set("authorization", authorization);
  if (cookie) headers.set("cookie", cookie);
  if (contentType) headers.set("content-type", contentType);
  headers.set("accept", "application/json");

  return headers;
};

export async function GET(request: NextRequest) {
  try {
    const incomingUrl = new URL(request.url);
    const targetUrl = new URL(API_BASE_URL);
    targetUrl.pathname = `${targetUrl.pathname.replace(/\/$/, "")}/payroll/payslips`;
    targetUrl.search = incomingUrl.search;

    const response = await fetch(targetUrl.toString(), {
      method: "GET",
      headers: forwardHeaders(request),
      cache: "no-store",
    });

    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") || "application/json",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch payslips" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const targetUrl = new URL(API_BASE_URL);
    targetUrl.pathname = `${targetUrl.pathname.replace(/\/$/, "")}/payroll/payslips`;

    const body = await request.text();
    const response = await fetch(targetUrl.toString(), {
      method: "POST",
      headers: forwardHeaders(request),
      body,
      cache: "no-store",
    });

    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") || "application/json",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to generate payslips" },
      { status: 500 }
    );
  }
}

