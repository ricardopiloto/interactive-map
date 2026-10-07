import { useState } from 'react'
import { Link } from 'react-router-dom'
import { eventos, arcos, sessoes } from '../data/mock'
import { Pill } from '../components/ui'

type Modo = 'cronologica' | 'arcos'

export function Timeline() {
  const [modo, setModo] = useState<Modo>('cronologica')
  const ordenados = [...eventos].sort((a, b) => a.ano - b.ano || (a.mes ?? 0) - (b.mes ?? 0))

  return (
    <div className="page page--timeline">
      <div className="timeline-toolbar">
        <div className="segmented">
          <button
            type="button"
            className={modo === 'cronologica' ? 'segmented__btn segmented__btn--active' : 'segmented__btn'}
            onClick={() => setModo('cronologica')}
          >
            Cronológica
          </button>
          <button
            type="button"
            className={modo === 'arcos' ? 'segmented__btn segmented__btn--active' : 'segmented__btn'}
            onClick={() => setModo('arcos')}
          >
            Por arcos
          </button>
        </div>
      </div>

      {modo === 'cronologica' ? (
        <ol className="timeline-list">
          {ordenados.map((ev) => {
            const arco = arcos.find((a) => a.id === ev.arcoId)
            const sessao = sessoes.find((s) => s.id === ev.sessaoId)
            return (
              <li key={ev.id} className="timeline-item">
                <div className="timeline-item__marker" style={{ background: arco?.cor ?? 'var(--text-muted)' }} />
                <div className="timeline-item__body">
                  <div className="timeline-item__head">
                    <strong>{ev.titulo}</strong>
                    <span className="text-muted">
                      {ev.ano} {ev.mes ? `· mês ${ev.mes}` : ''}
                    </span>
                  </div>
                  <p className="text-muted">{ev.descricao}</p>
                  <div className="timeline-item__tags">
                    {arco ? <Pill cor={arco.cor}>{arco.titulo}</Pill> : null}
                    {sessao ? (
                      <Link to="/sessoes" className="link-quiet">
                        Sessão {sessao.numero}
                      </Link>
                    ) : null}
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      ) : (
        <div className="timeline-lanes">
          {arcos.map((arco) => (
            <div key={arco.id} className="timeline-lane">
              <div className="timeline-lane__head" style={{ borderColor: arco.cor, color: arco.cor }}>
                {arco.titulo}
              </div>
              <ol className="timeline-lane__list">
                {ordenados
                  .filter((ev) => ev.arcoId === arco.id)
                  .map((ev) => (
                    <li key={ev.id} className="timeline-lane__item" style={{ borderColor: arco.cor }}>
                      <strong>{ev.titulo}</strong>
                      <span className="text-muted">{ev.ano}</span>
                    </li>
                  ))}
              </ol>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
