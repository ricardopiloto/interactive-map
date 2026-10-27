import { afterEach, expect, it, vi } from "vitest";
import { indiceIaApi } from "./indiceIa";

afterEach(() => vi.unstubAllGlobals());

it("consulta e reindexa pelo slug da campanha com credenciais", async () => {
  const fetchMock = vi.fn().mockImplementation(() =>
    Promise.resolve(
      new Response(
        JSON.stringify({ estado: "ok", registros: 2, trechos: 3, atualizado_em: null }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    ),
  );
  vi.stubGlobal("fetch", fetchMock);
  expect((await indiceIaApi.estado("mesa aberta")).registros).toBe(2);
  expect((await indiceIaApi.reindexar("mesa aberta")).trechos).toBe(3);
  expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
    "/api/c/mesa%20aberta/admin/ia/indice",
    "/api/c/mesa%20aberta/admin/ia/indice/reindexar",
  ]);
  expect(fetchMock.mock.calls.map(([, init]) => [init.method, init.credentials])).toEqual([
    [undefined, "include"],
    ["POST", "include"],
  ]);
});
