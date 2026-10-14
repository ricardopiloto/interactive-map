import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./AuthContext";

afterEach(() => vi.unstubAllGlobals());

function Probe() {
  const { user, loading } = useAuth();
  return <div>{loading ? "loading" : (user?.email ?? "anonymous")}</div>;
}

it("limpa a sessão quando expira", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: 1, email: "gm@example.com", is_admin: false }), {
        status: 200,
      }),
    ),
  );
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );
  await screen.findByText("gm@example.com");
  act(() => window.dispatchEvent(new Event("codex:auth-expired")));
  await waitFor(() => expect(screen.getByText("anonymous")).toBeInTheDocument());
});

it("trata sessão inválida como visitante", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ detail: { erro: "NAO_AUTENTICADO" } }), { status: 401 }),
      ),
  );
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );
  await screen.findByText("anonymous");
});
