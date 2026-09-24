# Implementation Plan: Acessibilidade e qualidade

**Branch**: `109-acessibilidade-qualidade` | **Date**: 2026-09-21 | **Spec**: [spec.md](./spec.md)

## Summary

Gate UX-10: fechar a11y (teclado mapa/grafo via lista+controlos, aria-live, foco Drawer/Dialog, reduced-motion, alvos ≥44px) e instituir Playwright + axe + capturas visuais no CI (pt-BR+en; matriz desktop claro/escuro + mobile claro; só `critical` falha axe). Fixture de sessão para painel. Contraste final + checklist CLS/fontes. Sem redesign de produto; sem `/opt`.

## Technical Context

**Language/Version**: TypeScript (Vite/React 19), Python 3.12 (FastAPI fixtures de sessão)

**Primary Dependencies**: Playwright + `@axe-core/playwright` (novas, justificadas — gate de qualidade); reutilizar Dialog/Drawer/Toast UX-2

**Storage**: N/A (baselines em `frontend/e2e/snapshots/`)

**Testing**: Playwright e2e (visual + axe); `npm run test:contrast`; pytest backend inalterado salvo helper de seed se necessário

**Target Platform**: Browser; CI GitHub Actions (primeiro workflow FE a11y/visual)

**Project Type**: web app (frontend + API local para e2e)

**Performance Goals**: fontes locais sem FOIT longo; CLS sem saltos graves de chrome (checklist + amostragem)

**Constraints**: zero violações axe `critical`; 3 snaps/tela/locale; touch ≥44px mobile; MUST NOT `/opt`

**Scale/Scope**: 5 telas × 2 locales × 3 viewports ≈ 30 baselines + axe nas mesmas rotas

## Constitution Check

- **I. Isolamento**: fixtures e2e por slug de teste; sem cruzar campanhas. **PASS**
- **II. Testes primeiro**: suite Playwright falha sem baselines/axe OK. **PASS**
- **III. Produção legada**: sem `/opt`. **PASS**
- **IV. Simplicidade**: Playwright+axe justificados (critério-chave); sem 2.ª lib a11y. **PASS**
- **V. i18n**: anúncios/rótulos novos pt-BR+en; CI ambos locales. **PASS**
- **VI. Migrações**: N/A. **PASS**

## Project Structure

```text
frontend/
  e2e/                 # Playwright specs + snapshots + helpers (auth cookie)
  playwright.config.ts
  package.json         # scripts test:e2e, test:a11y
.github/workflows/frontend-quality.yml
frontend/src/…         # gaps a11y (live regions, focus trap Drawer, touch, reduced-motion)
```

## Clarifications → design

| Decision | Choice |
|----------|--------|
| Axe CI | só `critical` |
| Locales | pt-BR + en |
| Mapa teclado | controlos + lista; pinos fora do Tab completo |
| Auth painel | fixture + cookie `codex_session` |
| Visual matrix | desktop claro, desktop escuro, mobile claro |
