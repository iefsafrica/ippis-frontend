const resolveApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (envUrl) {
    return envUrl;
  }

  const fallbackUrl = process.env.BACKEND_SERVICE_URL?.trim();
  if (fallbackUrl) {
    return fallbackUrl;
  }

  if (
    process.env.NODE_ENV === "development" ||
    (typeof window !== "undefined" &&
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"))
  ) {
    return "http://localhost:8000/api";
  }

  return "https://ippis-backend.onrender.com/api";
};

export const NEXT_PUBLIC_API_BASE_URL = resolveApiBaseUrl();
export const NEXT_PUBLIC_API_ENVIRONMENT =
  process.env.NEXT_PUBLIC_API_ENVIRONMENT;
