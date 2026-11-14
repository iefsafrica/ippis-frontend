import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.BACKEND_SERVICE_URL ||
  process.env.BACKEND_API_BASE_URL ||
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://ippis-backend.onrender.com/api";
const TARGET_PATH = "/admin/employees/register/resume-link";

const buildTargetUrl = () => {
  const url = new URL(API_BASE_URL);
  url.pathname = `${url.pathname.replace(/\/$/, "")}${TARGET_PATH}`;
  return url.toString();
};

const forwardHeaders = (request: Request) => {
  const headers = new Headers();
  const authorization = request.headers.get("authorization");
  const contentType = request.headers.get("content-type");

  if (authorization) headers.set("authorization", authorization);
  if (contentType) headers.set("content-type", contentType);
  headers.set("accept", "application/json");

  return headers;
};

export async function POST(request: Request) {
  try {
    const targetUrl = buildTargetUrl();
    const headers = forwardHeaders(request);
    const body = await request.text();

    const response = await fetch(targetUrl, {
      method: "POST",
      headers,
      body,
      cache: "no-store",
    });

    const text = await response.text();
    const responseType = response.headers.get("content-type") || "application/json";

    return new NextResponse(text, {
      status: response.status,
      headers: {
        "content-type": responseType,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to process resume link request" },
      { status: 500 }
    );
  }
}
