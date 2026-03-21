const API_KEY = process.env.NEXT_PUBLIC_VALIDATION_KEY || "";

export type Json = Record<string, unknown>;

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  token?: string;
  headers?: Record<string, string>;
  allowErrorStatuses?: number[];
};

type ApiError = Error & { status?: number; data?: unknown };

export type PaymentLinkPayload = {
  name: string;
  email: string;
  contact: string;
};

let memoizedBase: string | undefined;

const logApi = (...args: unknown[]) => {
  if (typeof console !== "undefined") {
    console.info("[api]", ...args);
  }
};

if (!API_KEY) {
  logApi("NEXT_PUBLIC_VALIDATION_KEY is not set; /api/login requests may be rejected");
}

export function getApiBase(): string {
  if (memoizedBase !== undefined) {
    return memoizedBase;
  }
  
  const envBase = process.env.NEXT_PUBLIC_API_BASE || "";
  memoizedBase = sanitizeBase(resolveApiBase(envBase));
  
  if (!memoizedBase) {
    logApi("using same-origin relative /api routes");
  } else {
    logApi(`using configured API base: ${memoizedBase}`);
  }
  
  return memoizedBase;
}

function resolveApiBase(envBase: string): string {
  if (typeof window === "undefined") {
    return envBase;
  }

  const { hostname, port, protocol } = window.location;
  const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1";
  const localBackendBase = `${protocol}//${hostname}:7860`;

  if (isLocalHost) {
    if (!envBase) {
      return localBackendBase;
    }

    try {
      const parsed = new URL(envBase);
      if ((parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") && parsed.port === "3000") {
        return localBackendBase;
      }
      if (parsed.hostname === hostname && parsed.port === port) {
        return localBackendBase;
      }
    } catch {
      return localBackendBase;
    }
  }

  return envBase;
}

function sanitizeBase(base?: string): string {
  if (!base) return "";
  const trimmed = base.trim();
  if (!trimmed || trimmed === "/") {
    return "";
  }
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
}

function normalizeApiPath(path: string): string {
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  if (!path.startsWith("/api/") && path !== "/api") {
    path = `/api${path}`;
  }
  return path;
}

function buildApiUrl(path: string): string {
  const base = getApiBase();
  const normalizedPath = normalizeApiPath(path);
  return `${base}${normalizedPath}`;
}

function isBackendUnavailableMessage(message: string): boolean {
  return /your space is in error|service unavailable|temporarily unavailable/i.test(message);
}

function formatApiErrorMessage(status: number, data: unknown): string {
  if (typeof data === "string") {
    if (status === 503 || isBackendUnavailableMessage(data)) {
      return "Login service is temporarily unavailable. Please try again in a few moments.";
    }
    return data;
  }

  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if ("__html" in obj && typeof obj["__html"] === "string") {
      try {
        console.warn("Server returned HTML error page", obj["__html"]);
      } catch {}
      return status === 503
        ? "Login service is temporarily unavailable. Please try again in a few moments."
        : "Server error (received HTML). Please check your input or try again.";
    }
    if ("error" in obj && typeof obj["error"] === "string") {
      if (status === 503 || isBackendUnavailableMessage(obj["error"])) {
        return "Login service is temporarily unavailable. Please try again in a few moments.";
      }
      return obj["error"] as string;
    }
    if ("message" in obj && typeof obj["message"] === "string") {
      if (status === 503 || isBackendUnavailableMessage(obj["message"])) {
        return "Login service is temporarily unavailable. Please try again in a few moments.";
      }
      return obj["message"] as string;
    }
    try {
      return JSON.stringify(data);
    } catch {
      return `HTTP ${status}`;
    }
  }

  return status === 503
    ? "Login service is temporarily unavailable. Please try again in a few moments."
    : `HTTP ${status}`;
}

async function request<T = Json>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token, headers = {}, allowErrorStatuses = [] } = opts;
  const url = buildApiUrl(path);
  logApi(`${method} ${url || normalizeApiPath(path)}`);
  const normalizedToken = token?.trim();

  const init: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(normalizedToken ? { "X-CSRF-Token": normalizedToken } : {}),
      ...(normalizedToken ? { Authorization: `Bearer ${normalizedToken}` } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: typeof body === "string" ? body : JSON.stringify(body) } : {}),
  };

  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (error) {
    logApi("network error", error);
    throw new Error(
      `Network error while calling ${url || normalizeApiPath(path)}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  const data = await parseResponse(res);

  if (!res.ok && !allowErrorStatuses.includes(res.status)) {
    const message = formatApiErrorMessage(res.status, data);

    const err: ApiError = new Error(message) as ApiError;
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data as T;
}

async function parseResponse(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  const start = text.trim().slice(0, 1);
  if (start === "<") {
    return { __html: text };
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const api = {
  login: (params: { account: string; password: string; cdigest?: string; captcha?: string }) =>
    request<Json>("/api/login", {
      method: "POST",
      body: params,
      headers: API_KEY ? { Authorization: API_KEY } : {},
      allowErrorStatuses: [400, 403],
    }),
  logout: (token: string) => request<Json>("/api/logout", { method: "DELETE", token }),
  attendance: (token: string) => request<Json>("/api/attendance", { token }),
  marks: (token: string) => request<Json>("/api/marks", { token }),
  timetable: (token: string) => request<Json>("/api/timetable", { token }),
  courses: (token: string) => request<Json>("/api/courses", { token }),
  user: (token: string) => request<Json>("/api/profile", { token }),
  calendar: (token: string) => request<Json>("/api/calendar", { token }),
  get: (token: string) => request<Json>("/api/get", { token }),
  paymentLink: (token: string, payload: PaymentLinkPayload) =>
    request<Json>("/api/payment/link", { method: "POST", token, body: payload }),
};
