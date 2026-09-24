import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { fetchInstanceConfig } from '../api/config'
import type { InstanceConfig } from '../types'

const cachedBySlug = new Map<string, InstanceConfig>()
const inflightBySlug = new Map<string, Promise<InstanceConfig>>()

function loadConfig(slug: string): Promise<InstanceConfig> {
  const cached = cachedBySlug.get(slug)
  if (cached) return Promise.resolve(cached)
  let inflight = inflightBySlug.get(slug)
  if (!inflight) {
    inflight = fetchInstanceConfig(slug).then((cfg) => {
      cachedBySlug.set(slug, cfg)
      inflightBySlug.delete(slug)
      return cfg
    })
    inflightBySlug.set(slug, inflight)
  }
  return inflight
}

export function useInstanceConfig(slug: string | undefined) {
  const { t } = useTranslation('comum')
  const [config, setConfig] = useState<InstanceConfig | null>(
    slug ? cachedBySlug.get(slug) ?? null : null,
  )
  const [loading, setLoading] = useState(Boolean(slug) && !cachedBySlug.has(slug ?? ''))
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) {
      setConfig(null)
      setLoading(false)
      setError(null)
      setNotFound(false)
      return
    }
    const hit = cachedBySlug.get(slug)
    if (hit) {
      setConfig(hit)
      setLoading(false)
      setError(null)
      setNotFound(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    setNotFound(false)
    void loadConfig(slug)
      .then((cfg) => {
        if (!cancelled) setConfig(cfg)
      })
      .catch((err: { status?: number }) => {
        if (!cancelled) {
          if (err?.status === 404) {
            setNotFound(true)
            setError(null)
          } else {
            setError(t('errors.loadConfig'))
          }
          setConfig(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [slug, t])

  return { config, loading, error, notFound }
}

export function getCachedInstanceConfig(slug?: string): InstanceConfig | null {
  if (!slug) return null
  return cachedBySlug.get(slug) ?? null
}

/** Clear module cache so the next loadConfig() hits the network. */
export function clearInstanceConfigCache(slug?: string): void {
  if (slug) {
    cachedBySlug.delete(slug)
    inflightBySlug.delete(slug)
    return
  }
  cachedBySlug.clear()
  inflightBySlug.clear()
}

/** Optimistic update after GM uploads a campaign map image. */
export function markHasMapImageInCache(slug: string): void {
  const cached = cachedBySlug.get(slug)
  if (cached) {
    cachedBySlug.set(slug, { ...cached, has_map_image: true })
  }
}
