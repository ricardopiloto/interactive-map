import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, expect, it } from "vitest";
import i18n from "@/i18n";
import { SiteFooter } from "./SiteFooter";

afterEach(async () => {
  await i18n.changeLanguage("pt-BR");
});

for (const [language, labels] of [
  ["pt-BR", ["Termos de uso", "Política de privacidade", "Contato"]],
  ["en", ["Terms of use", "Privacy policy", "Contact"]],
] as const) {
  it(`shows version and legal links in ${language}`, async () => {
    await i18n.changeLanguage(language);
    render(
      <MemoryRouter>
        <SiteFooter />
      </MemoryRouter>,
    );
    expect(screen.getByText(`Campaign Codex v${__APP_VERSION__}`)).toBeTruthy();
    for (const [index, href] of ["/termos", "/privacidade", "/contato"].entries()) {
      expect(screen.getByRole("link", { name: labels[index]! }).getAttribute("href")).toBe(href);
    }
  });
}
