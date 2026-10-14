import { render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { AuthProvider } from "./AuthContext";
import { EditModeProvider, useEditMode } from "./EditModeContext";

afterEach(() => {
  vi.unstubAllGlobals();
  sessionStorage.clear();
});

function Control() {
  const { enabled, canEdit, ready } = useEditMode();
  return (
    <div>
      {ready ? "ready" : "loading"}
      {canEdit && enabled && <button>Editar campanha</button>}
    </div>
  );
}

it("não mostra controle GM sem permissão, mesmo com toggle salvo", async () => {
  sessionStorage.setItem("codex.editMode.teste", "1");
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation((url: string) =>
      Promise.resolve(
        url === "/api/auth/me"
          ? new Response(JSON.stringify({ id: 1, email: "user@example.com", is_admin: false }), {
              status: 200,
            })
          : new Response(JSON.stringify({ detail: { erro: "SEM_PERMISSAO" } }), { status: 403 }),
      ),
    ),
  );
  render(
    <AuthProvider>
      <EditModeProvider slug="teste">
        <Control />
      </EditModeProvider>
    </AuthProvider>,
  );
  await screen.findByText("ready");
  expect(screen.queryByRole("button", { name: "Editar campanha" })).not.toBeInTheDocument();
});
