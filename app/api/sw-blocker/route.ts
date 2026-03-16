import { NextResponse } from "next/server"

const responseHeaders = {
  "Cache-Control": "no-store",
}

const blockerResponse = () =>
  NextResponse.json(
    {
      message: "Service workers are blocked on this host.",
      blocked: true,
    },
    {
      status: 200,
      headers: responseHeaders,
    },
  )

export function GET() {
  return blockerResponse()
}

export function HEAD() {
  return NextResponse.json(null, {
    status: 200,
    headers: responseHeaders,
  })
}
