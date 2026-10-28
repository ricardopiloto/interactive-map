import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, expect, it } from "vitest";
import i18n from "@/i18n";
import { SeoRouter, seoRoutes } from "./SeoRouter";

afterEach(() => {
  document.head.querySelectorAll("[data-seo]").forEach((element) => element.remove());
});

for (const language of ["pt-BR", "en"]) {
  for (const route of seoRoutes) {
    it(`${route.path} usa metadados ${language}`, async () => {
      await i18n.changeLanguage(language);
      const pathname = route.path.replace(":token", "exemplo");
      const view = render(
        <MemoryRouter initialEntries={[pathname]}>
          <SeoRouter />
        </MemoryRouter>,
      );
      expect(document.title).toBe(i18n.t(`seo.${route.key}.title`, { ns: "comum" }));
      expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
        "content",
        i18n.t(`seo.${route.key}.description`, { ns: "comum" }),
      );
      expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
        "content",
        route.index ? "index, follow" : "noindex, nofollow",
      );
      expect(document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null).toBe(
        route.index ? `${window.location.origin}${pathname}` : null,
      );
      expect(document.documentElement.lang).toBe(language);
      view.unmount();
    });
  }
  it(`rota desconhecida usa noindex em ${language}`, async () => {
    await i18n.changeLanguage(language);
    const view = render(
      <MemoryRouter initialEntries={["/desconhecida"]}>
        <SeoRouter />
      </MemoryRouter>,
    );
    expect(document.title).toBe(i18n.t("seo.naoEncontrada.title", { ns: "comum" }));
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex, nofollow",
    );
    view.unmount();
  });
}

it("não escreve metadados de campanha", () => {
  const title = document.title;
  const view = render(
    <MemoryRouter initialEntries={["/c/1/mesa/relacoes"]}>
      <SeoRouter />
    </MemoryRouter>,
  );
  expect(document.title).toBe(title);
  expect(document.querySelector("[data-seo]")).toBeNull();
  view.unmount();
});
