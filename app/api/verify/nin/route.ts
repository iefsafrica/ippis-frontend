import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const nin = typeof body?.nin === "string" ? body.nin : "";
  const isVerified = nin.length === 11 && !Number.isNaN(Number(nin));

  return NextResponse.json({
    success: true,
    message: isVerified
      ? "NIN validated successfully."
      : "NIN cannot be validated right now.",
    data: {
      nin,
      verified: isVerified,
    },
  });
}
