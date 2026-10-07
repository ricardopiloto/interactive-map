import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { IconCheck, IconPencil, IconPlugConnected, IconInfoCircle } from '@tabler/icons-react'
import { arcos, capitulos } from '../data/mock'
import { Badge, EmptyState, Pill } from '../components/ui'
import { WikiText } from '../components/WikiText'

export function Prep() {
  const { capituloId } = useParams<{ capituloId?: string }>()
  const navigate = useNavigate()
  const [exportInfo, setExportInfo] = useState(false)
  const selecionado = capituloId ? capitulos.find((c) => c.id === capituloId) : capitulos[0]
  const arcoSelecionado = selecionado ? arcos.find((a) => a.id === selecionado.arcoId) : undefined
  const avulsos = capitulos.filter((c) => c.arcoId === null)

  return (
    <div className="page page--prep">
      <div className="prep-list-panel">
        {arcos.map((arco) => (
          <div key={arco.id} className="prep-arco-group">
            <div className="prep-arco-group__head" style={{ color: arco.cor }}>
              {arco.titulo}
            </div>
            {capitulos
              .filter((c) => c.arcoId === arco.id)
              .sort((a, b) => a.ordem - b.ordem)
              .map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`prep-cap-item${selecionado?.id === c.id ? ' prep-cap-item--active' : ''}`}
                  onClick={() => navigate(`/prep/${c.id}`)}
                >
                  {c.preparado ? (
                    <IconCheck size={14} className="prep-cap-item__icon prep-cap-item__icon--ok" aria-hidden />
                  ) : (
                    <IconPencil size={14} className="prep-cap-item__icon" aria-hidden />
                  )}
                  {c.titulo}
                </button>
              ))}
          </div>
        ))}
        {avulsos.length > 0 ? (
          <div className="prep-arco-group">
            <div className="prep-arco-group__head text-muted">Capítulos avulsos</div>
            {avulsos.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`prep-cap-item${selecionado?.id === c.id ? ' prep-cap-item--active' : ''}`}
                onClick={() => navigate(`/prep/${c.id}`)}
              >
                {c.preparado ? <IconCheck size={14} className="prep-cap-item__icon prep-cap-item__icon--ok" aria-hidden /> : <IconPencil size={14} className="prep-cap-item__icon" aria-hidden />}
                {c.titulo}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="prep-detail-panel">
        {!selecionado ? (
          <EmptyState title="Selecione um capítulo" />
        ) : (
          <article className="detail">
            <header className="detail__header">
              <div>
                <h2>{selecionado.titulo}</h2>
                <div className="detail__badges">
                  {arcoSelecionado ? <Pill cor={arcoSelecionado.cor}>{arcoSelecionado.titulo}</Pill> : <Badge tone="neutral">avulso</Badge>}
                  <Badge tone={selecionado.preparado ? 'success' : 'warning'}>
                    {selecionado.preparado ? 'preparado' : 'rascunho'}
                  </Badge>
                  {!selecionado.visivelParaTodos ? <Badge tone="neutral">oculto dos jogadores</Badge> : null}
                </div>
              </div>
              <div className="prep-detail__actions">
                <button type="button" className="btn btn--ghost" onClick={() => setExportInfo((v) => !v)}>
                  <IconPlugConnected size={15} aria-hidden /> Exportar para Foundry VTT
                </button>
              </div>
            </header>

            {exportInfo ? (
              <div className="callout callout--info">
                <IconInfoCircle size={16} aria-hidden />
                <div>
                  <strong>Em desenho.</strong> A ideia é gerar um pacote de compêndio (Journal por capítulo, NPCs
                  com a ficha renderizada, cenas para os encontros) que você importa no seu mundo Foundry — ou, num
                  passo seguinte, um módulo que sincroniza direto. Por enquanto, este botão é só a vitrine da visão.
                </div>
              </div>
            ) : null}

            <section className="detail__section">
              <WikiText>{selecionado.corpoMarkdown}</WikiText>
            </section>
          </article>
        )}
      </div>
    </div>
  )
}
