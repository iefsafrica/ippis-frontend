import { NextRequest, NextResponse } from "next/server";
import { verifyNIN } from "@/lib/verification-service";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const nin = typeof body?.nin === "string" ? body.nin : "";
  const result = await verifyNIN(nin);

  return NextResponse.json({
    success: result.verified,
    message: result.message,
    status: result.status,
    error: result.error,
    verified: result.verified,
    data: {
      nin,
      verified: result.verified,
      ...(result.data ?? {}),
    },
  });
}
