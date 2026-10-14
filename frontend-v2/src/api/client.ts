const API_BASE = import.meta.env["VITE_API_BASE"] ?? "";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly codigo: string | null,
    readonly detalhes: Record<string, unknown> = {},
  ) {
    super(codigo ?? `HTTP ${status}`);
    this.name = "ApiError";
  }
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(init.body && !(init.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...init.headers,
    },
  });
  if (!response.ok) {
    if (response.status === 401 && path !== "/api/auth/login" && path !== "/api/auth/me") {
      window.dispatchEvent(new Event("codex:auth-expired"));
    }
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
    const detail =
      payload && typeof payload === "object" && "detail" in payload ? payload.detail : payload;
    if (
      detail &&
      typeof detail === "object" &&
      "erro" in detail &&
      typeof detail.erro === "string"
    ) {
      throw new ApiError(
        response.status,
        detail.erro,
        "detalhes" in detail && detail.detalhes && typeof detail.detalhes === "object"
          ? (detail.detalhes as Record<string, unknown>)
          : {},
      );
    }
    throw new ApiError(response.status, typeof detail === "string" ? detail : null);
  }
  return response.status === 204 ? (undefined as T) : (response.json() as Promise<T>);
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path: string) => request<void>(path, { method: "DELETE" }),
  upload: <T>(path: string, body: FormData) => request<T>(path, { method: "POST", body }),
};

export function campaignPath(slug: string, path: string) {
  return `/api/c/${encodeURIComponent(slug)}/${path.replace(/^\//, "")}`;
}
