const API_BASE = import.meta.env.VITE_API_BASE ?? ''
const AUTH_KEY = 'codex_admin_basic'

export function getAdminAuthHeader(): string | null {
  return sessionStorage.getItem(AUTH_KEY)
}

export function setAdminCredentials(user: string, password: string): void {
  const token = btoa(`${user}:${password}`)
  sessionStorage.setItem(AUTH_KEY, `Basic ${token}`)
}

export function clearAdminCredentials(): void {
  sessionStorage.removeItem(AUTH_KEY)
}

export function hasAdminCredentials(): boolean {
  return Boolean(sessionStorage.getItem(AUTH_KEY))
}

async function request<T>(path: string, init?: RequestInit, withAdmin = false): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(init?.body && !(init.body instanceof FormData)
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...(init?.headers as Record<string, string> | undefined),
  }
  if (withAdmin) {
    const auth = getAdminAuthHeader()
    if (auth) headers.Authorization = auth
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(detail || `HTTP ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path: string) => request<void>(path, { method: 'DELETE' }),
  adminGet: <T>(path: string) => request<T>(path, undefined, true),
  adminPost: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }, true),
  adminPut: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }, true),
  adminDelete: (path: string) => request<void>(path, { method: 'DELETE' }, true),
  adminUpload: async (category: string, file: File): Promise<{ url: string }> => {
    const body = new FormData()
    body.append('category', category)
    body.append('file', file)
    return request<{ url: string }>(
      '/api/admin/uploads',
      { method: 'POST', body },
      true,
    )
  },
}
