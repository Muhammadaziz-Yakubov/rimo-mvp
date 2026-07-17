import axios, { AxiosRequestConfig } from "axios";
import { toast } from "react-hot-toast";
import { useApiLogStore } from "../store/api-log.store";

// Use environment variable or default to local NestJS gateway port
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Send HttpOnly cookies to NestJS
});

// Interceptor for request logging
apiClient.interceptors.request.use(
  (config) => {
    // Add start time to calculate duration later
    (config as any).metadata = { startTime: new Date() };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor for response logging and error handling
apiClient.interceptors.response.use(
  (response) => {
    const config = response.config;
    const metadata = (config as any).metadata;
    const duration = metadata ? new Date().getTime() - metadata.startTime.getTime() : 0;

    // Log request in the api log store
    useApiLogStore.getState().addLog({
      id: Math.random().toString(36).substring(7),
      workspaceId: "current-workspace",
      method: config.method?.toUpperCase() || "GET",
      endpoint: config.url || "",
      duration,
      statusCode: response.status,
      requestPayload: config.data ? JSON.stringify(config.data) : undefined,
      responsePayload: response.data ? JSON.stringify(response.data) : undefined,
      createdAt: new Date().toISOString(),
    });

    return response;
  },
  (error) => {
    const response = error.response;
    const config = error.config;
    const metadata = config ? (config as any).metadata : null;
    const duration = metadata ? new Date().getTime() - metadata.startTime.getTime() : 0;

    if (config) {
      // Log failed request
      useApiLogStore.getState().addLog({
        id: Math.random().toString(36).substring(7),
        workspaceId: "current-workspace",
        method: config.method?.toUpperCase() || "GET",
        endpoint: config.url || "",
        duration,
        statusCode: response ? response.status : 0,
        requestPayload: config.data ? JSON.stringify(config.data) : undefined,
        responsePayload: response ? JSON.stringify(response.data) : error.message,
        createdAt: new Date().toISOString(),
      });
    }

    // Process errors
    const responseData = response?.data;
    const errorMessage = responseData?.reason || 
      (typeof responseData?.message === "object" ? responseData.message?.reason || responseData.message?.message : responseData?.message) || 
      "An unexpected error occurred.";
    
    if (response) {
      if (response.status === 401) {
        const isLoginRequest = config?.url?.includes("/auth/login");
        if (isLoginRequest) {
          // Show specific error message for failed login attempts
          toast.error(errorMessage);
        } else {
          // Any other 401 = session expired/invalid → redirect to login
          // The pathname check prevents redirect loops on the login page itself
          if (typeof window !== "undefined" && !window.location.pathname.includes("connect-government")) {
            window.location.href = "/connect-government";
          }
        }
      } else if (response.status === 403) {
        toast.error("Permission denied. You don't have access to this action.");
      } else if (response.status === 502 || response.status === 503 || response.status === 504) {
        toast.error("Government server is currently unresponsive. Showing local fallback data.");
      } else {
        toast.error(errorMessage);
      }
    } else {
      toast.error("Unable to connect to the server. Please check your internet connection.");
    }

    return Promise.reject(error);
  }
);
