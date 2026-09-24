# Research: Acessibilidade e qualidade

**Feature**: `109-acessibilidade-qualidade`  
**Date**: 2026-09-21

## 1. Playwright + axe no monorepo

**Decision**: Playwright no `frontend/` (`playwright.config.ts`, `e2e/`). `@axe-core/playwright` nos mesmos specs. Job CI sobe API (uvicorn) + `vite preview` (ou `webServer` do Playwright) com data root de teste.

**Rationale**: critério-chave; sem CI FE hoje. Co-localizar com frontend evita segundo package.

**Alternatives**: Cypress — rejeitado (prompt nomeia Playwright). Storybook visual — rejeitado (não cobre rotas reais + auth).

## 2. Sessão injectada

**Decision**: script/helper de seed (Python ou endpoint só-teste **proibido**) cria utilizador+sessão no SQLite de e2e; Playwright `context.addCookies([{ name: 'codex_session', value: rawToken, url }])`.

**Rationale**: FR-011; cookie já é httponly `codex_session` (`auth_session.py`).

**Alternatives**: bypass auth em build — rejeitado (FR-011). Login UI em cada teste — lento/flaky.

## 3. Teclado mapa / grafo

**Decision**: pinos do mapa `tabIndex={-1}` (ou não focáveis); SideMenu/lista focável. Grafo: nós já `tabIndex={0}` — se lista da coluna cobre SC-004, limitar Tab aos controlos + lista quando muitos nós (ou manter nós focáveis se número tipicamente baixo; documentar: lista é o caminho garantido).

**Rationale**: clarify Q3.

## 4. Matriz visual

**Decision**: 3 combos/tela/locale: `{viewport: desktop|mobile, theme: light|dark}` com mobile só light. Threshold screenshot ~0.2% / maxDiffPixels documentado no config.

**Rationale**: clarify Q5.

## 5. CLS / fontes

**Decision**: checklist no quickstart + `font-display: swap` já nas Inter locais; sem Lighthouse obrigatório no CI nesta fase (limiar: sem deslocamento repetível de header/nav > ~4px ao carregar — observação manual + smoke e2e `waitForLoadState`).

**Rationale**: FR-009 deixa limiar no plano; evitar job Lighthouse flaky.
