import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 500 }
      );
    }

    const sql = neon(dbUrl);
    const { searchParams } = new URL(req.url);
    const limitParam = parseInt(searchParams.get("limit") || "50", 10);
    const limit = Math.min(Math.max(limitParam, 1), 100);
    const unreadOnly = searchParams.get("unread") === "true";

    const rows = await sql`
      SELECT id, title, message, type, is_read, recipient_id, created_at, expires_at, action_url
      FROM dashboard_notifications
      WHERE (expires_at IS NULL OR expires_at > NOW())
        ${unreadOnly ? sql`AND is_read = false` : sql``}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    const countRows = await sql`
      SELECT count(*)::int as unread_count
      FROM dashboard_notifications
      WHERE is_read = false
        AND (expires_at IS NULL OR expires_at > NOW())
    `;

    const unreadCount = countRows[0]?.unread_count ?? 0;

    const notifications = rows.map((r: any) => ({
      id: String(r.id),
      title: r.title,
      message: r.message,
      type: r.type || "info",
      read: Boolean(r.is_read),
      is_read: Boolean(r.is_read),
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      recipientId: r.recipient_id,
      recipient_id: r.recipient_id,
      expiresAt: r.expires_at,
      actionUrl: r.action_url,
      action_url: r.action_url,
    }));

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
      total: notifications.length,
    });
  } catch (err: any) {
    console.error("GET /api/admin/notifications error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 500 });
    }

    const sql = neon(dbUrl);
    const body = await req.json().catch(() => ({}));
    const { title, message, type = "info", recipient_id = null, action_url = null, expires_at = null } = body;

    if (!title || !message) {
      return NextResponse.json({ success: false, error: "Title and message are required" }, { status: 400 });
    }

    const inserted = await sql`
      INSERT INTO dashboard_notifications (title, message, type, recipient_id, action_url, expires_at)
      VALUES (${title}, ${message}, ${type}, ${recipient_id}, ${action_url}, ${expires_at})
      RETURNING id, title, message, type, is_read, recipient_id, created_at, action_url
    `;

    const r = inserted[0];
    const notification = {
      id: String(r.id),
      title: r.title,
      message: r.message,
      type: r.type,
      read: Boolean(r.is_read),
      is_read: Boolean(r.is_read),
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      recipientId: r.recipient_id,
      actionUrl: r.action_url,
    };

    return NextResponse.json({ success: true, notification }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/admin/notifications error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 500 });
    }

    const sql = neon(dbUrl);
    const body = await req.json().catch(() => ({}));
    const { id, markAll, read = true } = body;

    if (markAll) {
      await sql`
        UPDATE dashboard_notifications
        SET is_read = true
        WHERE is_read = false
      `;
      return NextResponse.json({ success: true, message: "All notifications marked as read" });
    }

    if (id) {
      const numId = parseInt(String(id), 10);
      if (isNaN(numId)) {
        return NextResponse.json({ success: false, error: "Invalid notification ID" }, { status: 400 });
      }
      await sql`
        UPDATE dashboard_notifications
        SET is_read = ${Boolean(read)}
        WHERE id = ${numId}
      `;
      return NextResponse.json({ success: true, message: `Notification ${id} updated` });
    }

    return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
  } catch (err: any) {
    console.error("PATCH /api/admin/notifications error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 500 });
    }

    const sql = neon(dbUrl);
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");
    if (!idParam) {
      return NextResponse.json({ success: false, error: "Missing id parameter" }, { status: 400 });
    }
    const numId = parseInt(idParam, 10);
    if (isNaN(numId)) {
      return NextResponse.json({ success: false, error: "Invalid id parameter" }, { status: 400 });
    }

    await sql`
      DELETE FROM dashboard_notifications
      WHERE id = ${numId}
    `;

    return NextResponse.json({ success: true, message: `Notification ${idParam} deleted` });
  } catch (err: any) {
    console.error("DELETE /api/admin/notifications error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
