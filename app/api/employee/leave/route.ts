import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND_URL =
  process.env.BACKEND_SERVICE_URL ||
  process.env.BACKEND_API_BASE_URL ||
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://ippis-backend.onrender.com/api";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const authHeader = req.headers.get("authorization") || "";
  const cookie = req.headers.get("cookie") || "";

  try {
    const backendRes = await fetch(
      `${BACKEND_URL}/employee/leave?${searchParams.toString()}`,
      {
        headers: {
          "Content-Type": "application/json",
          ...(authHeader ? { Authorization: authHeader } : {}),
          ...(cookie ? { Cookie: cookie } : {}),
        },
        cache: "no-store",
      }
    );

    if (backendRes.ok) {
      const json = await backendRes.json().catch(() => null);
      if (json && (Array.isArray(json.data) || Array.isArray(json))) {
        let list = Array.isArray(json.data) ? json.data : json;
        if (status) {
          list = list.filter((item: any) => String(item.status).toLowerCase() === status.toLowerCase());
        }
        return NextResponse.json({ success: true, data: list });
      }
    }
  } catch (err) {
    console.error("Error proxying /api/employee/leave GET:", err);
  }

  // Graceful fallback for employee's own requests
  return NextResponse.json({
    success: true,
    data: [],
    message: "No leave records found",
  });
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const cookie = req.headers.get("cookie") || "";

  try {
    const body = await req.json().catch(() => ({}));

    const backendRes = await fetch(`${BACKEND_URL}/employee/leave`, {
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
        json || { success: false, message: "Failed to apply for leave" },
        { status: backendRes.status }
      );
    }

    return NextResponse.json(json || { success: true, message: "Leave applied successfully" });
  } catch (err: any) {
    console.error("Error applying for leave:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to submit leave application" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, message: "Leave ID is required" }, { status: 400 });
  }

  const authHeader = req.headers.get("authorization") || "";
  const cookie = req.headers.get("cookie") || "";

  try {
    const backendRes = await fetch(`${BACKEND_URL}/employee/leave?id=${encodeURIComponent(id)}`, {
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
        json || { success: false, message: "Failed to cancel leave request" },
        { status: backendRes.status }
      );
    }

    return NextResponse.json(json || { success: true, message: "Leave request cancelled successfully" });
  } catch (err: any) {
    console.error("Error cancelling leave:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to cancel leave" },
      { status: 500 }
    );
  }
}

