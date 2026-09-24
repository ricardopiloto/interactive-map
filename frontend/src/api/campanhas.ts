import { parseApiError } from './parseApiError'
import type { GenreId } from '../theme/genres'

const API_BASE = import.meta.env.VITE_API_BASE ?? ''

export type CatalogoItem = {
  slug: string
  nome: string
  sistema: string
  genero: GenreId | string
  capa_url?: string | null
}
export type PainelItem = {
  slug: string
  nome: string
  sistema: string
  visibilidade: 'listada' | 'so_link' | string
  unidade_distancia?: 'mi' | 'km' | string
  genero: GenreId | string
  capa_url?: string | null
  bytes_usados: number
  cota_bytes: number
  aviso_cota: boolean
}

async function req<T>(path: string, init?: RequestInit, credentials = false): Promise<T> {
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
    credentials: credentials ? 'include' : (init?.credentials ?? 'same-origin'),
  })
  if (!response.ok) {
    throw parseApiError(await response.text(), response.status)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const campanhasApi = {
  catalogo: () => req<{ campanhas: CatalogoItem[] }>('/api/campanhas/catalogo'),
  minhas: () =>
    req<{ campanhas: PainelItem[] }>('/api/campanhas/minhas', undefined, true),
  criar: (body: {
    nome: string
    slug: string
    sistema: string
    genero: GenreId
    visibilidade?: 'listada' | 'so_link'
  }) =>
    req<{
      slug: string
      id: number
      nome: string
      sistema: string
      genero: string
      visibilidade: string
    }>('/api/campanhas', { method: 'POST', body: JSON.stringify(body) }, true),
  patchVisibilidade: (slug: string, visibilidade: 'listada' | 'so_link') =>
    req<{ slug: string; visibilidade: string }>(
      `/api/campanhas/${encodeURIComponent(slug)}/visibilidade`,
      { method: 'PATCH', body: JSON.stringify({ visibilidade }) },
      true,
    ),
  patchUnidadeDistancia: (slug: string, unidade_distancia: 'mi' | 'km') =>
    req<{ slug: string; unidade_distancia: string }>(
      `/api/campanhas/${encodeURIComponent(slug)}/unidade-distancia`,
      { method: 'PATCH', body: JSON.stringify({ unidade_distancia }) },
      true,
    ),
  patchCapa: (
    slug: string,
    body: {
      capa_arquivo?: string | null
      limpar_capa?: boolean
    },
  ) =>
    req<{
      slug: string
      capa_arquivo: string
      capa_url: string | null
    }>(
      `/api/campanhas/${encodeURIComponent(slug)}/capa`,
      { method: 'PATCH', body: JSON.stringify(body) },
      true,
    ),
  exportZip: async (slug: string): Promise<Blob> => {
    const response = await fetch(
      `${API_BASE}/api/c/${encodeURIComponent(slug)}/admin/export`,
      { credentials: 'include' },
    )
    if (!response.ok) {
      throw parseApiError(await response.text(), response.status)
    }
    return response.blob()
  },
  importZip: async (file: File, slug?: string) => {
    const body = new FormData()
    body.append('file', file)
    if (slug) body.append('slug', slug)
    return req<{ slug: string; id: number; nome: string; sistema: string; genero?: string }>(
      '/api/campanhas/import',
      { method: 'POST', body },
      true,
    )
  },
}
