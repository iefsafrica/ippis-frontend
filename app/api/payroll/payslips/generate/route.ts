import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const API_BASE_URL =
  process.env.BACKEND_SERVICE_URL ||
  process.env.BACKEND_API_BASE_URL ||
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://ippis-backend.onrender.com/api";

export async function POST(request: NextRequest) {
  try {
    const targetUrl = new URL(API_BASE_URL);
    targetUrl.pathname = `${targetUrl.pathname.replace(/\/$/, "")}/payroll/payslips/generate`;

    const headers = new Headers();
    const authorization = request.headers.get("authorization");
    const cookie = request.headers.get("cookie");
    const contentType = request.headers.get("content-type");

    if (authorization) headers.set("authorization", authorization);
    if (cookie) headers.set("cookie", cookie);
    headers.set("content-type", contentType || "application/json");
    headers.set("accept", "application/json");

    const body = await request.text();
    const response = await fetch(targetUrl.toString(), {
      method: "POST",
      headers,
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

