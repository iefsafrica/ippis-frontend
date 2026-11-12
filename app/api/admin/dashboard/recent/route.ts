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
  const type = searchParams.get("type") || "recent";

  const authHeader = req.headers.get("authorization") || "";
  const cookie = req.headers.get("cookie") || "";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(authHeader ? { Authorization: authHeader } : {}),
    ...(cookie ? { Cookie: cookie } : {}),
  };

  try {
    const backendRes = await fetch(
      `${BACKEND_URL}/admin/dashboard/recent?type=${encodeURIComponent(type)}`,
      { headers, cache: "no-store" }
    );

    if (backendRes.ok) {
      const json = await backendRes.json().catch(() => null);
      if (json && (Array.isArray(json.data) || Array.isArray(json))) {
        return NextResponse.json(json.data ? json : { success: true, data: json });
      }
    }
  } catch (err) {
    console.error("Error proxying /admin/dashboard/recent:", err);
  }

  // Live fallback: query latest real employees from backend
  try {
    const empRes = await fetch(`${BACKEND_URL}/admin/employees?page=1&limit=10`, {
      headers,
      cache: "no-store",
    });

    if (empRes.ok) {
      const json = await empRes.json().catch(() => null);
      const employees = json?.data?.employees || json?.employees || [];

      if (Array.isArray(employees) && employees.length > 0) {
        const activities = employees.slice(0, 8).map((emp: any, index: number) => ({
          id: emp.id ? String(emp.id) : `ACT-${index + 1}`,
          name: `${emp.name || "Personnel"} enrolled in Nominal Roll (${emp.department || "Civil Service"})`,
          type: emp.status === "active" ? "Verification Completed" : "Enrolment Pending",
          created_at: emp.created_at || emp.createdAt || new Date().toISOString(),
        }));

        return NextResponse.json({
          success: true,
          data: activities,
        });
      }
    }
  } catch (err) {
    console.error("Error generating recent activities from employees:", err);
  }

  return NextResponse.json({
    success: true,
    data: [],
  });
}
