import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ARCO_COLOR_PALETTE, suggestArcoColor } from './arcoColor.ts'

test('exclui cores já gravadas, em minúsculas', () => {
  const used = [ARCO_COLOR_PALETTE[0].toUpperCase(), ARCO_COLOR_PALETTE[1]]
  const color = suggestArcoColor(used, () => 0)
  assert.equal(color, ARCO_COLOR_PALETTE[2])
  assert.equal(used.map((item) => item.toLowerCase()).includes(color), false)
})

test('sorteia dentro do conjunto livre', () => {
  const used = [ARCO_COLOR_PALETTE[0]]
  const free = ARCO_COLOR_PALETTE.filter((color) => color !== used[0])
  assert.equal(suggestArcoColor(used, () => 0), free[0])
  assert.equal(suggestArcoColor(used, () => 0.999), free[free.length - 1])
})

test('com a paleta esgotada devolve uma cor da paleta mesmo repetida', () => {
  const color = suggestArcoColor([...ARCO_COLOR_PALETTE], () => 0)
  assert.equal(color, ARCO_COLOR_PALETTE[0])
  assert.equal(ARCO_COLOR_PALETTE.includes(color), true)
})
