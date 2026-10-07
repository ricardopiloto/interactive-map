import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { IconArrowLeft } from '@tabler/icons-react'
import { adminApi, type PropostaArco } from '../../api/admin'
import { ArcoAdminList, ArcoFormDialog } from '../admin/ArcoAdminList'
import { suggestArcoColor } from '../admin/arcoColor'
import { Button, Dialog } from '../ui'
import { useApiErrorMessage } from '../../hooks/useApiErrorMessage'
import type { Arco, Local, Sessao } from '../../types'

interface ArcoDraft {
  id?: number
  titulo: string
  resumo: string
  ordem: number
  visivel_para_todos: boolean
  cor: string
  sessaoIds: number[]
  sessaoTransicaoId: number | null
  localIds: number[]
  localOpcoes: { id: number; nome: string }[]
  isNew: boolean
}

type CreateChoice =
  | 'picker'
  | 'ia-nao-habilitada'
  | 'ia-gerando'
  | 'ia-propostas'
  | 'ia-insuficiente'
  | 'ia-falha'

interface ArcoManagerProps {
  arcos: Arco[]
  sessoes: Sessao[]
  locais: Local[]
  iaArcosEnabled: boolean
  onChanged: () => void
  onClose: () => void
}

/** Arc list, form, and manual/IA creation. Replaces the map side panel. */
export function ArcoManager({
  arcos,
  sessoes,
  locais,
  iaArcosEnabled,
  onChanged,
  onClose,
}: ArcoManagerProps) {
  const { t } = useTranslation('mapa')
  const { t: tl } = useTranslation('linhaTempo')
  const navigate = useNavigate()
  const apiErrorMessage = useApiErrorMessage()
  const [draft, setDraft] = useState<ArcoDraft | null>(null)
  const [propostas, setPropostas] = useState<PropostaArco[]>([])
  const [choice, setChoice] = useState<CreateChoice | null>(null)
  const [error, setError] = useState<string | null>(null)
  const propostaReq = useRef(0)

  useEffect(() => {
    return () => {
      propostaReq.current += 1
    }
  }, [])

  const usedColors = arcos.map((arco) => arco.cor ?? '').filter(Boolean)

  function startManual() {
    setChoice(null)
    setDraft({
      titulo: '',
      resumo: '',
      ordem: arcos.length + 1,
      visivel_para_todos: true,
      cor: suggestArcoColor(usedColors),
      sessaoIds: [],
      sessaoTransicaoId: null,
      localIds: [],
      localOpcoes: [],
      isNew: true,
    })
  }

  function aplicarProposta(proposta: PropostaArco) {
    const opcoes = proposta.local_ids
      .map((id) => locais.find((local) => local.id === id))
      .filter((local): local is Local => local != null)
      .map((local) => ({ id: local.id, nome: local.nome }))
    setChoice(null)
    setDraft({
      titulo: proposta.titulo,
      resumo: proposta.resumo,
      ordem: arcos.length + 1,
      visivel_para_todos: true,
      cor: suggestArcoColor(usedColors),
      sessaoIds: proposta.sessao_ids,
      sessaoTransicaoId: proposta.sessao_transicao_id,
      localIds: opcoes.map((local) => local.id),
      localOpcoes: opcoes,
      isNew: true,
    })
  }

  function descartarProposta() {
    propostaReq.current += 1
    setPropostas([])
    setChoice(null)
  }

  async function chooseIa() {
    if (!iaArcosEnabled) {
      setChoice('ia-nao-habilitada')
      return
    }
    const req = propostaReq.current + 1
    propostaReq.current = req
    setChoice('ia-gerando')
    try {
      const resposta = await adminApi.proporArcos()
      if (propostaReq.current !== req) return
      if (resposta.estado === 'propostas' && resposta.propostas.length > 0) {
        setPropostas(resposta.propostas)
        setChoice('ia-propostas')
        return
      }
      setPropostas([])
      setChoice(resposta.estado === 'sessoes_insuficientes' ? 'ia-insuficiente' : 'ia-falha')
    } catch {
      if (propostaReq.current !== req) return
      setPropostas([])
      setChoice('ia-falha')
    }
  }

  async function save() {
    if (!draft || !draft.titulo.trim()) return
    try {
      const payload = {
        titulo: draft.titulo.trim(),
        resumo: draft.resumo,
        ordem: draft.ordem,
        visivel_para_todos: draft.visivel_para_todos,
        cor: draft.cor || null,
        sessao_ids: draft.sessaoIds,
        sessao_transicao_id: draft.sessaoTransicaoId,
      }
      if (draft.isNew) {
        const criado = await adminApi.createArco(payload)
        await Promise.all(
          draft.localIds.map((id) => adminApi.updateLocal(id, { arco_id: criado.id })),
        )
      } else if (draft.id != null) {
        await adminApi.updateArco(draft.id, payload)
      }
      setDraft(null)
      onChanged()
    } catch (err) {
      setError(apiErrorMessage(err))
    }
  }

  async function remove(id: number) {
    try {
      await adminApi.deleteArco(id)
      onChanged()
    } catch (err) {
      setError(apiErrorMessage(err))
    }
  }

  return (
    <div className="linha-tempo-page__arcos">
      <Button variant="ghost" size="sm" type="button" onClick={onClose}>
        <IconArrowLeft size={15} aria-hidden /> {tl('gestaoBack')}
      </Button>
      {error ? <p className="linha-tempo-page__error">{error}</p> : null}
      <ArcoAdminList
        arcos={arcos}
        onAdd={() => setChoice('picker')}
        onEdit={(arco) =>
          setDraft({
            id: arco.id,
            titulo: arco.titulo,
            resumo: arco.resumo,
            ordem: arco.ordem,
            visivel_para_todos: arco.visivel_para_todos ?? true,
            cor: arco.cor ?? '',
            sessaoIds: arco.sessao_ids ?? [],
            sessaoTransicaoId: arco.sessao_transicao_id ?? null,
            localIds: [],
            localOpcoes: [],
            isNew: false,
          })
        }
        onDelete={(id) => void remove(id)}
      />

      {draft ? (
        <ArcoFormDialog
          title={draft.isNew ? t('mapPage.newArco') : t('mapPage.editArco')}
          titulo={draft.titulo}
          resumo={draft.resumo}
          ordem={draft.ordem}
          visivel_para_todos={draft.visivel_para_todos}
          cor={draft.cor}
          sessaoIds={draft.sessaoIds}
          sessaoTransicaoId={draft.sessaoTransicaoId}
          localIds={draft.localIds}
          localOpcoes={draft.localOpcoes}
          sessoes={sessoes}
          arcos={arcos}
          arcoId={draft.isNew ? undefined : draft.id}
          onChange={(patch) => setDraft({ ...draft, ...patch })}
          onSave={() => void save()}
          onCancel={() => setDraft(null)}
        />
      ) : null}

      <Dialog
        open={choice === 'picker'}
        onClose={() => setChoice(null)}
        title={t('mapPage.arcoCreateChoiceTitle')}
      >
        <p className="linha-tempo-page__arco-choice-lead">{t('mapPage.arcoCreateChoiceLead')}</p>
        <div className="linha-tempo-page__arco-choice-actions">
          <Button variant="primary" type="button" onClick={startManual}>
            {t('mapPage.arcoCreateManual')}
          </Button>
          <Button variant="secondary" type="button" onClick={() => void chooseIa()}>
            {t('mapPage.arcoCreateIa')}
          </Button>
          <Button variant="ghost" type="button" onClick={() => setChoice(null)}>
            {t('mapPage.arcoCreateCancelar')}
          </Button>
        </div>
      </Dialog>

      <Dialog
        open={choice === 'ia-nao-habilitada'}
        onClose={() => setChoice(null)}
        title={t('mapPage.arcoIaNaoHabilitadaTitle')}
      >
        <p className="linha-tempo-page__arco-choice-lead">{t('mapPage.arcoIaNaoHabilitadaBody')}</p>
        <div className="linha-tempo-page__arco-choice-actions">
          <Button
            variant="primary"
            type="button"
            onClick={() => {
              setChoice(null)
              navigate('/painel')
            }}
          >
            {t('mapPage.arcoIaHabilitarCta')}
          </Button>
          <Button variant="secondary" type="button" onClick={startManual}>
            {t('mapPage.arcoCreateManual')}
          </Button>
        </div>
      </Dialog>

      <Dialog
        open={choice === 'ia-gerando'}
        onClose={descartarProposta}
        title={t('mapPage.arcoIaGerandoTitle')}
      >
        <p className="linha-tempo-page__arco-choice-lead">{t('mapPage.arcoIaGerandoBody')}</p>
      </Dialog>

      <Dialog
        open={choice === 'ia-propostas'}
        onClose={descartarProposta}
        title={t('mapPage.arcoIaPropostasTitle')}
      >
        <p className="linha-tempo-page__arco-choice-lead">{t('mapPage.arcoIaPropostasLead')}</p>
        <div className="linha-tempo-page__arco-choice-actions">
          {propostas.map((proposta, index) => (
            <Button
              key={`${proposta.titulo}-${index}`}
              variant="primary"
              type="button"
              onClick={() => aplicarProposta(proposta)}
            >
              {t('mapPage.arcoIaUsarProposta')}: {proposta.titulo}
            </Button>
          ))}
          <Button variant="secondary" type="button" onClick={startManual}>
            {t('mapPage.arcoCreateManual')}
          </Button>
          <Button variant="ghost" type="button" onClick={descartarProposta}>
            {t('mapPage.arcoIaDescartar')}
          </Button>
        </div>
      </Dialog>

      <Dialog
        open={choice === 'ia-insuficiente'}
        onClose={() => setChoice(null)}
        title={t('mapPage.arcoIaInsuficienteTitle')}
      >
        <p className="linha-tempo-page__arco-choice-lead">{t('mapPage.arcoIaInsuficienteBody')}</p>
        <div className="linha-tempo-page__arco-choice-actions">
          <Button variant="primary" type="button" onClick={startManual}>
            {t('mapPage.arcoCreateManual')}
          </Button>
        </div>
      </Dialog>

      <Dialog
        open={choice === 'ia-falha'}
        onClose={() => setChoice(null)}
        title={t('mapPage.arcoIaFalhaTitle')}
      >
        <p className="linha-tempo-page__arco-choice-lead">{t('mapPage.arcoIaFalhaBody')}</p>
        <div className="linha-tempo-page__arco-choice-actions">
          <Button variant="primary" type="button" onClick={startManual}>
            {t('mapPage.arcoCreateManual')}
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
