import type { Personagem, Vinculo } from '../../types'
import { ImageSlot } from '../media/ImageSlot'
import {
  isDuasVias,
  notaFromPerspective,
  qualFromPerspective,
  tipoFromPerspective,
} from './vinculoDirection'
import { formatVinculoTipoLabel } from './vinculoLabel'
import { vinculoStyle } from './vinculoStyles'
import './RelacoesDetailPanel.css'

const STATUS_LABEL: Record<string, string> = {
  vivo: 'Vivo',
  morto: 'Morto',
  desaparecido: 'Desaparecido',
  desconhecido: 'Desconhecido',
}

interface RelacoesDetailPanelProps {
  personagem: Personagem
  vinculos: Vinculo[]
  personagemById: Map<number, Personagem>
  isGm: boolean
  onClose: () => void
  onFocusPersonagem: (id: number) => void
  onEdit?: () => void
  onDelete?: () => void
  onEditVinculo?: (vinculoId: number) => void
  onDeleteVinculo?: (vinculoId: number) => void
}

function neighbourId(v: Vinculo, selfId: number): number {
  return v.personagem_a_id === selfId ? v.personagem_b_id : v.personagem_a_id
}

/** A→Z by neighbour name (pt); unresolved last; tie by vínculo id. */
function sortVinculosByNeighbourName(
  vinculos: Vinculo[],
  selfId: number,
  personagemById: Map<number, Personagem>,
): Vinculo[] {
  return [...vinculos].sort((a, b) => {
    const nomeA = personagemById.get(neighbourId(a, selfId))?.nome
    const nomeB = personagemById.get(neighbourId(b, selfId))?.nome
    if (nomeA == null && nomeB == null) return a.id - b.id
    if (nomeA == null) return 1
    if (nomeB == null) return -1
    const cmp = nomeA.localeCompare(nomeB, 'pt', { sensitivity: 'base' })
    if (cmp !== 0) return cmp
    return a.id - b.id
  })
}

export function RelacoesDetailPanel({
  personagem,
  vinculos,
  personagemById,
  isGm,
  onClose,
  onFocusPersonagem,
  onEdit,
  onDelete,
  onEditVinculo,
  onDeleteVinculo,
}: RelacoesDetailPanelProps) {
  const sortedVinculos = sortVinculosByNeighbourName(vinculos, personagem.id, personagemById)

  return (
    <aside className="relacoes-detail">
      <button
        type="button"
        className="btn btn-ghost relacoes-detail__close"
        onClick={onClose}
        aria-label="Fechar"
      >
        ×
      </button>

      <div className="relacoes-detail__kicker">
        {personagem.tipo === 'pj' ? 'PJ' : 'NPC'}
        {personagem.papel ? ` · ${personagem.papel}` : ''}
      </div>
      <h3 className={`relacoes-detail__name${personagem.status === 'morto' ? ' relacoes-detail__name--morto' : ''}`}>
        {personagem.nome}
      </h3>

      <ImageSlot
        src={personagem.retrato_url}
        placeholder="Sem retrato"
        shape="rounded"
        fit="contain"
        className="relacoes-detail__portrait"
      />

      <div className="relacoes-detail__tags">
        <span className="tag tag-outline">{STATUS_LABEL[personagem.status ?? 'desconhecido']}</span>
        {personagem.faccao && <span className="tag tag-neutral">{personagem.faccao}</span>}
      </div>

      <p className="relacoes-detail__desc">{personagem.descricao || 'Sem descrição.'}</p>

      {isGm && (
        <div className="gm-row">
          <button type="button" className="btn btn-secondary" onClick={onEdit}>
            Editar
          </button>
          <button type="button" className="btn btn-ghost" onClick={onDelete}>
            Remover
          </button>
        </div>
      )}

      <div className="hr" />

      <h6>Vínculos ({sortedVinculos.length})</h6>
      <div className="relacoes-detail__vinculos">
        {sortedVinculos.length === 0 && <p className="text-muted">Nenhum vínculo visível.</p>}
        {sortedVinculos.map((v) => {
          const otherId = neighbourId(v, personagem.id)
          const other = personagemById.get(otherId)
          const myTipo = tipoFromPerspective(v, personagem.id)
          const theirTipo = tipoFromPerspective(v, otherId)
          const myNota = notaFromPerspective(v, personagem.id)
          const theirNota = notaFromPerspective(v, otherId)
          const myQual = qualFromPerspective(v, personagem.id)
          const theirQual = qualFromPerspective(v, otherId)
          const showPrimary = myTipo != null
          const showReturn = theirTipo != null && (isDuasVias(v) || myTipo == null)
          const style = vinculoStyle(myTipo ?? theirTipo ?? 'conhecido')
          return (
            <div key={v.id} className="relacoes-detail__vinculo">
              <div className="relacoes-detail__vinculo-row">
                <span
                  className="relacoes-detail__vinculo-dot"
                  style={{ background: showPrimary ? style.color : vinculoStyle(theirTipo!).color }}
                />
                <button
                  type="button"
                  className="relacoes-detail__vinculo-name"
                  onClick={() => onFocusPersonagem(otherId)}
                  disabled={!other}
                >
                  {other?.nome ?? 'Personagem removido'}
                </button>
                {showPrimary && (
                  <span className="relacoes-detail__vinculo-tipo" style={{ color: style.color }}>
                    {formatVinculoTipoLabel(
                      style.label,
                      myQual,
                      isDuasVias(v) ? null : v.direcao,
                    )}
                  </span>
                )}
              </div>
              {showPrimary && myNota && <p className="relacoes-detail__vinculo-nota">{myNota}</p>}
              {showReturn && theirTipo != null && (
                <p className="relacoes-detail__vinculo-return">
                  Vê-te como{' '}
                  <span style={{ color: vinculoStyle(theirTipo).color }}>
                    {formatVinculoTipoLabel(vinculoStyle(theirTipo).label, theirQual)}
                  </span>
                  {theirNota ? ` — ${theirNota}` : ''}
                </p>
              )}
              {isGm && (
                <div className="gm-row">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => onEditVinculo?.(v.id)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => onDeleteVinculo?.(v.id)}
                  >
                    Remover
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </aside>
  )
}
