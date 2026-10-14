import type { Vinculo, VinculoTipo } from "@/api/relacoes";
import { VINCULO_TIPOS } from "@/api/relacoes";

export interface EdgeStroke {
  w: number;
  color: string;
  dash?: string;
  glyph: string;
}

/** Stroke language inherited from the parchment relations page, keyed by the eight API tipos. */
export const edgeStyle: Record<VinculoTipo, EdgeStroke> = {
  aliado: { w: 2.5, color: "var(--verdigris)", glyph: "◆" },
  vinculo_sangue: { w: 4, color: "var(--seal)", glyph: "✦" },
  amizade: { w: 1.8, color: "var(--verdigris)", glyph: "○" },
  inimizade: { w: 2, dash: "8 5", color: "var(--destructive)", glyph: "✕" },
  adversario: { w: 2, dash: "12 4 2 4", color: "var(--destructive)", glyph: "⚔" },
  romance: { w: 2, dash: "1 5", color: "var(--seal)", glyph: "♡" },
  familia: { w: 3.5, color: "var(--ochre)", glyph: "⌂" },
  conhecido: { w: 1, dash: "2 4", color: "var(--muted-foreground)", glyph: "·" },
};

const SUGGESTIONS: Record<VinculoTipo, string[]> = {
  aliado: ["mentor", "protegido", "patrono", "devedor", "segredo", "lacaio"],
  vinculo_sangue: ["lacaio"],
  amizade: ["segredo", "companheiroGuerra"],
  inimizade: ["rival", "traidor", "antigoAliado"],
  adversario: ["rival", "traidor", "antigoAliado"],
  romance: [],
  familia: ["paiMae", "irmao", "tutor"],
  conhecido: ["rival", "desconfianca", "contato"],
};

export function qualifierSuggestions(tipo: VinculoTipo) {
  const keys = [...(SUGGESTIONS[tipo] ?? [])];
  if (!keys.includes("medo")) keys.push("medo");
  return keys;
}

/** Both tips are present and distinct in the payload the server already returned. */
export function isDuasVias(v: Pick<Vinculo, "tipo_ab" | "tipo_ba">) {
  return v.tipo_ab != null && v.tipo_ba != null && v.tipo_ab !== v.tipo_ba;
}

export function edgeDisplayTipo(v: Pick<Vinculo, "tipo_ab" | "tipo_ba">): VinculoTipo | null {
  return v.tipo_ab ?? v.tipo_ba ?? null;
}

export function tipoFromPerspective(v: Vinculo, fromId: number): VinculoTipo | null {
  if (fromId === v.personagem_a_id) return v.tipo_ab ?? null;
  if (fromId === v.personagem_b_id) {
    if (v.tipo_ba != null) return v.tipo_ba;
    return v.tipo_ab ?? null;
  }
  return null;
}

export function qualFromPerspective(v: Vinculo, fromId: number) {
  if (fromId === v.personagem_a_id) return v.qualificador_ab ?? "";
  if (fromId === v.personagem_b_id) {
    if (v.tipo_ba != null) return v.qualificador_ba ?? "";
    return v.qualificador_ab ?? "";
  }
  return "";
}

export function notaFromPerspective(v: Vinculo, fromId: number) {
  if (fromId === v.personagem_a_id) return v.tipo_ab != null ? (v.nota_ab ?? "") : "";
  if (fromId === v.personagem_b_id) {
    if (v.tipo_ba != null) return v.nota_ba ?? "";
    return v.tipo_ab != null ? (v.nota_ab ?? "") : "";
  }
  return "";
}

/** Admin payload only: the server still sent the tip and flagged it as hidden from players. */
export function tipHiddenFromPlayers(v: Vinculo, fromId: number) {
  if (!isDuasVias(v)) return false;
  if (fromId === v.personagem_a_id) return v.conhecido_ab === false;
  if (fromId === v.personagem_b_id) return v.conhecido_ba === false;
  return false;
}

export function edgeMatchesTipos(v: Vinculo, active: Set<VinculoTipo>) {
  if (active.size === 0) return true;
  if (v.tipo_ab != null && active.has(v.tipo_ab)) return true;
  if (v.tipo_ba != null && active.has(v.tipo_ba)) return true;
  return false;
}

export function formatTipoWithQual(tipoLabel: string, qualificador?: string | null) {
  const qual = (qualificador ?? "").trim();
  return qual ? `${tipoLabel} (${qual})` : tipoLabel;
}

export function isVinculoTipo(value: string): value is VinculoTipo {
  return (VINCULO_TIPOS as readonly string[]).includes(value);
}
