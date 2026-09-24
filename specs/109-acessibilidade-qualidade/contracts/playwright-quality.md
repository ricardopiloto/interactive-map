# Contract: Playwright quality gate

## Commands

```bash
cd frontend
npx playwright test                 # visual + axe
npx playwright test --update-snapshots   # só com revisão explícita
```

## CI fail conditions

- Qualquer violação axe com `impact === 'critical'`
- Diff de screenshot acima do limiar do `playwright.config.ts`
- Exit ≠ 0 do job (API ou preview não sobe)

## Non-fail (report only)

- axe `serious` / `moderate` / `minor` (logados no report HTML)

## Auth

Cookie `codex_session=<raw>` no contexto do browser antes de `/painel` e rotas de campanha autenticadas se necessário.

## Matrix

| Screen | Path (exemplar) | Auth |
|--------|-----------------|------|
| home | `/` | no |
| painel | `/painel` | yes |
| mapa | `/c/{slug}/mapa` | no (público) |
| relações | `/c/{slug}/relacoes` | no |
| rota | `/c/{slug}/rota` | no |

Locales: `pt-BR`, `en` (i18n via localStorage / query conforme app).  
Viewports: desktop 1280×720; mobile 390×844.  
Themes: `data-theme` / preferência existente (`light`\|`dark`); mobile só `light`.
