import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND_URL =
  process.env.BACKEND_SERVICE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://ippis-backend.onrender.com/api";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const cookie = req.headers.get("cookie") || "";

    const response = await fetch(`${BACKEND_URL}/admin/employees/self-service`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
        ...(cookie ? { Cookie: cookie } : {}),
      },
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("Proxy GET /api/admin/employees/self-service error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch self-service data", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const cookie = req.headers.get("cookie") || "";
    const body = await req.json().catch(() => ({}));

    const response = await fetch(`${BACKEND_URL}/admin/employees/self-service`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
        ...(cookie ? { Cookie: cookie } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("Proxy POST /api/admin/employees/self-service error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to perform self-service action", details: error.message },
      { status: 500 }
    );
  }
}
