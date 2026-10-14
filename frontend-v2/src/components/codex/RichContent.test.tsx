import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, it } from "vitest";
import { RichContent } from "./RichContent";
import "@/i18n";

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
