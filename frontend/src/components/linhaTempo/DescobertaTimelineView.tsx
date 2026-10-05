import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Chip, EmptyState } from '../ui'
import type { AlertaInconsistencia, EntidadeDescoberta, IntervaloAparicao } from '../../types'
import './DescobertaTimelineView.css'

const TIPOS = ['personagem', 'local', 'faccao', 'item'] as const
type TipoFiltro = (typeof TIPOS)[number] | 'todos'

interface DescobertaTimelineViewProps {
  entidades: EntidadeDescoberta[]
  alertas: AlertaInconsistencia[]
  mostrarAlertas: boolean
  onBackToCronologico: () => void
}

function intervaloLabel(
  t: (key: string, opts?: Record<string, unknown>) => string,
  intervalo: IntervaloAparicao,
) {
  if (intervalo.anos > 0) {
    return t('descoberta.intervalYears', { count: intervalo.anos, meses: intervalo.meses })
  }
  if (intervalo.meses > 0) {
    return t('descoberta.intervalMonths', { count: intervalo.meses })
  }
  if (intervalo.sessoes != null && intervalo.sessoes > 0) {
    return t('descoberta.intervalSessions', { count: intervalo.sessoes })
  }
  return t('descoberta.intervalSame')
}

function rotuloAparicao(
  t: (key: string, opts?: Record<string, unknown>) => string,
  aparicao: EntidadeDescoberta['aparicoes'][number],
) {
  if (aparicao.origem === 'sessao' && aparicao.numero != null) {
    return t('sessionMeta', { numero: aparicao.numero, titulo: aparicao.titulo })
  }
  if (aparicao.ano != null && aparicao.mes != null) {
    return `${aparicao.titulo} · ${t('yearMonthLabel', { ano: aparicao.ano, mes: aparicao.mes })}`
  }
  if (aparicao.ano != null) {
    return `${aparicao.titulo} · ${t('yearLabel', { ano: aparicao.ano })}`
  }
  return aparicao.titulo
}

export function DescobertaTimelineView({
  entidades,
  alertas,
  mostrarAlertas,
  onBackToCronologico,
}: DescobertaTimelineViewProps) {
  const { t } = useTranslation('linhaTempo')
  const [filtro, setFiltro] = useState<TipoFiltro>('todos')

  const grupos = useMemo(() => {
    const fonte = filtro === 'todos' ? entidades : entidades.filter((e) => e.tipo === filtro)
    return TIPOS.map((tipo) => ({
      tipo,
      itens: fonte.filter((e) => e.tipo === tipo),
    })).filter((grupo) => grupo.itens.length > 0)
  }, [entidades, filtro])

  if (entidades.length === 0) {
    return (
      <div className="descoberta-timeline__vazio">
        <EmptyState title={t('descoberta.emptyTitle')} description={t('descoberta.emptyBody')} />
        <Button type="button" variant="secondary" onClick={onBackToCronologico}>
          {t('descoberta.backToCronologico')}
        </Button>
      </div>
    )
  }

  return (
    <div className="descoberta-timeline">
      {mostrarAlertas && alertas.length > 0 ? (
        <ul className="descoberta-timeline__alertas">
          {alertas.map((alerta) => (
            <li key={`${alerta.sessao_visivel_id}-${alerta.personagem_id}-${alerta.sessao_oculta_id}`}>
              {t('descoberta.alerta', {
                personagem: alerta.personagem_nome,
                oculta: alerta.sessao_oculta_numero,
                titulo: alerta.sessao_oculta_titulo,
                visivel: alerta.sessao_visivel_numero,
              })}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="descoberta-timeline__filtros" role="group" aria-label={t('descoberta.filterAria')}>
        <Chip
          aria-pressed={filtro === 'todos'}
          variant={filtro === 'todos' ? 'accent' : 'outline'}
          onClick={() => setFiltro('todos')}
        >
          {t('descoberta.filterTodos')}
        </Chip>
        {TIPOS.map((tipo) => (
          <Chip
            key={tipo}
            aria-pressed={filtro === tipo}
            variant={filtro === tipo ? 'accent' : 'outline'}
            onClick={() => setFiltro(tipo)}
          >
            {t(`descoberta.tipo_${tipo}`)}
          </Chip>
        ))}
      </div>

      {grupos.length === 0 ? (
        <p className="descoberta-timeline__filter-empty">{t('descoberta.filterEmpty')}</p>
      ) : (
        grupos.map((grupo) => (
          <section key={grupo.tipo} className="descoberta-timeline__grupo" aria-label={t(`descoberta.tipo_${grupo.tipo}`)}>
            <h2 className="descoberta-timeline__grupo-titulo">{t(`descoberta.tipo_${grupo.tipo}`)}</h2>
            <ol className="descoberta-timeline__lista">
              {grupo.itens.map((entidade) => {
                const primeira = entidade.aparicoes[0]
                const resto = entidade.aparicoes.slice(1)
                return (
                  <li key={`${entidade.tipo}-${entidade.id ?? entidade.nome}`} className="descoberta-timeline__card">
                    <h3 className="descoberta-timeline__nome">{entidade.nome}</h3>
                    {entidade.descricao ? (
                      <p className="descoberta-timeline__descricao">{entidade.descricao}</p>
                    ) : null}
                    {primeira ? (
                      <p className="descoberta-timeline__primeira">
                        <span className="descoberta-timeline__rotulo">{t('descoberta.first')}</span>{' '}
                        {rotuloAparicao(t, primeira)}
                        {mostrarAlertas && primeira.visivel_para_todos === false ? (
                          <span className="descoberta-timeline__oculto"> · {t('hiddenBadge')}</span>
                        ) : null}
                      </p>
                    ) : null}
                    {resto.length > 0 ? (
                      <ul className="descoberta-timeline__reaparicoes">
                        {resto.map((aparicao) => (
                          <li key={`${aparicao.origem}-${aparicao.id}`}>
                            <span className="descoberta-timeline__rotulo">{t('descoberta.reappearance')}</span>{' '}
                            {rotuloAparicao(t, aparicao)}
                            {aparicao.intervalo ? (
                              <span className="descoberta-timeline__intervalo">
                                {' '}
                                · {intervaloLabel(t, aparicao.intervalo)}
                              </span>
                            ) : null}
                            {mostrarAlertas && aparicao.visivel_para_todos === false ? (
                              <span className="descoberta-timeline__oculto"> · {t('hiddenBadge')}</span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                )
              })}
            </ol>
          </section>
        ))
      )}
    </div>
  )
}
