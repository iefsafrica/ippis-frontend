import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.BACKEND_SERVICE_URL ||
  process.env.BACKEND_API_BASE_URL ||
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://ippis-backend.onrender.com/api";
const TARGET_PATH = "/admin/documents/upload";

const buildTargetUrl = () => {
  const url = new URL(API_BASE_URL);
  url.pathname = `${url.pathname.replace(/\/$/, "")}${TARGET_PATH}`;
  return url.toString();
};

const forwardHeaders = (request: Request) => {
  const headers = new Headers();
  const authorization = request.headers.get("authorization");
  const registrationId = request.headers.get("x-registration-id");

  if (authorization) headers.set("authorization", authorization);
  if (registrationId) headers.set("x-registration-id", registrationId);
  headers.set("accept", "application/json");

  return headers;
};

const proxyRequest = async (request: Request) => {
  const targetUrl = buildTargetUrl();
  const headers = forwardHeaders(request);
  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const body = hasBody ? await request.body : undefined;

  const response = await fetch(targetUrl, {
    method: request.method,
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
};

export async function POST(request: Request) {
  return proxyRequest(request);
}
