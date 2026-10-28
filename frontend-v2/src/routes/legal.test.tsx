import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, it, vi } from "vitest";
import i18n from "@/i18n";
import { LegalPage } from "./legal";
import pt from "@/locales/pt-BR/comum.json";
import en from "@/locales/en/comum.json";
vi.mock("@/components/site/SiteHeader", () => ({ SiteHeader: () => null }));

it.each(["pt-BR", "en"] as const)("resolves registration errors in %s", async (language) => {
  await i18n.changeLanguage(language);
  for (const code of [
    "REGISTO_FECHADO",
    "EMAIL_DESCARTAVEL",
    "EMAIL_INVALIDO",
    "LIMITE_REGISTO",
    "LIMITE_PEDIDOS",
    "CAPTCHA_INVALIDO",
    "CAPTCHA_INDISPONIVEL",
    "TERMOS_NAO_ACEITOS",
    "IDIOMA_INVALIDO",
  ]) {
    expect(i18n.t(`errors.${code}`)).not.toBe(`errors.${code}`);
  }
});
it.each(["pt-BR", "en"] as const)("shows legal pages in %s", async (language) => {
  await i18n.changeLanguage(language);
  const content = language === "en" ? en : pt;
  for (const kind of ["terms", "privacy"] as const) {
    const { unmount } = render(
      <MemoryRouter>
        <LegalPage kind={kind} />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: content.legal[kind].title })).toBeInTheDocument();
    unmount();
  }
});
