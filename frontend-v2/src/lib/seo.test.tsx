import { StrictMode } from "react";
import { render } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { useSeo, type SeoOptions } from "./seo";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function Page({ options }: { options: SeoOptions }) {
  useSeo(options);
  return null;
}

const first = {
  title: "Primeira — Campaign Codex",
  description: "Descrição primeira",
  canonical: "https://example.com/primeira",
  robots: "index, follow",
};

afterEach(() => {
  document.head.querySelectorAll("[data-seo]").forEach((element) => element.remove());
  document.head.querySelector('meta[name="description"]')?.remove();
  document.title = "Campaign Codex";
});

it("define e limpa título, descrição, canônico e robots", () => {
  document.title = "Campaign Codex";
  const staticDescription = document.createElement("meta");
  staticDescription.name = "description";
  staticDescription.content = "Descrição padrão";
  document.head.appendChild(staticDescription);
  const view = render(<Page options={first} />);
  expect(document.title).toBe(first.title);
  expect(staticDescription.content).toBe(first.description);
  expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute("href", first.canonical);
  expect(document.querySelector('meta[name="robots"]')).toHaveAttribute("content", first.robots);
  view.unmount();
  expect(document.title).toBe("Campaign Codex");
  expect(staticDescription.content).toBe("Descrição padrão");
  expect(document.querySelector('link[rel="canonical"]')).toBeNull();
  expect(document.querySelector('meta[name="robots"]')).toBeNull();
});

it("não duplica tags em StrictMode nem deixa tags ao trocar de página", () => {
  const view = render(
    <StrictMode>
      <Page options={first} />
    </StrictMode>,
  );
  expect(document.querySelectorAll('meta[name="robots"]')).toHaveLength(1);
  expect(document.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
  view.rerender(
    <StrictMode>
      <Page
        options={{ title: "Outra", description: "Outra descrição", robots: "noindex, nofollow" }}
      />
    </StrictMode>,
  );
  expect(document.title).toBe("Outra");
  expect(document.querySelector('link[rel="canonical"]')).toBeNull();
  expect(document.querySelectorAll('meta[name="robots"]')).toHaveLength(1);
  view.unmount();
  expect(document.querySelectorAll("[data-seo]")).toHaveLength(0);
});

it("mantém o HTML estático sem noindex", () => {
  expect(readFileSync(resolve(process.cwd(), "index.html"), "utf8")).not.toContain("noindex");
});
