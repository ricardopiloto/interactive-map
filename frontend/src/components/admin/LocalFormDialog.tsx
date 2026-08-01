import type { Arco, Local, NPC } from '../../types'
import { ImageSlot } from '../media/ImageSlot'

export interface LocalFormDraft {
  id?: number
  nome: string
  descricao: string
  data_sessao: string
  arco_id: number | null
  npc_ids: number[]
  x: number
  y: number
  imagem_url: string | null
  isNew: boolean
}

interface LocalFormDialogProps {
  draft: LocalFormDraft
  arcos: Arco[]
  npcs: NPC[]
  onChange: (patch: Partial<LocalFormDraft>) => void
  onSave: () => void
  onCancel: () => void
  onStartReposition: () => void
}

export function LocalFormDialog({
  draft,
  arcos,
  npcs,
  onChange,
  onSave,
  onCancel,
  onStartReposition,
}: LocalFormDialogProps) {
  return (
    <div className="dialog-backdrop" style={{ zIndex: 95 }}>
      <div className="dialog" role="dialog" aria-label={draft.isNew ? 'Novo local' : 'Editar local'}>
        <div className="dialog-title">{draft.isNew ? 'Novo local' : 'Editar local'}</div>
        <ImageSlot
          src={draft.imagem_url}
          placeholder="Imagem do local"
          shape="rounded"
          editable
          category="locals"
          style={{ width: '100%', height: 150 }}
          onUploaded={(url) => onChange({ imagem_url: url })}
        />
        <div className="field">
          <label>Nome</label>
          <input
            className="input"
            value={draft.nome}
            onChange={(e) => onChange({ nome: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Descrição</label>
          <textarea
            className="input"
            rows={3}
            value={draft.descricao}
            onChange={(e) => onChange({ descricao: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Rótulo da sessão (opcional)</label>
          <input
            className="input"
            value={draft.data_sessao}
            placeholder="ex.: Sessão 3"
            onChange={(e) => onChange({ data_sessao: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Arco</label>
          <select
            className="input"
            value={draft.arco_id ?? ''}
            onChange={(e) =>
              onChange({ arco_id: e.target.value ? Number(e.target.value) : null })
            }
          >
            <option value="">— nenhum —</option>
            {arcos.map((a) => (
              <option key={a.id} value={a.id}>
                {a.titulo}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>NPCs presentes</label>
          <div className="gm-chips">
            {npcs.map((n) => {
              const on = draft.npc_ids.includes(n.id)
              return (
                <button
                  key={n.id}
                  type="button"
                  className={on ? 'tag tag-accent' : 'tag tag-outline'}
                  onClick={() =>
                    onChange({
                      npc_ids: on
                        ? draft.npc_ids.filter((id) => id !== n.id)
                        : [...draft.npc_ids, n.id],
                    })
                  }
                >
                  {n.nome}
                </button>
              )
            })}
          </div>
        </div>
        <p className="card-meta">
          Posição: x {draft.x.toFixed(2)} · y {draft.y.toFixed(2)}{' '}
          {!draft.isNew && (
            <button type="button" className="btn btn-ghost" onClick={onStartReposition}>
              Reposicionar no mapa
            </button>
          )}
        </p>
        <div className="dialog-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onSave}
            disabled={!draft.nome.trim()}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}

export function localToDraft(local: Local): LocalFormDraft {
  return {
    id: local.id,
    nome: local.nome,
    descricao: local.descricao,
    data_sessao: local.data_sessao ?? '',
    arco_id: local.arco_id,
    npc_ids: [...local.npc_ids],
    x: local.x,
    y: local.y,
    imagem_url: local.imagem_url,
    isNew: false,
  }
}
