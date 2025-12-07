/**
 * Simple HTTP client wrapper around fetch with:
 * - base URL support
 * - JSON request/response handling
 * - basic error handling
 *
 * This client is infrastructure-only and should not leak into domain/UI.
 */
export interface ApiErrorPayload {
    message?: string;
    statusCode?: number;
    errors?: Record<string, string[]>;
    [key: string]: unknown;
}

export class ApiError extends Error {
    public readonly status: number;
    public readonly payload?: ApiErrorPayload;

    constructor(message: string, status: number, payload?: ApiErrorPayload) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.payload = payload;

        Object.setPrototypeOf(this, ApiError.prototype);
    }
}

export interface ApiClientConfig {
    baseUrl: string;
    /**
     * Optional default headers applied to every request.
     */
    defaultHeaders?: Record<string, string>;
}

export type ResponseFormat = 'json' | 'blob' | 'text';

export interface RequestOptions {
    headers?: Record<string, string>;
    /**
     * If true, the client will not send a body (useful for 204 responses).
     */
    skipParseJson?: boolean;
    /**
     * Format of the expected response. Defaults to 'json'.
     */
    format?: ResponseFormat;
}

export class ApiClient {
    private readonly baseUrl: string;
    private readonly defaultHeaders: Record<string, string>;

    constructor(config: ApiClientConfig) {
        this.baseUrl = config.baseUrl.replace(/\/+$/, "");
        this.defaultHeaders = config.defaultHeaders ?? {};
    }

    async get<T>(path: string, options?: RequestOptions): Promise<T> {
        return this.request<T>("GET", path, undefined, options);
    }

    async post<T>(
        path: string,
        body?: unknown,
        options?: RequestOptions
    ): Promise<T> {
        return this.request<T>("POST", path, body, options);
    }

    async patch<T>(
        path: string,
        body?: unknown,
        options?: RequestOptions
    ): Promise<T> {
        return this.request<T>("PATCH", path, body, options);
    }

    async delete<T>(
        path: string,
        body?: unknown,
        options?: RequestOptions
    ): Promise<T> {
        return this.request<T>("DELETE", path, body, options);
    }

    private async request<T>(
        method: "GET" | "POST" | "PATCH" | "DELETE",
        path: string,
        body?: unknown,
        options?: RequestOptions
    ): Promise<T> {
        const url = `${this.baseUrl}${path}`;

        const headers: Record<string, string> = {
            ...this.defaultHeaders,
            ...(options?.headers ?? {}),
        };

        const init: RequestInit = {
            method,
            headers,
        };

        if (body !== undefined) {
            if (body instanceof FormData) {
                // Do not set Content-Type for FormData; the browser sets it with the boundary
                init.body = body;
            } else {
                headers["Content-Type"] = "application/json";
                init.body = JSON.stringify(body);
            }
        }

        const response = await fetch(url, init);

        if (!response.ok) {
            let payload: ApiErrorPayload | undefined;

            try {
                // Try parsing error as JSON even if we expected a blob
                payload = (await response.json()) as ApiErrorPayload;
            } catch {
                // ignore json parse error
            }

            const message =
                payload?.message ??
                `Request failed with status ${response.status} (${response.statusText})`;

            throw new ApiError(message, response.status, payload);
        }

        if (options?.skipParseJson || response.status === 204) {
            return undefined as unknown as T;
        }

        // Handle specific formats
        const format = options?.format ?? 'json';

        if (format === 'blob') {
            return (await response.blob()) as unknown as T;
        }

        if (format === 'text') {
            return (await response.text()) as unknown as T;
        }

        // Default: JSON
        const text = await response.text();
        if (!text) {
            return undefined as unknown as T;
        }

        try {
            return JSON.parse(text) as T;
        } catch {
            // Fallback if response is text/plain but generic <T> was expected
            return text as unknown as T;
        }
    }
}