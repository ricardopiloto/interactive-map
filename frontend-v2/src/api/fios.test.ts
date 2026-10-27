import { afterEach, expect, it, vi } from "vitest";
import { fiosApi } from "./fios";

afterEach(() => vi.unstubAllGlobals());
it("usa as rotas admin de fios com credenciais e payloads corretos", async () => {
  const fetchMock = vi
    .fn()
    .mockImplementation(() =>
      Promise.resolve(
        new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } }),
      ),
    );
  vi.stubGlobal("fetch", fetchMock);
  await fiosApi.list("mesa aberta");
  await fiosApi.create("mesa aberta", {
    titulo: "A",
    descricao: "B",
    origem: "manual",
    sessao_origem_id: null,
  });
  await fiosApi.createBatch("mesa aberta", [
    { titulo: "A", descricao: "B", origem: "ia", sessao_origem_id: 2 },
  ]);
  await fiosApi.update("mesa aberta", 3, { estado: "resolvido" });
  await fiosApi.remove("mesa aberta", 3);
  await fiosApi.reorder("mesa aberta", [2, 1]);
  await fiosApi.propose("mesa aberta", null);
  expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
    "/api/c/mesa%20aberta/admin/fios",
    "/api/c/mesa%20aberta/admin/fios",
    "/api/c/mesa%20aberta/admin/fios/lote",
    "/api/c/mesa%20aberta/admin/fios/3",
    "/api/c/mesa%20aberta/admin/fios/3",
    "/api/c/mesa%20aberta/admin/fios/ordem",
    "/api/c/mesa%20aberta/admin/fios/propor",
  ]);
  expect(fetchMock.mock.calls.every(([, init]) => init.credentials === "include")).toBe(true);
  expect(JSON.parse(fetchMock.mock.calls[2]![1]!.body)).toEqual({
    fios: [{ titulo: "A", descricao: "B", origem: "ia", sessao_origem_id: 2 }],
  });
  expect(JSON.parse(fetchMock.mock.calls[5]![1]!.body)).toEqual({ ids: [2, 1] });
  expect(JSON.parse(fetchMock.mock.calls[6]![1]!.body)).toEqual({ sessao_id: null });
});
