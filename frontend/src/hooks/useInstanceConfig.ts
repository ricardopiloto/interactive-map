import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { fetchInstanceConfig } from '../api/config'
import type { InstanceConfig } from '../types'

let cachedConfig: InstanceConfig | null = null
let inflight: Promise<InstanceConfig> | null = null

function loadConfig(): Promise<InstanceConfig> {
  if (cachedConfig) return Promise.resolve(cachedConfig)
  if (!inflight) {
    inflight = fetchInstanceConfig().then((cfg) => {
      cachedConfig = cfg
      return cfg
    })
  }
  return inflight
}

export function useInstanceConfig() {
  const { t } = useTranslation('comum')
  const [config, setConfig] = useState<InstanceConfig | null>(cachedConfig)
  const [loading, setLoading] = useState(!cachedConfig)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (cachedConfig) return
    let cancelled = false
    void loadConfig()
      .then((cfg) => {
        if (!cancelled) setConfig(cfg)
      })
      .catch(() => {
        if (!cancelled) {
          setError(t('errors.loadConfig'))
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [t])

  return { config, loading, error }
}

export function getCachedInstanceConfig(): InstanceConfig | null {
  return cachedConfig
}

/** Clear module cache so the next loadConfig() hits the network. */
export function clearInstanceConfigCache(): void {
  cachedConfig = null
  inflight = null
}

/** Optimistic update after GM uploads a campaign map image. */
export function markHasMapImageInCache(): void {
  if (cachedConfig) {
    cachedConfig = { ...cachedConfig, has_map_image: true }
  }
}
