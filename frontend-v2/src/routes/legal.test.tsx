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
    "RESET_INDISPONIVEL",
    "CONVITE_JA_USADO",
    "CONVITE_INVALIDO",
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

it.each(["pt-BR", "en"] as const)(
  "links contact and removes ambiguous cookies text in %s",
  async (language) => {
    await i18n.changeLanguage(language);
    for (const kind of ["terms", "privacy"] as const) {
      const { unmount } = render(
        <MemoryRouter>
          <LegalPage kind={kind} />
        </MemoryRouter>,
      );
      expect(
        screen.getAllByRole("link", {
          name: language === "en" ? "Contact form" : "Formulário de contato",
        })[0],
      ).toHaveAttribute("href", "/contato");
      expect(document.body.textContent).not.toContain("cookies de terceiros próprios");
      expect(document.body.textContent).not.toContain("its own third-party cookies");
      if (kind === "privacy") {
        expect(document.body.textContent).toContain(
          language === "en"
            ? "Search engine indexing is the campaign owner's choice and is off by default"
            : "A indexação em buscadores é uma escolha do mestre, desligada por padrão",
        );
        expect(document.body.textContent).toContain(
          language === "en"
            ? "only content the owner made visible to players is accessible"
            : "só o conteúdo que ele tornou visível aos jogadores fica acessível",
        );
        expect(document.body.textContent).toContain(
          language === "en" ? "Password recovery" : "Recuperação de senha",
        );
        expect(document.body.textContent).toContain(
          language === "en" ? "valid for 1 hour" : "válido por 1 hora",
        );
        expect(document.body.textContent).toContain(
          language === "en"
            ? "temporary counter per IP and a hash of the email address"
            : "contador temporário por IP e um hash do e-mail",
        );
      }
      unmount();
    }
    for (const code of [
      "CONTATO_INDISPONIVEL",
      "CONTATO_ENVIO_FALHOU",
      "LIMITE_CONTATO_DIARIO",
      "ASSUNTO_INVALIDO",
      "MENSAGEM_INVALIDA",
      "NOME_INVALIDO",
      "LIMITE_PEDIDOS",
      "CAPTCHA_INVALIDO",
      "CAPTCHA_INDISPONIVEL",
      "EMAIL_INVALIDO",
    ]) {
      expect(i18n.t(`errors.${code}`)).not.toBe(`errors.${code}`);
    }
  },
);
