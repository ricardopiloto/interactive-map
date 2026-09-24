import type { Location } from 'react-router-dom'

const APP_ORIGIN = 'https://campaign-codex.invalid'

export interface LoginModalState {
  backgroundLocation: Location
  postLoginTarget?: string
  closeFallback?: string
}

export function safeInternalPath(value: unknown): string | null {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.includes('\\') ||
    Array.from(value).some((character) => {
      const code = character.charCodeAt(0)
      return code < 0x20 || code === 0x7f
    })
  ) {
    return null
  }

  try {
    const url = new URL(value, APP_ORIGIN)
    if (url.origin !== APP_ORIGIN) return null
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return null
  }
}

function safeBackgroundLocation(value: unknown): Location | null {
  if (!value || typeof value !== 'object') return null
  const candidate = value as Partial<Location>
  if (typeof candidate.pathname !== 'string') return null

  const combined = safeInternalPath(
    `${candidate.pathname}${candidate.search ?? ''}${candidate.hash ?? ''}`,
  )
  if (!combined) return null

  const normalized = new URL(combined, APP_ORIGIN)
  if (normalized.pathname === '/login' || normalized.pathname.startsWith('/login/')) {
    return null
  }

  return {
    pathname: normalized.pathname,
    search: normalized.search,
    hash: normalized.hash,
    state: null,
    key: typeof candidate.key === 'string' ? candidate.key : 'login-background',
  }
}

export function readLoginModalState(value: unknown): LoginModalState | null {
  if (!value || typeof value !== 'object') return null
  const candidate = value as Partial<LoginModalState>
  const backgroundLocation = safeBackgroundLocation(candidate.backgroundLocation)
  if (!backgroundLocation) return null

  return {
    backgroundLocation,
    postLoginTarget: safeInternalPath(candidate.postLoginTarget) ?? undefined,
    closeFallback: safeInternalPath(candidate.closeFallback) ?? undefined,
  }
}

export function createLoginModalState(
  backgroundLocation: Location,
  postLoginTarget?: string,
  closeFallback?: string,
): LoginModalState {
  return {
    backgroundLocation: safeBackgroundLocation(backgroundLocation) ?? publicLoginBackground(),
    postLoginTarget: safeInternalPath(postLoginTarget) ?? undefined,
    closeFallback: closeFallback ? safeInternalPath(closeFallback) ?? '/' : undefined,
  }
}

export function publicLoginBackground(): Location {
  return {
    pathname: '/',
    search: '',
    hash: '',
    state: null,
    key: 'login-public-background',
  }
}

export function locationPath(location: Pick<Location, 'pathname' | 'search' | 'hash'>): string {
  return safeInternalPath(`${location.pathname}${location.search}${location.hash}`) ?? '/'
}
