# Research: Fundações do sistema visual

**Feature**: `100-fundacoes-sistema-visual`  
**Date**: 2026-09-20

## 1. Ficheiro de tokens e temas

**Decision**: Um `frontend/src/styles/tokens.css` com variáveis CSS do RFC §4; valores sob `html[data-theme="dark"]` e `html[data-theme="light"]` (ou `:root` + override). `nocturne.css` deixa de ser a fonte de verdade de cor — importa tokens e mantém só classes de componente ainda usadas, **sem** `--color-section*`, `.table`, `.hr`, comentários «review round», nem `@import` Google Fonts.

**Rationale**: FR-001/002/004; RFC §4; clarificação live theme.

**Alternatives considered**: Dois ficheiros dark.css/light.css — mais splits. Manter nomes Nocturne antigos com valores novos — confunde UX-2+.

## 2. Aplicação do tema (live)

**Decision**: Script/módulo `applySystemTheme` no boot: lê `matchMedia('(prefers-color-scheme: dark)')`, define `document.documentElement.dataset.theme`, regista `change` listener para actualizar **de imediato**. Sem localStorage nesta fase (UX-3).

**Rationale**: Clarificação Q1; FR-002.

**Alternatives considered**: Só no load — rejeitado. CSS-only `prefers-color-scheme` sem `data-theme` — impede override futuro UX-9 e styleguide scoped.

## 3. Styleguide scoped

**Decision**: Rota `/__styleguide` registada **só** se `import.meta.env.DEV`. Página com contentor `.styleguide-preview[data-theme=…]` e toggle local; **não** escreve no `documentElement`. Em production build a rota não existe (404 do router).

**Rationale**: Clarificações Q2/Q5; FR-007; SC-004.

**Alternatives considered**: Toggle na raiz do documento — vaza tema. Side-by-side sem toggle — menos prático para rever componentes.

## 4. Inter local

**Decision**: woff2 pesos **400 e 500** em `frontend/public/fonts/`; `@font-face` em `fonts.css` com `font-display: swap`. Remover `@import` Google Fonts de `nocturne.css`.

**Rationale**: RFC §4.2; FR-003; SC-005.

**Alternatives considered**: npm `@fontsource/inter` — ok mas acrescenta dep; ficheiros locais bastam (IV).

## 5. Gate anti-hex

**Decision**: Script `check-no-hex.mjs` varre `frontend/src/**/*.{css,ts,tsx}` por `#` hex de cor; allowlist: `tokens.css` (e ficheiro de fontes se necessário); excepção pin: padrões documentados (`PIN_COLOR_*`, `--pin-color`, atribuição de `cor` de local). **Só `#…`** falha o gate (clarificação Q4). `rgb()`/`hsl()` — limpeza opcional.

**Rationale**: FR-006; clarificações Q3/Q4.

**Alternatives considered**: Só CSS — rejeitado (Q3=B). Incluir SVG — fora de âmbito. Plugin oxlint custom — mais complexo que script.

## 6. Script de contraste

**Decision**: `check-contrast.mjs` carrega pares do RFC (texto primário/secundário/terciário sobre card/fundo; acento; borda de campo; on-accent; hover/elevado não medidos) para dark e light; fórmula WCAG relativa; falha se texto &lt; AA (4.5:1 normal / 3:1 large se aplicável) ou componente &lt; 3:1. Ajustar tokens até passar (spec edge case).

**Rationale**: FR-008; SC-001.

**Alternatives considered**: Playwright pixel — UX-10. Dep `colorjs.io` — justificável; implementação WCAG manual preferível (IV).

## 7. Migração de hex existentes

**Decision**: Substituir fallbacks `#0f1115`, visited-red de **UI** (`#e5484d` em selecção de rota, digitizer chrome, etc.) por tokens (`--color-danger` / token de «visitado» se o RFC não o nomear — mapear a perigo ou token semântico `--color-visited` no tokens.css). Manter `#e5484d` (ou valor livre) **só** como default de **conteúdo** de pino (`PIN_COLOR_VISITED` / dados).

**Rationale**: FR-005; excepção de pino.

**Alternatives considered**: Deixar visited-red hardcoded na UI até UX-4 — falha o gate.

## 8. Reduced motion

**Decision**: Tokens `--motion-fast|normal|slow` (120/200/300ms); em `@media (prefers-reduced-motion: reduce)` durações → 0.01ms ou none nas transições que usam esses tokens.

**Rationale**: FR-009; RFC §4.2.
