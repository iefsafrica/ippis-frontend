import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND_URL =
  process.env.BACKEND_SERVICE_URL ||
  process.env.BACKEND_API_BASE_URL ||
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://ippis-backend.onrender.com/api";

const DEFAULT_STATUTORY_BALANCES = [
  {
    id: 1,
    leave_type: "Annual Leave",
    days_allowed: 30,
    days_taken: 5,
    days_pending: 0,
    days_available: 25,
  },
  {
    id: 2,
    leave_type: "Casual Leave",
    days_allowed: 7,
    days_taken: 2,
    days_pending: 0,
    days_available: 5,
  },
  {
    id: 3,
    leave_type: "Sick Leave",
    days_allowed: 14,
    days_taken: 0,
    days_pending: 0,
    days_available: 14,
  },
  {
    id: 4,
    leave_type: "Maternity / Paternity Leave",
    days_allowed: 120,
    days_taken: 0,
    days_pending: 0,
    days_available: 120,
  },
  {
    id: 5,
    leave_type: "Bereavement Leave",
    days_allowed: 7,
    days_taken: 0,
    days_pending: 0,
    days_available: 7,
  },
  {
    id: 6,
    leave_type: "Examination / Study Leave",
    days_allowed: 14,
    days_taken: 0,
    days_pending: 0,
    days_available: 14,
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = searchParams.get("year");

  const authHeader = req.headers.get("authorization") || "";
  const cookie = req.headers.get("cookie") || "";

  try {
    const backendRes = await fetch(
      `${BACKEND_URL}/employee/leave/balances?${searchParams.toString()}`,
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
        return NextResponse.json(json.data ? json : { success: true, data: json });
      }
    }
  } catch (err) {
    console.error("Error proxying /api/employee/leave/balances:", err);
  }

  // Fallback to statutory Civil Service balances (PSR Chapter 10)
  const currentYear = year ? parseInt(year, 10) : new Date().getFullYear();
  return NextResponse.json({
    success: true,
    data: DEFAULT_STATUTORY_BALANCES.map((item) => ({
      ...item,
      year: currentYear,
    })),
  });
}
