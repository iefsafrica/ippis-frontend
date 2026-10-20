import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return handleMarkAll(req);
}

export async function PATCH(req: NextRequest) {
  return handleMarkAll(req);
}

export async function PUT(req: NextRequest) {
  return handleMarkAll(req);
}

async function handleMarkAll(req: NextRequest) {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 500 });
    }

    const sql = neon(dbUrl);
    await sql`
      UPDATE dashboard_notifications
      SET is_read = true
      WHERE is_read = false
    `;

    return NextResponse.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (err: any) {
    console.error("POST /api/admin/notifications/read error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to mark all as read" },
      { status: 500 }
    );
  }
}
