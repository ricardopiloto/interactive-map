import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { CAMPAIGNS } from './mock'
import type { Campaign } from './types'

interface CampaignsState {
  campaigns: Campaign[]
  addCampaign: (c: Campaign) => void
  getBySlug: (slug: string) => Campaign | undefined
}

const Ctx = createContext<CampaignsState | null>(null)

/**
 * Guarda os codex "mocados" + qualquer codex criado pelo assistente de
 * criação (`/painel/novo`) durante a sessão do navegador — só em memória,
 * sem persistência, para o protótipo fechar o ciclo criar → ver → abrir.
 */
export function CampaignsProvider({ children }: { children: ReactNode }) {
  const [created, setCreated] = useState<Campaign[]>([])
  const campaigns = useMemo(() => [...created, ...CAMPAIGNS], [created])

  const value = useMemo<CampaignsState>(
    () => ({
      campaigns,
      addCampaign: (c) => setCreated((prev) => [c, ...prev]),
      getBySlug: (slug) => campaigns.find((c) => c.slug === slug),
    }),
    [campaigns],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useCampaigns(): CampaignsState {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCampaigns must be used inside CampaignsProvider')
  return ctx
}
