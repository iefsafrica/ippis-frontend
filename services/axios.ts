import axios, { AxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

const normalizeBaseUrl = (value?: string | null) => {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  const withoutTrailingSlash = trimmed.replace(/\/+$/, "");
  return withoutTrailingSlash.endsWith("/api") ? withoutTrailingSlash : `${withoutTrailingSlash}/api`;
};

const resolveBaseUrl = () => {
  // Prefer the public API base URL when explicitly configured.
  const envUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);
  if (envUrl) {
    return envUrl;
  }

  // Fallback to the internal backend service URL (e.g., set on Vercel).
  const fallbackUrl = normalizeBaseUrl(process.env.BACKEND_SERVICE_URL);
  if (fallbackUrl) {
    return fallbackUrl;
  }

  // Final fallback for local development.
  return "https://ippis-backend.onrender.com/api";
};

const baseUrl = resolveBaseUrl();

const api = axios.create({
  baseURL: baseUrl,
  withCredentials: !!baseUrl,
});

api.interceptors.request.use(
  (config) => {
    const cookieToken = Cookies.get("token") || Cookies.get("ippis_token");
    const storedToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const token = cookieToken || storedToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", {
      status: error.response?.status,
      payload: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

export const get = async <T>(url: string, params?: object): Promise<T> => {
  const response = await api.get(url, { params });
  return response.data as T;
};

export const post = async <T>(
  url: string,
  data?: object,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await api.post(url, data, config);
  return response.data as T;
};

export const put = async <T>(
  url: string,
  data?: object,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await api.put(url, data, config);
  return response.data as T;
};

export const patch = async <T>(
  url: string,
  data?: object,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await api.patch(url, data, config);
  return response.data as T;
};

export const del = async <T>(url: string, params?: object): Promise<T> => {
  const response = await api.delete(url, { params });
  return response.data as T;
};

export const delWithBody = async <T>(
  url: string,
  data?: object,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await api.delete(url, { data, ...config });
  return response.data as T;
};

export default api;
