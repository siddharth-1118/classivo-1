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
  const envBase = sanitizeBase(process.env.NEXT_PUBLIC_URL ?? process.env.NEXT_PUBLIC_API_BASE);
  if (envBase) {
    memoizedBase = envBase;
    logApi(`using configured API base: ${memoizedBase}`);
    return memoizedBase;
  }
  memoizedBase = "";
  logApi("NEXT_PUBLIC_URL not set; defaulting to same-origin relative /api routes");
  return memoizedBase;
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
  if (path.startsWith("/api")) {
    return path;
  }
  return `/api${path}`;
}

function buildApiUrl(path: string): string {
  const base = getApiBase();
  const normalizedPath = normalizeApiPath(path);
  return `${base}${normalizedPath}`;
}

async function request<T = Json>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token, headers = {}, allowErrorStatuses = [] } = opts;
  const url = buildApiUrl(path);
  logApi(`${method} ${url || normalizeApiPath(path)}`);

  const init: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "X-CSRF-Token": token } : {}),
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
    let message = `HTTP ${res.status}`;
    if (typeof data === "string") {
      message = data;
    } else if (data && typeof data === "object") {
      // type-safe checks (avoid 'any')
      const obj = data as Record<string, unknown>;
      if ("__html" in obj && typeof obj["__html"] === "string") {
        try {
          console.warn("Server returned HTML error page for", url || normalizeApiPath(path), obj["__html"]);
        } catch {}
        message = "Server error (received HTML). Please check your input or try again.";
      } else if ("error" in obj && typeof obj["error"] === "string") {
        message = obj["error"] as string;
      } else {
        try {
          message = JSON.stringify(data);
        } catch {
          message = `HTTP ${res.status}`;
        }
      }
    }

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
    request<Json>("/login", {
      method: "POST",
      body: params,
      headers: API_KEY ? { Authorization: API_KEY } : {},
      allowErrorStatuses: [400, 403],
    }),
  logout: (token: string) => request<Json>("/logout", { method: "DELETE", token }),
  attendance: (token: string) => request<Json>("/attendance", { token }),
  marks: (token: string) => request<Json>("/marks", { token }),
  timetable: (token: string) => request<Json>("/timetable", { token }),
  courses: (token: string) => request<Json>("/courses", { token }),
  user: (token: string) => request<Json>("/user", { token }),
  calendar: (token: string) => request<Json>("/calendar", { token }),
  get: (token: string) => request<Json>("/get", { token }),
  paymentLink: (token: string, payload: PaymentLinkPayload) =>
    request<Json>("/payment/link", { method: "POST", token, body: payload }),
};
