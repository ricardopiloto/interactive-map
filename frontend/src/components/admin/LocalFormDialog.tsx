import type { Arco, Local, NPC } from '../../types'
import { ImageSlot } from '../media/ImageSlot'

export const PIN_COLOR_VISITED = '#e5484d'
export const PIN_COLOR_KNOWN = '#c4b5fd'

const HEX_PIN = /^#[0-9a-fA-F]{6}$/

export interface LocalFormDraft {
  id?: number
  nome: string
  descricao: string
  data_sessao: string
  arco_id: number | null
  npc_ids: number[]
  saida_ids: number[]
  x: number
  y: number
  imagem_url: string | null
  cor_pin: string
  isNew: boolean
}

interface LocalFormDialogProps {
  draft: LocalFormDraft
  arcos: Arco[]
  npcs: NPC[]
  locais: Local[]
  onChange: (patch: Partial<LocalFormDraft>) => void
  onSave: () => void
  onCancel: () => void
  onStartReposition: () => void
}

export function LocalFormDialog({
  draft,
  arcos,
  npcs,
  locais,
  onChange,
  onSave,
  onCancel,
  onStartReposition,
}: LocalFormDialogProps) {
  const colorOk = HEX_PIN.test(draft.cor_pin)
  const canSave = Boolean(draft.nome.trim()) && colorOk
  const destinoOptions = locais.filter((l) => l.id !== draft.id)

  return (
    <div className="dialog-backdrop" style={{ zIndex: 95 }}>
      <div className="dialog" role="dialog" aria-label={draft.isNew ? 'Novo local' : 'Editar local'}>
        <div className="dialog-title">{draft.isNew ? 'Novo local' : 'Editar local'}</div>
        <div className="dialog__body">
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
            <label>
              Descrição <span className="text-muted">(Markdown opcional)</span>
            </label>
            <textarea
              className="input"
              rows={3}
              value={draft.descricao}
              onChange={(e) => onChange({ descricao: e.target.value })}
              placeholder="Texto livre ou Markdown"
            />
          </div>
          <div className="field">
            <label htmlFor="local-cor-pin">Cor do pin</label>
            <div className="gm-row" style={{ alignItems: 'center', marginTop: 0 }}>
              <input
                id="local-cor-pin"
                type="color"
                value={colorOk ? draft.cor_pin : PIN_COLOR_KNOWN}
                onChange={(e) => onChange({ cor_pin: e.target.value.toLowerCase() })}
                aria-label="Seletor de cor do pin"
              />
              <button
                type="button"
                className="btn btn-secondary"
                title="Visitado (sugestão)"
                onClick={() => onChange({ cor_pin: PIN_COLOR_VISITED })}
              >
                Visitado
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                title="Conhecido não visitado (sugestão)"
                onClick={() => onChange({ cor_pin: PIN_COLOR_KNOWN })}
              >
                Conhecido
              </button>
            </div>
            {!colorOk && (
              <p className="map-page__inline-error" role="alert">
                Escolha uma cor válida para o pin.
              </p>
            )}
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
          <div className="field">
            <label>Saídas (para onde o grupo foi)</label>
            <div className="gm-chips">
              {destinoOptions.length === 0 && (
                <span className="card-meta">Cadastre outros locais para definir saídas.</span>
              )}
              {destinoOptions.map((loc) => {
                const on = draft.saida_ids.includes(loc.id)
                return (
                  <button
                    key={loc.id}
                    type="button"
                    className={on ? 'tag tag-accent' : 'tag tag-outline'}
                    onClick={() =>
                      onChange({
                        saida_ids: on
                          ? draft.saida_ids.filter((id) => id !== loc.id)
                          : [...draft.saida_ids, loc.id],
                      })
                    }
                  >
                    {loc.nome}
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
        </div>
        <div className="dialog-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className="btn btn-primary" onClick={onSave} disabled={!canSave}>
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
    saida_ids: [...(local.saida_ids ?? [])],
    x: local.x,
    y: local.y,
    imagem_url: local.imagem_url,
    cor_pin: local.cor_pin || PIN_COLOR_KNOWN,
    isNew: false,
  }
}
