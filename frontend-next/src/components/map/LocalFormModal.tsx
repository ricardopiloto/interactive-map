import { useEffect, useState } from 'react'
import { Modal } from '../common/Modal'
import type { Arco, Local } from '../../data/types'

interface LocalFormModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<Local, 'id' | 'npcIds' | 'saidaIds'>) => void
  arcos: Arco[]
  initial?: Local | null
  coords?: { x: number; y: number } | null
}

const PIN_COLORS = ['#d8aa5a', '#de7384', '#51c0d6', '#73a5de', '#7bc48f', '#b4afa7']

export function LocalFormModal({ open, onClose, onSave, arcos, initial, coords }: LocalFormModalProps) {
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [corPin, setCorPin] = useState(PIN_COLORS[0])
  const [arcoId, setArcoId] = useState<string | null>(arcos[0]?.id ?? null)
  const [visitado, setVisitado] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setNome(initial?.nome ?? '')
    setDescricao(initial?.descricao ?? '')
    setCorPin(initial?.corPin ?? PIN_COLORS[0])
    setArcoId(initial ? initial.arcoId : arcos[0]?.id ?? null)
    setVisitado(initial?.visitado ?? true)
    setError('')
  }, [open, initial, arcos])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim()) { setError('Dê um nome ao local antes de salvar.'); return }
    onSave({
      nome: nome.trim(),
      descricao,
      corPin,
      arcoId,
      visitado,
      x: initial?.x ?? coords?.x ?? 0.5,
      y: initial?.y ?? coords?.y ?? 0.5,
    })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow={initial ? 'Editar local' : 'Novo local'}
      title={initial ? initial.nome : 'Adicionar local ao mapa'}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" form="local-form" className="btn btn-primary">Salvar</button>
        </>
      }
    >
      <form id="local-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="local-nome">Nome</label>
          <input id="local-nome" className="input" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Vila de Bruckthin" autoFocus />
          {error && <span className="field-hint" style={{ color: 'var(--color-danger)' }}>{error}</span>}
        </div>
        <div className="field">
          <label htmlFor="local-desc">Descrição</label>
          <textarea id="local-desc" className="textarea" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="O que os jogadores encontraram aqui…" />
        </div>
        <div className="field">
          <label>Arco</label>
          <select className="select" value={arcoId ?? ''} onChange={(e) => setArcoId(e.target.value || null)}>
            <option value="">Sem arco</option>
            {arcos.map((a) => <option key={a.id} value={a.id}>{a.titulo}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Cor do pino</label>
          <div className="row gap-2">
            {PIN_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Cor ${c}`}
                onClick={() => setCorPin(c)}
                style={{
                  width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer',
                  border: corPin === c ? '2px solid var(--color-text-1)' : '2px solid transparent',
                  boxShadow: corPin === c ? '0 0 0 2px var(--color-surface)' : 'none',
                }}
              />
            ))}
          </div>
        </div>
        <label className="row gap-2" style={{ fontSize: 13.5, cursor: 'pointer' }}>
          <input type="checkbox" checked={visitado} onChange={(e) => setVisitado(e.target.checked)} />
          Grupo já visitou este local
        </label>
      </form>
    </Modal>
  )
}
