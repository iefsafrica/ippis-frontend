import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await request.formData();
  } catch {
    // ignore parsing errors
  }

  return NextResponse.json({
    success: true,
    message: "Documents received.",
  });
}
