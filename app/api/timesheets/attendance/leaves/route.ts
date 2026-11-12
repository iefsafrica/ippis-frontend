import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND_URL =
  process.env.BACKEND_SERVICE_URL ||
  process.env.BACKEND_API_BASE_URL ||
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://ippis-backend.onrender.com/api";

const TARGET_ENDPOINT = "/timesheets/attendance/leaves";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const authHeader = req.headers.get("authorization") || "";
  const cookie = req.headers.get("cookie") || "";

  try {
    const query = searchParams.toString();
    const targetUrl = `${BACKEND_URL}${TARGET_ENDPOINT}${query ? `?${query}` : ""}`;

    const backendRes = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
        ...(cookie ? { Cookie: cookie } : {}),
      },
      cache: "no-store",
    });

    const json = await backendRes.json().catch(() => null);

    if (!backendRes.ok) {
      return NextResponse.json(
        json || { success: false, message: "Failed to fetch leave requests" },
        { status: backendRes.status }
      );
    }

    return NextResponse.json(json);
  } catch (err: any) {
    console.error("Error proxying GET /timesheets/attendance/leaves:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch leaves" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const cookie = req.headers.get("cookie") || "";

  try {
    const body = await req.json().catch(() => ({}));

    const backendRes = await fetch(`${BACKEND_URL}${TARGET_ENDPOINT}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
        ...(cookie ? { Cookie: cookie } : {}),
      },
      body: JSON.stringify(body),
    });

    const json = await backendRes.json().catch(() => null);

    if (!backendRes.ok) {
      return NextResponse.json(
        json || { success: false, message: "Failed to update leave status" },
        { status: backendRes.status }
      );
    }

    return NextResponse.json(json || { success: true, message: "Leave updated successfully" });
  } catch (err: any) {
    console.error("Error proxying PUT /timesheets/attendance/leaves:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to update leave" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const cookie = req.headers.get("cookie") || "";

  try {
    const body = await req.json().catch(() => ({}));

    const backendRes = await fetch(`${BACKEND_URL}${TARGET_ENDPOINT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
        ...(cookie ? { Cookie: cookie } : {}),
      },
      body: JSON.stringify(body),
    });

    const json = await backendRes.json().catch(() => null);

    if (!backendRes.ok) {
      return NextResponse.json(
        json || { success: false, message: "Failed to create leave" },
        { status: backendRes.status }
      );
    }

    return NextResponse.json(json || { success: true, message: "Leave created successfully" });
  } catch (err: any) {
    console.error("Error proxying POST /timesheets/attendance/leaves:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to create leave" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const authHeader = req.headers.get("authorization") || "";
  const cookie = req.headers.get("cookie") || "";

  try {
    const targetUrl = `${BACKEND_URL}${TARGET_ENDPOINT}${id ? `?id=${encodeURIComponent(id)}` : ""}`;

    const backendRes = await fetch(targetUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
        ...(cookie ? { Cookie: cookie } : {}),
      },
    });

    const json = await backendRes.json().catch(() => null);

    if (!backendRes.ok) {
      return NextResponse.json(
        json || { success: false, message: "Failed to delete leave" },
        { status: backendRes.status }
      );
    }

    return NextResponse.json(json || { success: true, message: "Leave deleted successfully" });
  } catch (err: any) {
    console.error("Error proxying DELETE /timesheets/attendance/leaves:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to delete leave" },
      { status: 500 }
    );
  }
}
