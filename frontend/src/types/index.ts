export type NPCStatus = 'vivo' | 'morto' | 'desaparecido' | 'desconhecido'
export type GrupoFormato = 'bandeira' | 'brasao'

export interface Local {
  id: number
  nome: string
  descricao: string
  x: number
  y: number
  imagem_url: string | null
  data_sessao: string | null
  arco_id: number | null
  npc_ids: number[]
  saida_ids: number[]
  cor_pin: string
}

export interface NPC {
  id: number
  nome: string
  descricao: string
  faccao: string | null
  status: NPCStatus | null
  retrato_url: string | null
  local_ids: number[]
}

export interface Arco {
  id: number
  titulo: string
  resumo: string
  ordem: number
}

export interface GrupoPosicao {
  x: number
  y: number
  formato: GrupoFormato
  atualizado_em: string
}
