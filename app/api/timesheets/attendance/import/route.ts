"use server"

import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json({
    success: true,
    message: "Mock import received",
    data: {},
  })
}
