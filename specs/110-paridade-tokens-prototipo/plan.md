# Implementation Plan: Paridade de tokens e forma visual com o protótipo

**Branch**: `110-paridade-tokens-prototipo` | **Date**: 2026-09-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/110-paridade-tokens-prototipo/spec.md`

## Summary

Alinhar a paleta de **base** (claro/escuro) e a **forma** do `frontend/` ao género **fantasia** de `frontend-next/` — cores, raios (incl. `--radius-full`), sombras/elevações, espaço +48 px, Cormorant local em títulos display já existentes; pílula em botões/chips/busca (kit + legados). Manter aliases (`accent-fill`, `accent-100`…). Mecanismo dos 5 acentos (108) intacto; sem `data-genre`. Aceite: checklist lado a lado + reaprovação baselines Playwright 109; contraste sem regressão.

## Technical Context

**Language/Version**: CSS design tokens + TypeScript/React (sem mudança de API)

**Primary Dependencies**: existentes (Vite, Playwright 109, `check-contrast.mjs`); Cormorant Garamond woff2 local (nova asset)

**Storage**: N/A

**Testing**: `npm run test:contrast`; Playwright `--update-snapshots` + suite quality; checklist manual lado a lado

**Target Platform**: Browser (produção actual)

**Project Type**: web app frontend

**Performance Goals**: fontes locais `font-display: swap`; sem Google Fonts

**Constraints**: MUST NOT redesign layouts; MUST NOT break ~200 refs a aliases; MUST NOT implement genre

**Scale/Scope**: `tokens.css`, `ui.css`, `nocturne.css` (btn/tag), busca, `fonts.css` + assets; styleguide preview hex; 5 telas × 2 temas baselines

## Constitution Check

- **I. Isolamento**: N/A. **PASS**
- **II. Testes primeiro**: contraste + baselines. **PASS**
- **III. Produção legada**: só `frontend/`. **PASS**
- **IV. Simplicidade**: mapeamento documentado; sem 2.ª folha. **PASS**
- **V. i18n**: N/A copy. **PASS**
- **VI. Migrações**: N/A. **PASS**

Post-design: unchanged. **PASS**

## Project Structure

```text
frontend/src/styles/tokens.css          # valores fantasia → data-theme; raios; espaço-7; sombras; font-display
frontend/src/styles/fonts.css           # @font-face Cormorant 500/600
frontend/public/fonts/                  # Cormorant-*.woff2
frontend/src/components/ui/ui.css       # pílula ui-btn / ui-chip / search
frontend/src/styles/nocturne.css        # pílula .btn / .tag
frontend/src/pages/* (só CSS display) # Home/Painel/SiteChrome já pedem --font-display
frontend/scripts/check-contrast.mjs     # actualizar hex se pares mudarem; não piorar
frontend/e2e/...snapshots               # reaprovar
specs/110-.../contracts/token-mapping.md
```

## Clarifications → design

| Topic | Choice |
|-------|--------|
| Aceite visual | Checklist lado a lado + baselines 109 |
| Pílula | ui-kit + chips/tags + busca + `.btn`/`.tag` |
| Géneros 4 | Só fantasia nesta fase |
| Latão/base | Hex fantasia do protótipo |
