import {
  DEFAULT_PIN_COLOR,
  type EstadoExploracao,
  type Local,
  type Npc,
  type NpcStatus,
} from "@/api/map";

export interface LocalDraft {
  id?: number;
  nome: string;
  descricao: string;
  data_sessao: string;
  estado_exploracao: EstadoExploracao;
  arco_id: number | null;
  npc_ids: number[];
  saida_ids: number[];
  x: number;
  y: number;
  imagem_url: string | null;
  cor_pin: string;
  waypoint_id: number | null;
  visivel_para_todos: boolean;
  isNew: boolean;
}

export interface NpcDraft {
  id?: number;
  nome: string;
  papel: string;
  descricao: string;
  faccao: string;
  status: NpcStatus;
  retrato_url: string | null;
  localIds: number[];
  isNew: boolean;
}

export function emptyLocalDraft(
  x: number,
  y: number,
  defaultArcoId: number | null = null,
): LocalDraft {
  return {
    nome: "",
    descricao: "",
    data_sessao: "",
    estado_exploracao: "conhecido",
    arco_id: defaultArcoId,
    npc_ids: [],
    saida_ids: [],
    x,
    y,
    imagem_url: null,
    cor_pin: DEFAULT_PIN_COLOR,
    waypoint_id: null,
    visivel_para_todos: true,
    isNew: true,
  };
}

export function localToDraft(local: Local): LocalDraft {
  return {
    id: local.id,
    nome: local.nome,
    descricao: local.descricao,
    data_sessao: local.data_sessao ?? "",
    estado_exploracao: local.estado_exploracao,
    arco_id: local.arco_id,
    npc_ids: local.npc_ids,
    saida_ids: local.saida_ids,
    x: local.x,
    y: local.y,
    imagem_url: local.imagem_url,
    cor_pin: local.cor_pin,
    waypoint_id: local.waypoint_id ?? null,
    visivel_para_todos: local.visivel_para_todos ?? true,
    isNew: false,
  };
}

export function emptyNpcDraft(localId?: number): NpcDraft {
  return {
    nome: "",
    papel: "",
    descricao: "",
    faccao: "",
    status: "desconhecido",
    retrato_url: null,
    localIds: localId == null ? [] : [localId],
    isNew: true,
  };
}

export function npcToDraft(npc: Npc): NpcDraft {
  return {
    id: npc.id,
    nome: npc.nome,
    papel: npc.papel ?? "",
    descricao: npc.descricao,
    faccao: npc.faccao ?? "",
    status: npc.status ?? "desconhecido",
    retrato_url: npc.retrato_url,
    localIds: npc.local_ids,
    isNew: false,
  };
}
