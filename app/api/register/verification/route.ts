import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const nin = typeof body?.nin === "string" ? body.nin : "";

  return NextResponse.json({
    success: true,
    message: "Verification recorded. Continue to Personal Information.",
    bvnVerified: true,
    ninVerified: false,
    verified: false,
    nin,
  });
}
