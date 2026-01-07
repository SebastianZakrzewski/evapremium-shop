/**
 * Shared API Client
 * 
 * Provides common fetch functionality with error handling, retry logic, and caching.
 */

export interface ApiClientOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  cache?: RequestCache;
  retries?: number;
  retryDelay?: number;
  timeout?: number;
}

export interface ApiClientResponse<T> {
  data: T;
  status: number;
  ok: boolean;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Default API client with error handling and retry logic
 */
export async function apiClient<T>(
  url: string,
  options: ApiClientOptions = {}
): Promise<ApiClientResponse<T>> {
  const {
    method = 'GET',
    headers = {},
    body,
    cache = 'no-store',
    retries = 2,
    retryDelay = 1000,
    timeout = 30000,
  } = options;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const fetchOptions: RequestInit = {
        method,
        headers: defaultHeaders,
        cache,
        signal: controller.signal,
      };

      if (body && method !== 'GET') {
        fetchOptions.body = JSON.stringify(body);
      }

      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.error || `HTTP error! status: ${response.status}`,
          response.status,
          data
        );
      }

      return {
        data,
        status: response.status,
        ok: response.ok,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on abort or client errors (4xx)
      if (
        error instanceof ApiError &&
        (error.status >= 400 && error.status < 500)
      ) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        continue;
      }
    }
  }

  throw lastError || new Error('Unknown error occurred');
}

/**
 * GET request helper
 */
export async function apiGet<T>(
  url: string,
  options?: Omit<ApiClientOptions, 'method' | 'body'>
): Promise<T> {
  const response = await apiClient<T>(url, { ...options, method: 'GET' });
  return response.data;
}

/**
 * POST request helper
 */
export async function apiPost<T>(
  url: string,
  body?: unknown,
  options?: Omit<ApiClientOptions, 'method' | 'body'>
): Promise<T> {
  const response = await apiClient<T>(url, {
    ...options,
    method: 'POST',
    body,
  });
  return response.data;
}

/**
 * PUT request helper
 */
export async function apiPut<T>(
  url: string,
  body?: unknown,
  options?: Omit<ApiClientOptions, 'method' | 'body'>
): Promise<T> {
  const response = await apiClient<T>(url, {
    ...options,
    method: 'PUT',
    body,
  });
  return response.data;
}

/**
 * DELETE request helper
 */
export async function apiDelete<T>(
  url: string,
  options?: Omit<ApiClientOptions, 'method' | 'body'>
): Promise<T> {
  const response = await apiClient<T>(url, {
    ...options,
    method: 'DELETE',
  });
  return response.data;
}


















