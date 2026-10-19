const resolveApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (envUrl) {
    return envUrl;
  }

  const fallbackUrl = process.env.BACKEND_SERVICE_URL?.trim();
  if (fallbackUrl) {
    return fallbackUrl;
  }

  return "https://ippis-backend.onrender.com/api";
};

export const NEXT_PUBLIC_API_BASE_URL = resolveApiBaseUrl();
export const NEXT_PUBLIC_API_ENVIRONMENT =
  process.env.NEXT_PUBLIC_API_ENVIRONMENT;
