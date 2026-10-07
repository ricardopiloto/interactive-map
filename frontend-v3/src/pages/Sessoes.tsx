import { Link } from 'react-router-dom'
import { IconNotebook } from '@tabler/icons-react'
import { sessoes, capitulos, arcos } from '../data/mock'
import { Pill } from '../components/ui'
import { WikiText } from '../components/WikiText'

export function Sessoes() {
  const ordenadas = [...sessoes].sort((a, b) => b.numero - a.numero)

  return (
    <div className="page page--sessoes">
      <ol className="sessao-list">
        {ordenadas.map((s) => {
          const capitulo = capitulos.find((c) => c.id === s.capituloId)
          const arco = arcos.find((a) => a.id === s.arcoId)
          return (
            <li key={s.id} className="sessao-card">
              <div className="sessao-card__head">
                <div>
                  <p className="text-muted">
                    Sessão {s.numero} ·{' '}
                    {new Date(s.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                  <h2>{s.titulo}</h2>
                </div>
                {arco ? <Pill cor={arco.cor}>{arco.titulo}</Pill> : null}
              </div>
              <WikiText className="sessao-card__resumo">{s.resumo}</WikiText>
              {capitulo ? (
                <Link to={`/prep/${capitulo.id}`} className="sessao-card__capitulo">
                  <IconNotebook size={14} aria-hidden />
                  Capítulo jogado: {capitulo.titulo}
                </Link>
              ) : (
                <p className="text-muted sessao-card__capitulo">Sem capítulo de preparação vinculado.</p>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
