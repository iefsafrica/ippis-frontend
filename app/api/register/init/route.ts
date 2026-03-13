import { NextRequest, NextResponse } from "next/server";

const randomRegistrationId = () =>
  `IPPIS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

export async function POST(_: NextRequest) {
  return NextResponse.json({
    success: true,
    message: "Registration initialized",
    registrationId: randomRegistrationId(),
  });
}
