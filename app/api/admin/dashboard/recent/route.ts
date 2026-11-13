import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND_URL =
  process.env.BACKEND_SERVICE_URL ||
  process.env.BACKEND_API_BASE_URL ||
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://ippis-backend.onrender.com/api";

function extractActivityList(json: any): any[] | null {
  if (!json) return null;
  if (Array.isArray(json)) return json;
  if (Array.isArray(json.data)) return json.data;
  if (Array.isArray(json.data?.activities)) return json.data.activities;
  if (Array.isArray(json.data?.recent)) return json.data.recent;
  if (Array.isArray(json.data?.items)) return json.data.items;
  if (Array.isArray(json.activities)) return json.activities;
  if (Array.isArray(json.recent)) return json.recent;
  return null;
}

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
      const list = extractActivityList(json);
      if (list && list.length > 0) {
        return NextResponse.json({ success: true, data: list });
      }
    }
  } catch (err) {
    console.error("Error proxying /admin/dashboard/recent:", err);
  }

  // Live fallback: query latest real employees from backend
  try {
    const empUrl =
      type === "pending"
        ? `${BACKEND_URL}/admin/employees?status=pending&page=1&limit=20`
        : `${BACKEND_URL}/admin/employees?page=1&limit=20`;

    const empRes = await fetch(empUrl, {
      headers,
      cache: "no-store",
    });

    if (empRes.ok) {
      const json = await empRes.json().catch(() => null);
      const rawEmployees =
        json?.data?.employees || json?.employees || json?.data || [];

      if (Array.isArray(rawEmployees) && rawEmployees.length > 0) {
        const filtered =
          type === "pending"
            ? rawEmployees.filter(
                (emp: any) =>
                  String(emp.status || "").toLowerCase() === "pending"
              )
            : rawEmployees;

        const sorted = [...filtered].sort((a: any, b: any) => {
          const da = new Date(
            a.updated_at || a.created_at || a.createdAt || a.join_date || 0
          ).getTime();
          const db = new Date(
            b.updated_at || b.created_at || b.createdAt || b.join_date || 0
          ).getTime();
          return db - da;
        });

        const activities = sorted.slice(0, 8).map((emp: any, index: number) => {
          const isActive =
            String(emp.status || "").toLowerCase() === "active";
          return {
            id: emp.id ? String(emp.id) : `ACT-${index + 1}`,
            name: `${emp.name || "Personnel"} enrolled in Nominal Roll (${emp.department || "Civil Service"})`,
            type: isActive ? "Verification Completed" : "Enrolment Pending",
            created_at:
              emp.updated_at ||
              emp.created_at ||
              emp.createdAt ||
              emp.join_date ||
              new Date().toISOString(),
          };
        });

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
