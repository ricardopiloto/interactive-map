import { afterEach, expect, it, vi } from "vitest";
import { ApiError, api } from "./client";

afterEach(() => vi.unstubAllGlobals());

it("envia cookie e propaga erro de API como ApiError tratável", async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValue(
      new Response(
        JSON.stringify({ detail: { erro: "SEM_PERMISSAO", detalhes: { recurso: "mapa" } } }),
        { status: 403 },
      ),
    );
  vi.stubGlobal("fetch", fetchMock);
  await expect(api.get("/api/teste")).rejects.toMatchObject({
    name: "ApiError",
    status: 403,
    codigo: "SEM_PERMISSAO",
    detalhes: { recurso: "mapa" },
  } satisfies Partial<ApiError>);
  expect(fetchMock.mock.calls[0]?.[1].credentials).toBe("include");
});
