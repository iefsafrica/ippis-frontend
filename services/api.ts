import { NEXT_PUBLIC_API_BASE_URL } from "@/env";
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, 
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  const tempToken = Cookies.get("temp_token");

  const isLoginEndpoint = config.url?.endsWith("/login");
  const isOtpEndpoint = config.url?.endsWith("/verify-otp");

  if (tempToken && (isLoginEndpoint || isOtpEndpoint)) {
    config.headers.Authorization = `Bearer ${tempToken}`;
  } else if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      Cookies.remove("token");
  
      return Promise.reject(
        new Error("Unauthorized or session expired. Please log in again.")
      );
    }

    return Promise.reject(error);
  }
);

export default api;
