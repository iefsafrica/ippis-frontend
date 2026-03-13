import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  await request.json().catch(() => ({}));
  return NextResponse.json({
    success: true,
    message: "Personal information saved.",
  });
}
