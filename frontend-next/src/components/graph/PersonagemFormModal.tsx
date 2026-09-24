import { useEffect, useState } from 'react'
import { Modal } from '../common/Modal'
import type { Personagem, PersonagemStatus, PersonagemTipo } from '../../data/types'

interface PersonagemFormModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<Personagem, 'id' | 'localIds'>) => void
}

export function PersonagemFormModal({ open, onClose, onSave }: PersonagemFormModalProps) {
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState<PersonagemTipo>('npc')
  const [papel, setPapel] = useState('')
  const [faccao, setFaccao] = useState('')
  const [status, setStatus] = useState<PersonagemStatus>('vivo')
  const [descricao, setDescricao] = useState('')
  const [visivel, setVisivel] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setNome(''); setTipo('npc'); setPapel(''); setFaccao(''); setStatus('vivo'); setDescricao(''); setVisivel(true); setError('')
  }, [open])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim()) { setError('Dê um nome ao personagem antes de salvar.'); return }
    onSave({ nome: nome.trim(), tipo, papel: papel || undefined, faccao: faccao || undefined, status, descricao, visivelParaTodos: visivel })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Novo personagem"
      title="Adicionar à Rede de Relações"
      footer={<>
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        <button type="submit" form="personagem-form" className="btn btn-primary">Salvar</button>
      </>}
    >
      <form id="personagem-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="p-nome">Nome</label>
          <input id="p-nome" className="input" value={nome} onChange={(e) => setNome(e.target.value)} autoFocus />
          {error && <span className="field-hint" style={{ color: 'var(--color-danger)' }}>{error}</span>}
        </div>
        <div className="dialog__group-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="field">
            <label>Tipo</label>
            <select className="select" value={tipo} onChange={(e) => setTipo(e.target.value as PersonagemTipo)}>
              <option value="npc">NPC</option>
              <option value="pj">PJ</option>
            </select>
          </div>
          <div className="field">
            <label>Status</label>
            <select className="select" value={status} onChange={(e) => setStatus(e.target.value as PersonagemStatus)}>
              <option value="vivo">Vivo</option>
              <option value="morto">Morto</option>
              <option value="desaparecido">Desaparecido</option>
              <option value="desconhecido">Desconhecido</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="p-papel">Papel (opcional)</label>
          <input id="p-papel" className="input" value={papel} onChange={(e) => setPapel(e.target.value)} placeholder="Ex.: Capitã da Guarda" />
        </div>
        <div className="field">
          <label htmlFor="p-faccao">Facção (opcional)</label>
          <input id="p-faccao" className="input" value={faccao} onChange={(e) => setFaccao(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="p-desc">Descrição</label>
          <textarea id="p-desc" className="textarea" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        </div>
        <label className="row gap-2" style={{ fontSize: 13.5, cursor: 'pointer' }}>
          <input type="checkbox" checked={visivel} onChange={(e) => setVisivel(e.target.checked)} />
          Visível para os jogadores
        </label>
      </form>
    </Modal>
  )
}
