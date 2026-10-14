import { expect, it } from "vitest";
import type { Vinculo } from "@/api/relacoes";
import {
  edgeMatchesTipos,
  formatTipoWithQual,
  isDuasVias,
  qualFromPerspective,
  tipoFromPerspective,
} from "./vinculoView";

function bond(patch: Partial<Vinculo> & Pick<Vinculo, "id">): Vinculo {
  return {
    personagem_a_id: 1,
    personagem_b_id: 2,
    publico: true,
    ...patch,
  };
}

it("reconhece duas vias só quando o payload traz os dois tipos distintos", () => {
  expect(isDuasVias(bond({ id: 1, tipo_ab: "aliado", tipo_ba: "conhecido" }))).toBe(true);
  expect(isDuasVias(bond({ id: 2, tipo_ab: "aliado" }))).toBe(false);
  expect(isDuasVias(bond({ id: 3, tipo_ba: "amizade" }))).toBe(false);
});

it("mostra o qualificador de cada sentido e não inventa o tipo omitido pelo servidor", () => {
  const full = bond({
    id: 1,
    tipo_ab: "aliado",
    tipo_ba: "conhecido",
    qualificador_ab: "Mentor",
    qualificador_ba: "Lacaio",
  });
  expect(formatTipoWithQual("Aliado", qualFromPerspective(full, 1))).toBe("Aliado (Mentor)");
  expect(formatTipoWithQual("Conhecido", qualFromPerspective(full, 2))).toBe("Conhecido (Lacaio)");

  const redacted = bond({
    id: 2,
    tipo_ab: "aliado",
    qualificador_ab: "Mentor",
    nota_ab: "nota-publica",
  });
  expect(tipoFromPerspective(redacted, 1)).toBe("aliado");
  expect(tipoFromPerspective(redacted, 2)).toBe("aliado");
  expect(qualFromPerspective(redacted, 2)).toBe("Mentor");
  expect(JSON.stringify(redacted)).not.toContain("Lacaio");
});

it("filtra pelo tipo presente em qualquer sentido", () => {
  const full = bond({ id: 1, tipo_ab: "aliado", tipo_ba: "romance" });
  expect(edgeMatchesTipos(full, new Set(["romance"]))).toBe(true);
  expect(edgeMatchesTipos(full, new Set(["amizade"]))).toBe(false);
  expect(edgeMatchesTipos(full, new Set())).toBe(true);
});
