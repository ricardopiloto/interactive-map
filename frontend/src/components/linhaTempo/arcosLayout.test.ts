import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { Arco, Evento, Sessao } from '../../types.ts'
import {
  computeArcosLayout,
  DOT_RADIUS,
  LANES_LEFT,
  ROW_HEIGHT,
} from './arcosLayout.ts'

function arco(id: number, ordem = id): Arco {
  return { id, titulo: `Arco ${id}`, resumo: '', ordem, cor: '#112233' }
}

function sessao(
  partial: Partial<Sessao> & Pick<Sessao, 'id' | 'numero'>,
): Sessao {
  return {
    titulo: `Sessão ${partial.numero}`,
    resumo: '',
    locais: [],
    personagens: [],
    ...partial,
  }
}

function evento(
  id: number,
  sessaoId: number,
  ano: number,
  mes?: number | null,
): Evento {
  return {
    id,
    titulo: `Evento ${id}`,
    ano,
    mes,
    descricao: '',
    sessao_id: sessaoId,
    locais: [],
    personagens: [],
  }
}

function center(y: number): number {
  return y + ROW_HEIGHT / 2
}

test('ordena do arco mais novo para o mais antigo e, dentro dele, pelo número decrescente', () => {
  const sessoes = [
    sessao({ id: 1, numero: 1, arco_id: 1 }),
    sessao({ id: 2, numero: 10, arco_id: 1 }),
    sessao({ id: 3, numero: 3, arco_id: 1 }),
    sessao({ id: 4, numero: 8, arco_id: 1 }),
    sessao({ id: 5, numero: 2, arco_id: 1 }),
    sessao({ id: 6, numero: 4, arco_id: 1 }),
  ]
  const eventos = [
    evento(1, 1, 2510, 5),
    evento(2, 2, 2520, 1),
    evento(3, 5, 2515, 0),
    evento(4, 5, 2512, 3),
    evento(5, 6, 2520, null),
  ]
  const layout = computeArcosLayout([arco(1)], sessoes, eventos)
  assert.deepEqual(
    layout.rows.map((row) => row.sessao.id),
    [2, 4, 6, 3, 5, 1],
  )
})

test('uma data mais recente não tira a aventura da ordem do arco', () => {
  const sessoes = [
    sessao({ id: 9, numero: 9, arco_id: 1 }),
    sessao({ id: 3, numero: 3, arco_id: 2 }),
    sessao({ id: 2, numero: 2, arco_id: 1 }),
    sessao({ id: 1, numero: 1, arco_id: 1 }),
    sessao({ id: 12, numero: 12, arco_id: 3 }),
    sessao({ id: 8, numero: 8, arco_id: 2 }),
  ]
  const eventos = [
    evento(1, 9, 2520, 6),
    evento(2, 3, 2520, 4),
    evento(3, 2, 2520, 3),
    evento(4, 1, 2520, 1),
    evento(5, 12, 2519, 6),
    evento(6, 8, 2519, 1),
  ]
  const layout = computeArcosLayout([arco(1, 1), arco(2, 2), arco(3, 3)], sessoes, eventos)
  assert.deepEqual(
    layout.rows.map((row) => row.sessao.numero),
    [12, 8, 3, 9, 2, 1],
  )
  assert.deepEqual(
    layout.rows.map((row) => row.sessao.arco_id),
    [3, 2, 2, 1, 1, 1],
  )
})

test('história linear de arcos diferentes fica numa coluna, sem curva', () => {
  const sessoes = [
    sessao({ id: 1, numero: 3, arco_id: 1 }),
    sessao({ id: 2, numero: 2, arco_id: 2 }),
    sessao({ id: 3, numero: 1 }),
  ]
  const eventos = [evento(1, 1, 2522, 6), evento(2, 2, 2521, 6), evento(3, 3, 2520, 6)]
  const layout = computeArcosLayout([arco(1, 1), arco(2, 2)], sessoes, eventos)
  assert.equal(layout.columns.length, 1)
  assert.equal(layout.columns[0].x, LANES_LEFT)
  assert.equal(layout.connectors.length, 2)
  assert.ok(layout.connectors.every((c) => c.orientation === 'vertical' && c.x1 === LANES_LEFT && c.x2 === LANES_LEFT))
})

test('data intercalada não parte as aventuras do mesmo arco', () => {
  const sessoes = [
    sessao({ id: 1, numero: 3, arco_id: 1 }),
    sessao({ id: 2, numero: 2, arco_id: 2 }),
    sessao({ id: 3, numero: 1, arco_id: 1 }),
  ]
  const eventos = [evento(1, 1, 2522, 6), evento(2, 2, 2521, 6), evento(3, 3, 2520, 6)]
  const layout = computeArcosLayout([arco(1, 1), arco(2, 2)], sessoes, eventos)
  assert.deepEqual(
    layout.rows.map((row) => row.sessao.id),
    [2, 1, 3],
  )
  assert.equal(layout.columns.length, 1)
  const vertical = layout.connectors.filter((c) => c.orientation === 'vertical' && c.x1 === LANES_LEFT)
  assert.equal(vertical.length, 2)
  assert.equal(vertical[0].y1, center(0) + DOT_RADIUS)
  assert.equal(vertical[0].y2, center(ROW_HEIGHT) - DOT_RADIUS)
})

test('a mesma data em arcos diferentes ocupa colunas diferentes', () => {
  const sessoes = [
    sessao({ id: 1, numero: 2, arco_id: 1 }),
    sessao({ id: 2, numero: 1, arco_id: 2 }),
  ]
  const eventos = [evento(1, 1, 2520, 4), evento(2, 2, 2520, 4)]
  const layout = computeArcosLayout([arco(1), arco(2)], sessoes, eventos)
  const x1 = layout.dotsByLane.get('1')?.[0].x
  const x2 = layout.dotsByLane.get('2')?.[0].x
  assert.notEqual(x1, x2)
  assert.equal(layout.connectors.some((c) => c.orientation === 'curve'), true)
})

test('a mesma coluna liga na vertical', () => {
  const sessoes = [
    sessao({ id: 1, numero: 2, arco_id: 1 }),
    sessao({ id: 2, numero: 1, arco_id: 1 }),
  ]
  const eventos = [evento(1, 1, 2522, 1), evento(2, 2, 2521, 1)]
  const layout = computeArcosLayout([arco(1)], sessoes, eventos)
  assert.equal(layout.connectors.length, 1)
  assert.equal(layout.connectors[0].orientation, 'vertical')
  assert.equal(layout.connectors[0].x1, LANES_LEFT)
  assert.equal(layout.connectors[0].y2, center(ROW_HEIGHT) - DOT_RADIUS)
})

test('transição na mesma coluna é um único ponto', () => {
  const sessoes = [sessao({ id: 1, numero: 1, arco_id: 1, arco_transicao_id: 2 })]
  const layout = computeArcosLayout([arco(1, 1), arco(2, 2)], sessoes, [])
  assert.equal(layout.rows.length, 1)
  assert.equal(layout.columns.length, 1)
  assert.equal(layout.connectors.length, 0)
})

test('transição em colunas diferentes encontra-se na linha da sessão', () => {
  const sessoes = [
    sessao({ id: 1, numero: 4, arco_id: 1 }),
    sessao({ id: 2, numero: 3, arco_id: 1, arco_transicao_id: 2 }),
    sessao({ id: 3, numero: 2, arco_id: 2 }),
    sessao({ id: 4, numero: 1, arco_id: 1 }),
  ]
  const eventos = [
    evento(1, 1, 2522, 6),
    evento(2, 2, 2521, 6),
    evento(3, 3, 2521, 1),
    evento(4, 4, 2520, 6),
  ]
  const layout = computeArcosLayout([arco(1, 1), arco(2, 2)], sessoes, eventos)
  assert.deepEqual(
    layout.rows.map((row) => row.sessao.id),
    [3, 1, 2, 4],
  )
  assert.equal(layout.rows.length, 4)
  assert.equal(layout.columns.length, 1)
  assert.equal(
    layout.connectors.some((c) => c.y1 === c.y2),
    false,
  )
})

test('filtro fecha a coluna extra e não desenha o arco oculto', () => {
  const arcos = [arco(1, 1), arco(2, 2)]
  const sessoes = [
    sessao({ id: 1, numero: 3, arco_id: 1 }),
    sessao({ id: 2, numero: 2, arco_id: 2 }),
    sessao({ id: 3, numero: 1, arco_id: 1 }),
  ]
  const eventos = [evento(1, 1, 2522), evento(2, 2, 2521), evento(3, 3, 2520)]
  const filtered = computeArcosLayout(arcos, sessoes, eventos, new Set(['1']))
  assert.equal(filtered.columns.length, 1)
  assert.deepEqual(
    filtered.rows.map((row) => row.sessao.id),
    [1, 3],
  )
  assert.equal(filtered.connectors.length, 1)
  assert.equal(filtered.connectors[0].orientation, 'vertical')
  assert.equal(filtered.connectors[0].x1, LANES_LEFT)
  assert.equal(filtered.connectors.some((c) => c.colorKey === '2'), false)
})

test('intervalo entre arcos fica tracejado com o tempo decorrido', () => {
  const sessoes = [
    sessao({ id: 1, numero: 2, arco_id: 1 }),
    sessao({ id: 2, numero: 1, arco_id: 1 }),
    sessao({ id: 3, numero: 1, arco_id: 2 }),
  ]
  const eventos = [
    evento(1, 1, 2520, 6),
    evento(2, 2, 2520, 4),
    evento(3, 3, 2520, 1),
  ]
  const layout = computeArcosLayout([arco(1, 1), arco(2, 2)], sessoes, eventos)
  assert.deepEqual(
    layout.rows.map((row) => row.sessao.id),
    [3, 1, 2],
  )
  const between = layout.connectors[0]
  assert.equal(between.orientation, 'vertical')
  assert.equal(between.dashed, true)
  assert.equal(between.years, 0)
  assert.equal(between.months, 5)
  const inside = layout.connectors[1]
  assert.equal(inside.dashed, false)
  assert.equal(inside.months, 2)
})

test('intervalo entre arcos em colunas diferentes também fica tracejado', () => {
  const sessoes = [
    sessao({ id: 1, numero: 3, arco_id: 2 }),
    sessao({ id: 2, numero: 2, arco_id: 2 }),
    sessao({ id: 3, numero: 1, arco_id: 2 }),
    sessao({ id: 4, numero: 1, arco_id: 1 }),
  ]
  const eventos = [
    evento(1, 1, 2520, 8),
    evento(2, 2, 2520, 1),
    evento(3, 3, 2520, 6),
    evento(4, 4, 2520, 1),
  ]
  const layout = computeArcosLayout([arco(1, 1), arco(2, 2)], sessoes, eventos)
  assert.deepEqual(
    layout.rows.map((row) => row.sessao.id),
    [1, 2, 3, 4],
  )
  const bridge = layout.connectors.find((c) => c.orientation === 'curve' && c.dashed)
  assert.ok(bridge)
  assert.equal(bridge.years, 0)
  assert.equal(bridge.months, 5)
  assert.notEqual(bridge.x1, bridge.x2)
})

test('intervalo de mais de 12 meses fica tracejado e expõe anos e meses', () => {
  const sessoes = [
    sessao({ id: 1, numero: 2, arco_id: 1 }),
    sessao({ id: 2, numero: 1, arco_id: 1 }),
  ]
  const exact = computeArcosLayout(
    [arco(1)],
    sessoes,
    [evento(1, 1, 2522, 1), evento(2, 2, 2521, 1)],
  )
  assert.equal(exact.connectors[0].dashed, false)
  assert.equal(exact.connectors[0].years, 1)
  assert.equal(exact.connectors[0].months, 0)

  const long = computeArcosLayout(
    [arco(1)],
    sessoes,
    [evento(1, 1, 2522, 2), evento(2, 2, 2521, 1)],
  )
  assert.equal(long.connectors[0].dashed, true)
  assert.equal(long.connectors[0].years, 1)
  assert.equal(long.connectors[0].months, 1)

  const undated = computeArcosLayout([arco(1)], sessoes, [evento(1, 1, 2522, 1)])
  assert.equal(undated.connectors[0].dashed, false)
  assert.equal(undated.connectors[0].years, null)
  assert.equal(undated.connectors[0].months, null)
})
