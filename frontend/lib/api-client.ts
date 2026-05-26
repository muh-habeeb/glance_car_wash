/* eslint-disable @typescript-eslint/no-explicit-any */
import { env } from "../utils/env";

const BASE_URL = env.NEXT_PUBLIC_SERVER_URL.endsWith("/")
  ? env.NEXT_PUBLIC_SERVER_URL.slice(0, -1)
  : env.NEXT_PUBLIC_SERVER_URL;

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

class ApiClientError extends Error {
  status: number;
  info: any;

  constructor(message: string, status: number, info: any) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.info = info;
  }
}

/**
 * Robust fetch wrapper client.
 * Enforces security by including credentials (cookies) in requests automatically.
 */
async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...restOptions } = options;

  // 1. Build secure URL with parameters
  let url = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  // 2. Set default secure headers
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const config: RequestInit = {
    ...restOptions,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    // CRITICAL SECURITY FEATURE: Send cookies with cross-site and same-site requests
    credentials: "include",
  };

  try {
    const response = await fetch(url, config);

    // Parse response
    let data: any = null;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      throw new ApiClientError(
        data?.message || `Request failed with status ${response.status}`,
        response.status,
        data
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    // Network errors or parsing errors
    throw new ApiClientError(
      error instanceof Error ? error.message : "Network request failed",
      500,
      null
    );
  }
}

export const apiClient = {
  get<T>(endpoint: string, options?: Omit<RequestOptions, "body" | "method">) {
    return request<T>(endpoint, { ...options, method: "GET" });
  },

  post<T>(endpoint: string, body?: any, options?: Omit<RequestOptions, "body" | "method">) {
    return request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put<T>(endpoint: string, body?: any, options?: Omit<RequestOptions, "body" | "method">) {
    return request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  patch<T>(endpoint: string, body?: any, options?: Omit<RequestOptions, "body" | "method">) {
    return request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(endpoint: string, options?: Omit<RequestOptions, "body" | "method">) {
    return request<T>(endpoint, { ...options, method: "DELETE" });
  },
};
