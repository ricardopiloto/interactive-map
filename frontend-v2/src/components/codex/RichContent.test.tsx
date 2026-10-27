import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, expect, it } from "vitest";
import { RichContent } from "./RichContent";
import i18n from "@/i18n";

beforeEach(async () => {
  await i18n.changeLanguage("pt-BR");
});

it("formata Markdown, sanitiza HTML e mantém entidades ao lado", () => {
  const { container } = render(
    <MemoryRouter>
      <RichContent
        markdown={"**Importante**\n\n- Primeiro\n\n<script>alert('x')</script>"}
        related={[{ id: 1, label: "Altdorf", href: "/c/teste/mapa?local=1" }]}
      />
    </MemoryRouter>,
  );
  expect(screen.getByText("Importante").tagName).toBe("STRONG");
  expect(screen.getByText("Primeiro").tagName).toBe("LI");
  expect(container.querySelector("script")).toBeNull();
  expect(container.textContent).not.toContain("**Importante**");
  expect(screen.getByRole("link", { name: "Altdorf" })).toHaveAttribute(
    "href",
    "/c/teste/mapa?local=1",
  );
});

const combat =
  "> [!combate] Emboscada na ponte\n> - **Inimigos:** bandidos\n> - **Ambiente:** neblina\n> - **Tática ou gatilho:** atacar\n> - **Desfecho:** fuga";

it("renderiza o bloco canônico com cada campo como item de lista", () => {
  const { container } = render(<RichContent markdown={combat} callouts />);
  expect(screen.getByText("Emboscada na ponte")).toBeVisible();
  expect(container.querySelector("blockquote")).toBeNull();
  expect([...container.querySelectorAll("li")].map((li) => li.textContent)).toEqual([
    "Inimigos: bandidos",
    "Ambiente: neblina",
    "Tática ou gatilho: atacar",
    "Desfecho: fuga",
  ]);
});

it("aceita marcador sem título e com caixa diferente", () => {
  const { rerender, container } = render(
    <RichContent markdown="> [!COMBATE]\n>\n> - **Inimigos:** bandidos" callouts />,
  );
  expect(screen.getByText("Combate")).toBeVisible();
  expect(container.querySelector("blockquote")).toBeNull();
  rerender(<RichContent markdown="> [!CoMbAtE] Ponte" callouts />);
  expect(screen.getByText("Ponte")).toBeVisible();
});

it("mantém outras citações e marcador fora da primeira linha", () => {
  const markdown = "> Citação\n\n> [!nota] Aviso\n\n> Antes\n> [!combate] Depois";
  const { container } = render(<RichContent markdown={markdown} callouts />);
  expect(container.querySelectorAll("blockquote")).toHaveLength(3);
  expect(container.textContent).toContain("[!combate] Depois");
});

it("reconhece bloco em lista e dentro de outra citação, sem HTML bruto", () => {
  const markdown =
    "- > [!combate] Na lista\n  > - **Inimigos:** bandidos\n\n> Citação\n>\n> > [!combate] Dentro\n> > - **Ambiente:** ponte\n\n> [!combate] Seguro\n> <script>alert('x')</script>";
  const { container } = render(<RichContent markdown={markdown} callouts />);
  expect(screen.getByText("Na lista")).toBeVisible();
  expect(screen.getByText("Dentro")).toBeVisible();
  expect(screen.getByText("Seguro")).toBeVisible();
  expect(container.querySelector("script")).toBeNull();
});

it("mantém o marcador literal sem a prop", () => {
  const { container } = render(<RichContent markdown={combat} />);
  expect(container.querySelector("blockquote")).not.toBeNull();
  expect(container.textContent).toContain("[!combate] Emboscada na ponte");
});
