import type { Personagem, Vinculo } from '../../types'
import { ImageSlot } from '../media/ImageSlot'
import {
  isDuasVias,
  notaFromPerspective,
  tipoFromPerspective,
} from './vinculoDirection'
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

      <h6>Vínculos ({vinculos.length})</h6>
      <div className="relacoes-detail__vinculos">
        {vinculos.length === 0 && <p className="text-muted">Nenhum vínculo visível.</p>}
        {vinculos.map((v) => {
          const otherId = v.personagem_a_id === personagem.id ? v.personagem_b_id : v.personagem_a_id
          const other = personagemById.get(otherId)
          const myTipo = tipoFromPerspective(v, personagem.id)
          const theirTipo = tipoFromPerspective(v, otherId)
          const myNota = notaFromPerspective(v, personagem.id)
          const theirNota = notaFromPerspective(v, otherId)
          const style = vinculoStyle(myTipo)
          const duas = isDuasVias(v)
          return (
            <div key={v.id} className="relacoes-detail__vinculo">
              <div className="relacoes-detail__vinculo-row">
                <span className="relacoes-detail__vinculo-dot" style={{ background: style.color }} />
                <button
                  type="button"
                  className="relacoes-detail__vinculo-name"
                  onClick={() => onFocusPersonagem(otherId)}
                  disabled={!other}
                >
                  {other?.nome ?? 'Personagem removido'}
                </button>
                <span className="relacoes-detail__vinculo-tipo" style={{ color: style.color }}>
                  {style.label}
                </span>
              </div>
              {myNota && <p className="relacoes-detail__vinculo-nota">{myNota}</p>}
              {duas && (
                <p className="relacoes-detail__vinculo-return">
                  Vê-te como{' '}
                  <span style={{ color: vinculoStyle(theirTipo).color }}>
                    {vinculoStyle(theirTipo).label}
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
