import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { adminApi } from '../api/admin'
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

/** When `asGm` is true, locais/npcs come from admin APIs (includes hidden personagens). */
export function useCampaignData(asGm = false): CampaignData {
  const { t } = useTranslation('comum')
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
          asGm ? adminApi.listLocaisAdmin() : campaignApi.listLocais(),
          asGm ? adminApi.listNpcsAdmin() : campaignApi.listNpcs(),
          asGm ? adminApi.listArcosAdmin() : campaignApi.listArcos(),
          campaignApi.getGrupo(),
        ])
        if (cancelled) return
        setLocais(locaisData)
        // A relação Local.npc_ids contém IDs da entidade unificada (PJ e NPC).
        // APIs públicas já filtram personagens ocultos; o mestre recebe a lista completa.
        setNpcs(npcsData)
        setArcos(arcosData)
        setGrupo(grupoData)
      } catch {
        if (!cancelled) {
          setError(t('errors.loadData'))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [tick, t, asGm])

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
