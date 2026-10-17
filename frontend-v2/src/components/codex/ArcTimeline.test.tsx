import { render, screen, within } from "@testing-library/react";
import { expect, it, describe, beforeEach } from "vitest";
import { ArcTimeline } from "./ArcTimeline";
import i18n from "@/i18n";
import type { Sessao } from "@/api/sessoes";
import type { Evento, Arco } from "@/api/timeline";

const s = (
  id: number,
  arco_id: number | null,
  arco_transicao_id: number | null = null,
): Sessao => ({
  id,
  numero: id,
  titulo: `S${id}`,
  data_rotulo: null,
  resumo: "",
  locais: [],
  personagens: [],
  arco_id,
  arco_transicao_id,
});
const e = (id: number, sessao_id: number, ano: number, mes = 1): Evento => ({
  id,
  titulo: `E${id}`,
  ano,
  mes,
  rotulo_era: null,
  descricao: "",
  sessao_id,
  locais: [],
  personagens: [],
});
const a = (id: number, cor: string | null = `#${id}${id}${id}`): Arco => ({
  id,
  titulo: `A${id}`,
  resumo: "",
  ordem: id,
  cor,
  visivel_para_todos: true,
  sessao_ids: [],
  sessao_transicao_id: null,
});

beforeEach(async () => {
  await i18n.changeLanguage("pt-BR");
});

describe("filtro recalcula colunas", () => {
  it("ao ocultar o arco intercalado, a bifurcação some e resta uma coluna", () => {
    const sessoes = [s(1, 1), s(2, 2), s(3, 1)];
    const eventos = [e(1, 1, 100), e(2, 2, 101), e(3, 3, 102)];
    const arcos = [a(1), a(2)];

    const all = render(
      <ArcTimeline sessoes={sessoes} eventos={eventos} arcos={arcos} filter="all" />,
    );
    expect(all.container.querySelector('[data-session-id="2"]')).toHaveAttribute(
      "data-column",
      "1",
    );
    expect(all.container.querySelectorAll('[data-column="1"]').length).toBeGreaterThan(0);
    all.unmount();

    const filtered = render(
      <ArcTimeline sessoes={sessoes} eventos={eventos} arcos={arcos} filter="1" />,
    );
    expect(filtered.container.querySelector('[data-session-id="2"]')).toBeNull();
    const remaining = filtered.container.querySelectorAll("[data-session-id]");
    expect(remaining).toHaveLength(2);
    for (const row of remaining) expect(row).toHaveAttribute("data-column", "0");
    expect(filtered.container.querySelector('[data-link="auto-branch"]')).toBeNull();
  });
});

it("keeps elapsed labels between dated sessions separated by undated sessions", () => {
  const { container } = render(
    <ArcTimeline
      sessoes={[s(12, 4), s(13, 4), s(14, 4), s(15, 4), s(16, 4), s(17, 4)]}
      eventos={[e(12, 12, 2511, 7), e(13, 13, 2511, 8), e(17, 17, 2511, 8)]}
      arcos={[a(4)]}
      filter="all"
    />,
  );
  const row13 = container.querySelector('[data-session-id="13"]');
  const row12 = container.querySelector('[data-session-id="12"]');
  expect(row13).not.toBeNull();
  expect(row12).not.toBeNull();
  expect(row13).toHaveTextContent("No mesmo período");
  expect(row12).toHaveTextContent("1 mês");
});

describe("ligação sequencial com gradiente", () => {
  it("desenha traço reto tracejado com stroke url(#gradiente) na mesma coluna", () => {
    const { container } = render(
      <ArcTimeline
        sessoes={[s(1, 1), s(2, 2)]}
        eventos={[e(1, 1, 100), e(2, 2, 101)]}
        arcos={[a(1, "#111"), a(2, "#222")]}
        filter="all"
      />,
    );
    const path = container.querySelector('[data-link="sequential"]');
    expect(path).not.toBeNull();
    expect(path).toHaveAttribute("stroke-dasharray", "8 7");
    expect(path).toHaveAttribute("stroke-width", "3");
    const stroke = path!.getAttribute("stroke") ?? "";
    expect(stroke).toMatch(/^url\(#.+\)$/);
    const gradId = stroke.slice(5, -1);
    const grad = container.querySelector(`linearGradient#${CSS.escape(gradId)}`);
    expect(grad).not.toBeNull();
    // Vertical connectors have zero-width bbox; objectBoundingBox gradients vanish.
    expect(grad).toHaveAttribute("gradientUnits", "userSpaceOnUse");
    expect(grad).toHaveAttribute("y1");
    expect(grad).toHaveAttribute("y2");
    const d = path!.getAttribute("d") ?? "";
    expect(d).toMatch(/^M[\d.]+ [\d.]+ V[\d.]+$/);
    expect(d).not.toContain("C");
  });

  it("expõe o rótulo de intervalo fora do svg aria-hidden, em pt-BR e en", async () => {
    // Same calendar year, one month apart → short gap labeled like within-arc elapsed.
    const props = {
      sessoes: [s(1, 1), s(2, 2)],
      eventos: [e(1, 1, 100, 1), e(2, 2, 100, 2)],
      arcos: [a(1), a(2)],
      filter: "all",
    };
    const { unmount } = render(<ArcTimeline {...props} />);
    const labelPt = screen.getByLabelText(/tempo decorrido entre arcos/i);
    expect(labelPt).toBeVisible();
    expect(labelPt.closest("svg")).toBeNull();
    expect(labelPt.textContent).toMatch(/1 mês/);
    expect(labelPt.style.transform).toContain("rotate(-90deg)");
    unmount();

    await i18n.changeLanguage("en");
    render(<ArcTimeline {...props} />);
    const labelEn = screen.getByLabelText(/elapsed time between arcs/i);
    expect(labelEn).toBeVisible();
    expect(labelEn.textContent).toMatch(/1 month/);
    expect(labelEn.style.transform).toContain("rotate(-90deg)");
  });
});

describe("curva automática de bifurcação", () => {
  it("desenha curva quando há overlap sem sessão de transição", () => {
    const { container } = render(
      <ArcTimeline
        sessoes={[s(1, 1), s(2, 2), s(3, 1)]}
        eventos={[e(1, 1, 100), e(2, 2, 101), e(3, 3, 102)]}
        arcos={[a(1), a(2)]}
        filter="all"
      />,
    );
    const branch = container.querySelector('[data-link="auto-branch"]');
    expect(branch).not.toBeNull();
    expect(branch).toHaveAttribute("data-from-arc", "1");
    expect(branch).toHaveAttribute("data-to-arc", "2");
    expect(branch).toHaveAttribute("data-from-date", String(100 * 12));
    expect(branch!.getAttribute("d")).toContain("C");
  });

  it("dá precedência à transição explícita e não desenha curva automática duplicada", () => {
    // Arc1 continues 100–102; Arc2 @101 overlaps (would auto-branch); transition on S3.
    const transition = s(3, 1, 2);
    const { container } = render(
      <ArcTimeline
        sessoes={[s(1, 1), s(2, 2), transition]}
        eventos={[e(1, 1, 100), e(2, 2, 101), e(3, 3, 102)]}
        arcos={[a(1), a(2)]}
        filter="all"
      />,
    );
    expect(container.querySelectorAll('[data-link="auto-branch"]')).toHaveLength(0);
    const transitionPath = container.querySelector('[data-link="arc"][data-transition="true"]');
    expect(transitionPath).not.toBeNull();
    expect(transitionPath!.getAttribute("d")).toContain("C");
  });

  it("ancora a curva no par mais próximo quando 3+ arcos se intercalam", () => {
    const { container } = render(
      <ArcTimeline
        sessoes={[s(1, 1), s(2, 1), s(3, 2), s(4, 2), s(5, 3)]}
        eventos={[e(1, 1, 100), e(2, 2, 110), e(3, 3, 101), e(4, 4, 105), e(5, 5, 103)]}
        arcos={[a(1), a(2), a(3)]}
        filter="all"
      />,
    );
    const branch = container.querySelector('[data-link="auto-branch"][data-to-arc="3"]');
    expect(branch).not.toBeNull();
    expect(branch).toHaveAttribute("data-from-arc", "2");
    expect(branch).toHaveAttribute("data-from-date", String(101 * 12));
    expect(branch).toHaveAttribute("data-at-date", String(103 * 12));
  });
});

describe("sessão de transição", () => {
  it("continua a juntar as duas raias na sessão marcada", () => {
    // Overlap opens col 1 for Arc2; transition on Arc1's later session joins the rails.
    const transition = s(3, 1, 2);
    const { container } = render(
      <ArcTimeline
        sessoes={[s(1, 1), s(2, 2), transition]}
        eventos={[e(1, 1, 100), e(2, 2, 101), e(3, 3, 102)]}
        arcos={[a(1), a(2)]}
        filter="all"
      />,
    );
    expect(within(container).getByText(/3\. S3/)).toBeVisible();
    const transitionPath = container.querySelector('[data-link="arc"][data-transition="true"]');
    expect(transitionPath).not.toBeNull();
    expect(transitionPath!.getAttribute("d")).toContain("C");
    expect(container.querySelectorAll('[data-link="auto-branch"]')).toHaveLength(0);
  });
});
