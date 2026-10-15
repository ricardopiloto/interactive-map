import { describe, expect, it } from "vitest";
import { campaignRoute, destination } from "./navigation";

describe("React Router navigation", () => {
  it("preserves selected entities in the URL", () => {
    expect(destination("/relacoes", { p: "ela & nico", empty: undefined })).toBe(
      "/relacoes?p=ela+%26+nico",
    );
  });

  it("preserva o endereço canônico de dois segmentos ao trocar de sub-rota", () => {
    expect(campaignRoute("/relacoes", "/c/4/mesa-aberta/mapa")).toBe("/c/4/mesa-aberta/relacoes");
    expect(campaignRoute("/rota", "/c/mesa-aberta/mapa")).toBe("/c/mesa-aberta/rota");
  });
});
