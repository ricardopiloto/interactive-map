import { useEffect, useMemo, useRef, useState } from 'react'
import { adminApi } from '../api/admin'
import { campaignApi } from '../api/campaign'
import {
  clearAdminCredentials,
  hasAdminCredentials,
  setAdminCredentials,
} from '../api/client'
import { CodexHeader } from '../components/layout/CodexHeader'
import { AdminGateDialog } from '../components/gm/AdminGateDialog'
import { GraphStage } from '../components/relacoes/GraphStage'
import { RelacoesSideColumn } from '../components/relacoes/RelacoesSideColumn'
import { RelacoesDetailPanel } from '../components/relacoes/RelacoesDetailPanel'
import {
  PersonagemFormDialog,
  type PersonagemDraft,
} from '../components/relacoes/PersonagemFormDialog'
import { VinculoFormDialog, type VinculoDraft } from '../components/relacoes/VinculoFormDialog'
import { isDuasVias } from '../components/relacoes/vinculoDirection'
import { VINCULO_TIPOS } from '../components/relacoes/vinculoStyles'
import type { Personagem, Vinculo, VinculoTipo } from '../types'
import './RelacoesPage.css'

const ADMIN_USER = import.meta.env.VITE_ADMIN_USER ?? 'gm'
const SELECTION_ANIMATION_MS = 600

export function RelacoesPage() {
  const [personagens, setPersonagens] = useState<Personagem[]>([])
  const [vinculos, setVinculos] = useState<Vinculo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [query, setQuery] = useState('')
  const [activeTipos, setActiveTipos] = useState<Set<VinculoTipo>>(new Set(VINCULO_TIPOS))
  const [isolate, setIsolate] = useState(false)

  const [selectedId, setSelectedId] = useState<number | null>(null)
  /** After layout animation: focus edges may highlight (GraphStage). Idle/mid-move stay dim. */
  const [showEdges, setShowEdges] = useState(false)
  const selectionTimer = useRef<number | undefined>(undefined)

  const [isGm, setIsGm] = useState(false)
  const [showGate, setShowGate] = useState(false)
  const [gateError, setGateError] = useState(false)
  const [busyError, setBusyError] = useState<string | null>(null)

  const [personagemDraft, setPersonagemDraft] = useState<PersonagemDraft | null>(null)
  const [vinculoDraft, setVinculoDraft] = useState<VinculoDraft | null>(null)

  useEffect(() => {
    if (!hasAdminCredentials()) return
    void adminApi
      .session()
      .then(() => setIsGm(true))
      .catch(() => {
        clearAdminCredentials()
        setIsGm(false)
      })
  }, [])

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      const [ps, vs] = await Promise.all([
        campaignApi.listPersonagens(),
        isGm ? adminApi.listVinculosAdmin() : campaignApi.listVinculos(),
      ])
      setPersonagens(ps)
      setVinculos(vs)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar a rede de relações')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGm])

  const personagemById = useMemo(() => new Map(personagens.map((p) => [p.id, p])), [personagens])
  const selectedPersonagem = selectedId != null ? personagemById.get(selectedId) ?? null : null
  const selectedVinculos = useMemo(() => {
    if (selectedId == null) return []
    return vinculos.filter(
      (v) => v.personagem_a_id === selectedId || v.personagem_b_id === selectedId,
    )
  }, [vinculos, selectedId])

  function clearSelectionTimer() {
    if (selectionTimer.current != null) {
      window.clearTimeout(selectionTimer.current)
      selectionTimer.current = undefined
    }
  }

  function selectPersonagem(id: number) {
    if (id === selectedId) {
      deselectPersonagem()
      return
    }
    clearSelectionTimer()
    setShowEdges(false)
    setSelectedId(id)
    selectionTimer.current = window.setTimeout(() => setShowEdges(true), SELECTION_ANIMATION_MS)
  }

  function deselectPersonagem() {
    clearSelectionTimer()
    setShowEdges(false)
    setSelectedId(null)
    setIsolate(false)
  }

  function toggleTipo(tipo: VinculoTipo) {
    setActiveTipos((prev) => {
      const next = new Set(prev)
      if (next.has(tipo)) next.delete(tipo)
      else next.add(tipo)
      return next
    })
  }

  async function submitGate(password: string) {
    setGateError(false)
    setAdminCredentials(ADMIN_USER, password)
    try {
      await adminApi.session()
      setIsGm(true)
      setShowGate(false)
    } catch {
      clearAdminCredentials()
      setGateError(true)
    }
  }

  function logoutGm() {
    clearAdminCredentials()
    setIsGm(false)
    setPersonagemDraft(null)
    setVinculoDraft(null)
  }

  function startCreatePersonagem() {
    setPersonagemDraft({
      nome: '',
      tipo: 'npc',
      papel: '',
      faccao: '',
      descricao: '',
      status: 'vivo',
      retrato_url: null,
      isNew: true,
    })
  }

  function startEditPersonagem(p: Personagem) {
    setPersonagemDraft({
      id: p.id,
      nome: p.nome,
      tipo: p.tipo,
      papel: p.papel ?? '',
      faccao: p.faccao ?? '',
      descricao: p.descricao,
      status: p.status ?? 'desconhecido',
      retrato_url: p.retrato_url,
      isNew: false,
    })
  }

  async function savePersonagem() {
    if (!personagemDraft || !personagemDraft.nome.trim()) return
    setBusyError(null)
    try {
      const payload = {
        nome: personagemDraft.nome.trim(),
        tipo: personagemDraft.tipo,
        papel: personagemDraft.papel.trim() || null,
        descricao: personagemDraft.descricao,
        faccao: personagemDraft.faccao.trim() || null,
        status: personagemDraft.status,
        retrato_url: personagemDraft.retrato_url,
      }
      if (personagemDraft.isNew) await adminApi.createPersonagem(payload)
      else if (personagemDraft.id != null) await adminApi.updatePersonagem(personagemDraft.id, payload)
      setPersonagemDraft(null)
      await refresh()
    } catch (e) {
      setBusyError(e instanceof Error ? e.message : 'Erro ao salvar personagem')
    }
  }

  async function deletePersonagem(id: number) {
    if (!window.confirm('Remover este personagem? Isso também remove seus vínculos.')) return
    setBusyError(null)
    try {
      await adminApi.deletePersonagem(id)
      if (selectedId === id) deselectPersonagem()
      await refresh()
    } catch (e) {
      setBusyError(e instanceof Error ? e.message : 'Erro ao remover personagem')
    }
  }

  function startCreateVinculo(prefillA?: number) {
    setVinculoDraft({
      personagem_a_id: prefillA ?? selectedId ?? null,
      personagem_b_id: null,
      modo: 'reciproco',
      tipo_ab: 'conhecido',
      tipo_ba: 'conhecido',
      nota_ab: '',
      nota_ba: '',
      publico: false,
      isNew: true,
    })
  }

  function startEditVinculo(vinculoId: number) {
    const v = vinculos.find((x) => x.id === vinculoId)
    if (!v) return
    const duas = isDuasVias(v)
    setVinculoDraft({
      id: v.id,
      personagem_a_id: v.personagem_a_id,
      personagem_b_id: v.personagem_b_id,
      modo: duas ? 'duas_vias' : 'reciproco',
      tipo_ab: v.tipo_ab,
      tipo_ba: v.tipo_ba ?? v.tipo_ab,
      nota_ab: v.nota_ab,
      nota_ba: v.nota_ba,
      publico: v.publico,
      isNew: false,
    })
  }

  async function saveVinculo() {
    if (!vinculoDraft) return
    const { personagem_a_id, personagem_b_id } = vinculoDraft
    if (personagem_a_id == null || personagem_b_id == null || personagem_a_id === personagem_b_id) {
      return
    }
    setBusyError(null)
    try {
      const duas = vinculoDraft.modo === 'duas_vias'
      const payload = {
        personagem_a_id,
        personagem_b_id,
        tipo_ab: vinculoDraft.tipo_ab,
        tipo_ba: duas ? vinculoDraft.tipo_ba : null,
        nota_ab: vinculoDraft.nota_ab,
        nota_ba: duas ? vinculoDraft.nota_ba : '',
        publico: vinculoDraft.publico,
      }
      if (vinculoDraft.isNew) await adminApi.createVinculo(payload)
      else if (vinculoDraft.id != null) await adminApi.updateVinculo(vinculoDraft.id, payload)
      setVinculoDraft(null)
      await refresh()
    } catch (e) {
      setBusyError(e instanceof Error ? e.message : 'Erro ao salvar vínculo')
    }
  }

  async function deleteVinculo(id: number) {
    if (!window.confirm('Remover este vínculo?')) return
    setBusyError(null)
    try {
      await adminApi.deleteVinculo(id)
      await refresh()
    } catch (e) {
      setBusyError(e instanceof Error ? e.message : 'Erro ao remover vínculo')
    }
  }

  const sideColumn = (
    <RelacoesSideColumn
      query={query}
      onQueryChange={setQuery}
      activeTipos={activeTipos}
      onToggleTipo={toggleTipo}
      isolate={isolate}
      onToggleIsolate={setIsolate}
      isolateDisabled={selectedId == null}
    />
  )

  return (
    <div className="relacoes-page">
      <CodexHeader
        isGm={isGm}
        onToggleGm={() => {
          if (isGm) logoutGm()
          else {
            setGateError(false)
            setShowGate(true)
          }
        }}
      >
        {isGm && (
          <>
            <button type="button" className="btn btn-secondary" onClick={startCreatePersonagem}>
              + Personagem
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => startCreateVinculo()}
            >
              + Conexão
            </button>
          </>
        )}
      </CodexHeader>

      {busyError && <p className="map-page__inline-error relacoes-page__inline-error">{busyError}</p>}

      <div className="relacoes-page__body">
        {sideColumn}

        <div className="relacoes-page__stage-wrap">
          {loading && <p className="map-page__status">Carregando rede de relações…</p>}
          {error && <p className="map-page__status map-page__status--error">{error}</p>}

          {!loading && !error && (
            <GraphStage
              personagens={personagens}
              vinculos={vinculos}
              selectedId={selectedId}
              onSelect={selectPersonagem}
              onDeselect={deselectPersonagem}
              showEdges={showEdges}
              isolate={isolate}
              activeTipos={activeTipos}
              onEdgeClick={isGm ? startEditVinculo : undefined}
              searchQuery={query}
            />
          )}

          {selectedPersonagem && (
            <RelacoesDetailPanel
              personagem={selectedPersonagem}
              vinculos={selectedVinculos}
              personagemById={personagemById}
              isGm={isGm}
              onClose={deselectPersonagem}
              onFocusPersonagem={selectPersonagem}
              onEdit={() => startEditPersonagem(selectedPersonagem)}
              onDelete={() => void deletePersonagem(selectedPersonagem.id)}
              onEditVinculo={startEditVinculo}
              onDeleteVinculo={(id) => void deleteVinculo(id)}
            />
          )}
        </div>
      </div>

      {showGate && (
        <AdminGateDialog
          error={gateError}
          onSubmit={(pw) => void submitGate(pw)}
          onCancel={() => {
            setShowGate(false)
            setGateError(false)
          }}
        />
      )}

      {personagemDraft && (
        <PersonagemFormDialog
          title={personagemDraft.isNew ? 'Novo personagem' : 'Editar personagem'}
          draft={personagemDraft}
          onChange={(patch) => setPersonagemDraft({ ...personagemDraft, ...patch })}
          onSave={() => void savePersonagem()}
          onCancel={() => setPersonagemDraft(null)}
        />
      )}

      {vinculoDraft && (
        <VinculoFormDialog
          title={vinculoDraft.isNew ? 'Nova conexão' : 'Editar conexão'}
          draft={vinculoDraft}
          personagens={personagens}
          onChange={(patch) => setVinculoDraft({ ...vinculoDraft, ...patch })}
          onSave={() => void saveVinculo()}
          onCancel={() => setVinculoDraft(null)}
        />
      )}
    </div>
  )
}
