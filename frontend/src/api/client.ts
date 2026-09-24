import { parseApiError } from './parseApiError'
import { campaignAdminPrefix } from './campaignSlug'

const API_BASE = import.meta.env.VITE_API_BASE ?? ''

async function request<T>(path: string, init?: RequestInit, withCredentials = false): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(init?.body && !(init.body instanceof FormData)
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...(init?.headers as Record<string, string> | undefined),
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    credentials: withCredentials ? 'include' : (init?.credentials ?? 'same-origin'),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw parseApiError(detail, response.status)
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
  adminPatch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }, true),
  adminDelete: (path: string) => request<void>(path, { method: 'DELETE' }, true),
  adminUpload: async (
    category: string,
    file: File,
  ): Promise<{
    url: string
    aviso_cota?: boolean
    bytes_usados?: number
    cota_bytes?: number
  }> => {
    const body = new FormData()
    body.append('category', category)
    body.append('file', file)
    return request(
      `${campaignAdminPrefix()}/uploads`,
      { method: 'POST', body },
      true,
    )
  },
}

export const authApi = {
  login: (email: string, password: string) =>
    request<{ email: string }>(
      '/api/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) },
      true,
    ),
  logout: () =>
    request<void>('/api/auth/logout', { method: 'POST' }, true),
  me: () => request<{ email: string; id: number }>('/api/auth/me', undefined, true),
  aceitarConvite: (token: string, password: string) =>
    request<{ email: string }>(
      '/api/auth/convite/aceitar',
      { method: 'POST', body: JSON.stringify({ token, password }) },
      true,
    ),
  confirmarReset: (token: string, password: string) =>
    request<{ email: string }>(
      '/api/auth/reset/confirmar',
      { method: 'POST', body: JSON.stringify({ token, password }) },
      true,
    ),
}
