import { useEffect, useState } from 'react'
import { campaignApi } from '../api/campaign'
import type { Arco, GrupoPosicao, Local, NPC } from '../types'

interface CampaignData {
  locais: Local[]
  npcs: NPC[]
  arcos: Arco[]
  grupo: GrupoPosicao | null
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useCampaignData(): CampaignData {
  const [locais, setLocais] = useState<Local[]>([])
  const [npcs, setNpcs] = useState<NPC[]>([])
  const [arcos, setArcos] = useState<Arco[]>([])
  const [grupo, setGrupo] = useState<GrupoPosicao | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [locaisData, npcsData, arcosData, grupoData] = await Promise.all([
          campaignApi.listLocais(),
          campaignApi.listNpcs(),
          campaignApi.listArcos(),
          campaignApi.getGrupo(),
        ])
        if (cancelled) return
        setLocais(locaisData)
        setNpcs(npcsData)
        setArcos(arcosData)
        setGrupo(grupoData)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Falha ao carregar dados')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [tick])

  return {
    locais,
    npcs,
    arcos,
    grupo,
    loading,
    error,
    refresh: () => setTick((t) => t + 1),
  }
}
