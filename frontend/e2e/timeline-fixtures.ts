import type { APIRequestContext } from '@playwright/test'
import type { E2ESession } from './helpers'

export type TimelineFixture = {
  prefix: string
  titles: {
    visibleFull: string
    visibleHiddenSession: string
    hiddenEvent: string
    withMonth: string
    bare: string
  }
  sessionVisible: { id: number; numero: number; titulo: string }
  sessionHidden: { id: number; numero: number; titulo: string }
  localVisibleName: string
  localHiddenName: string
  personagemVisibleName: string
  personagemHiddenName: string
  eventWithMonthId: number
  cleanup: () => Promise<void>
}

function originHeaders(session: E2ESession): Record<string, string> {
  return { Origin: session.origin }
}

async function postJson(
  request: APIRequestContext,
  session: E2ESession,
  url: string,
  data: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const response = await request.post(url, { data, headers: originHeaders(session) })
  if (!response.ok()) {
    throw new Error(`POST ${url} failed: ${response.status()} ${await response.text()}`)
  }
  return (await response.json()) as Record<string, unknown>
}

async function del(
  request: APIRequestContext,
  session: E2ESession,
  url: string,
): Promise<void> {
  await request.delete(url, { headers: originHeaders(session) })
}

/** Seed unique timeline events/sessions for spec 144 E2E; cleans up on teardown. */
export async function seedTimeline(
  request: APIRequestContext,
  session: E2ESession,
): Promise<TimelineFixture> {
  const prefix = `TL144-${Date.now()}-${Math.floor(Math.random() * 10000)}`
  const base = `/api/c/${session.slug}/admin`
  const eventIds: number[] = []
  const sessaoIds: number[] = []
  const localIds: number[] = []
  const personagemIds: number[] = []

  const prox = await request.get(`${base}/sessoes/proximo-numero`)
  if (!prox.ok()) throw new Error(`proximo-numero failed: ${prox.status()} ${await prox.text()}`)
  let numero = ((await prox.json()) as { numero: number }).numero

  const sessionVisibleTitulo = `${prefix}-sessao-visivel`
  const sessionHiddenTitulo = `${prefix}-sessao-oculta`
  const sv = await postJson(request, session, `${base}/sessoes`, {
    numero,
    titulo: sessionVisibleTitulo,
    resumo: '',
    visivel_para_todos: true,
  })
  sessaoIds.push(sv.id as number)
  const sessionVisible = {
    id: sv.id as number,
    numero,
    titulo: sessionVisibleTitulo,
  }
  numero += 1

  const sh = await postJson(request, session, `${base}/sessoes`, {
    numero,
    titulo: sessionHiddenTitulo,
    resumo: '',
    visivel_para_todos: false,
  })
  sessaoIds.push(sh.id as number)
  const sessionHidden = {
    id: sh.id as number,
    numero,
    titulo: sessionHiddenTitulo,
  }

  const localVisibleName = `${prefix}-local-visivel`
  const localHiddenName = `${prefix}-local-oculto`
  const lv = await postJson(request, session, `${base}/locais`, {
    nome: localVisibleName,
    x: 0.21,
    y: 0.31,
    cor_pin: '#334455',
    visivel_para_todos: true,
  })
  localIds.push(lv.id as number)
  const lh = await postJson(request, session, `${base}/locais`, {
    nome: localHiddenName,
    x: 0.22,
    y: 0.32,
    cor_pin: '#445566',
    visivel_para_todos: false,
  })
  localIds.push(lh.id as number)

  const personagemVisibleName = `${prefix}-pj-visivel`
  const personagemHiddenName = `${prefix}-pj-oculto`
  const pv = await postJson(request, session, `${base}/personagens`, {
    nome: personagemVisibleName,
    tipo: 'pj',
    status: 'vivo',
    visivel_para_todos: true,
  })
  personagemIds.push(pv.id as number)
  const ph = await postJson(request, session, `${base}/personagens`, {
    nome: personagemHiddenName,
    tipo: 'npc',
    status: 'vivo',
    visivel_para_todos: false,
  })
  personagemIds.push(ph.id as number)

  const titles = {
    visibleFull: `${prefix}-evento-completo`,
    visibleHiddenSession: `${prefix}-evento-sessao-oculta`,
    hiddenEvent: `${prefix}-evento-oculto`,
    withMonth: `${prefix}-evento-com-mes`,
    bare: `${prefix}-evento-simples`,
  }

  const full = await postJson(request, session, `${base}/eventos`, {
    titulo: titles.visibleFull,
    ano: 2400,
    rotulo_era: 'Era E2E',
    descricao: `${prefix}-descricao-visivel`,
    visivel_para_todos: true,
    sessao_id: sessionVisible.id,
    local_ids: [lv.id, lh.id],
    personagem_ids: [pv.id, ph.id],
  })
  eventIds.push(full.id as number)

  const withHiddenSessao = await postJson(request, session, `${base}/eventos`, {
    titulo: titles.visibleHiddenSession,
    ano: 2401,
    descricao: `${prefix}-desc-sessao-oculta`,
    visivel_para_todos: true,
    sessao_id: sessionHidden.id,
  })
  eventIds.push(withHiddenSessao.id as number)

  const hidden = await postJson(request, session, `${base}/eventos`, {
    titulo: titles.hiddenEvent,
    ano: 2402,
    descricao: 'segredo',
    visivel_para_todos: false,
  })
  eventIds.push(hidden.id as number)

  const withMonth = await postJson(request, session, `${base}/eventos`, {
    titulo: titles.withMonth,
    ano: 2399,
    mes: 7,
    descricao: 'com mes legado',
    visivel_para_todos: true,
  })
  eventIds.push(withMonth.id as number)

  const bare = await postJson(request, session, `${base}/eventos`, {
    titulo: titles.bare,
    ano: 2403,
    visivel_para_todos: true,
  })
  eventIds.push(bare.id as number)

  return {
    prefix,
    titles,
    sessionVisible,
    sessionHidden,
    localVisibleName,
    localHiddenName,
    personagemVisibleName,
    personagemHiddenName,
    eventWithMonthId: withMonth.id as number,
    cleanup: async () => {
      for (const id of eventIds) await del(request, session, `${base}/eventos/${id}`)
      for (const id of sessaoIds) await del(request, session, `${base}/sessoes/${id}`)
      for (const id of localIds) await del(request, session, `${base}/locais/${id}`)
      for (const id of personagemIds) await del(request, session, `${base}/personagens/${id}`)
    },
  }
}
