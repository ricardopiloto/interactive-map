import { afterEach, expect, it, vi } from "vitest";
import { listItensPublicos } from "./timeline";

afterEach(() => vi.unstubAllGlobals());

it("listItensPublicos chama GET /api/c/{slug}/itens e tipa a resposta pública", async () => {
  const payload = {
    itens: [
      {
        id: 7,
        nome: "Amuleto",
        descricao: "**Brilhante**",
        sessoes: [{ id: 1, numero: 3, titulo: "Chegada" }],
        eventos: [{ id: 2, titulo: "Descoberta", ano: 2520, mes: 4 }],
      },
    ],
  };
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(payload), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );
  vi.stubGlobal("fetch", fetchMock);

  const result = await listItensPublicos("mesa-aberta");

  expect(fetchMock.mock.calls[0]?.[0]).toBe("/api/c/mesa-aberta/itens");
  expect(fetchMock.mock.calls[0]?.[1].credentials).toBe("include");
  expect(result).toEqual(payload);
  expect(result.itens[0]).not.toHaveProperty("visivel_para_todos");
});
