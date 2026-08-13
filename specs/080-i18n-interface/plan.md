# Implementation Plan: Internacionalização da Interface

**Branch**: `080-i18n-interface` | **Date**: 2026-08-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/080-i18n-interface/spec.md`

**Release**: Codex v2.0.0 — Frente D (version bump **0.15.0** na implementação; tag **2.0.0** quando 077–080 fecharem)

## Summary

Introduzir **PT-BR** e **EN** na app React (Mapa, Relações, digitalização de rotas, diálogos GM) com detecção por prefixo (`pt*` / `en*`), seletor persistente em `CodexHeader`, namespaces de tradução por área, e migração dos **erros API surfaced na UI** para `{ erro, detalhes }` no backend + mapeamento localizado no frontend. Conteúdo do mestre e hub estático (`hub/`) ficam **fora** do escopo de tradução nesta frente.

## Technical Context

**Language/Version**: TypeScript / React 19 / Vite 8 (frontend); Python 3.12 / FastAPI (backend — só camada de erros)  
**Primary Dependencies**: `react-i18next`, `i18next`, `i18next-browser-languagedetector` (novos); `CodexHeader`, `api/client.ts`  
**Storage**: `localStorage` (`i18nextLng` ou chave explícita) para override de idioma; sem persistência server-side  
**Testing**: Manual quickstart; `npm run build`; auditoria ≥95% de chaves nos ecrãs principais; browser EN/PT  
**Target Platform**: Web desktop + mobile (mesmos breakpoints da app)  
**Project Type**: Monorepo — `frontend/` (i18n bulk) + `backend/` (erros surfaced) + docs versão  
**Performance Goals**: Troca de idioma &lt;1 s (SC-004); bundles estáticos (2 locales, sem lazy-load)  
**Constraints**: Clarifications 2026-08-13 locked (5/5); hub 078 out of scope; chave EN em falta → fallback PT-BR runtime; ≥95% audit  
**Scale/Scope**: ~40–60 ficheiros TSX tocados; 8 JSON × 2 locales; ~35 códigos de erro UI; 4 contratos  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Spec clarified (5/5): **PASS**
- Conteúdo do mestre não traduzido (FR-004): **PASS** — só chrome UI + enums de sistema
- Hub fora de escopo: **PASS**
- Sem contas multi-user / locale por campanha: **PASS**
- Depende de 079 concluída (strings digitalização estáveis): **PASS** (079 implementada 0.14.0)

**Post-Phase 1**: Unchanged.

## Project Structure

### Documentation (this feature)

```text
specs/080-i18n-interface/
├── plan.md              # this file
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-error-codes.md
│   ├── ui-locale-detection.md
│   ├── ui-language-selector.md
│   └── ui-translation-namespaces.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
frontend/src/
├── i18n/
│   ├── index.ts                 # init i18next; detector; fallbackLng
│   └── normalizeLocale.ts       # prefix pt*/en* → pt-BR/en
├── locales/
│   ├── pt-BR/
│   │   ├── comum.json           # botões, erros, estados, nav
│   │   ├── mapa.json
│   │   ├── relacoes.json
│   │   └── admin.json           # GM dialogs, digitizer, uploads
│   └── en/
│       └── (mirror)
├── api/
│   ├── client.ts                # parse structured API errors
│   └── parseApiError.ts         # NEW — { erro, detalhes } → ApiError
├── components/layout/
│   ├── CodexHeader.tsx          # LanguageSelector
│   └── LanguageSelector.tsx     # NEW — PT/EN toggle
├── hooks/
│   └── useApiErrorMessage.ts    # NEW — t('erros.CODE', detalhes)
└── main.tsx                     # import ./i18n before render

backend/app/
├── errors.py                    # NEW — ApiErrorCode enum + raise_api_error()
├── exception_handlers.py        # NEW — ensure JSON detail shape (optional thin wrapper)
├── deps/auth.py                 # structured auth errors (surfaced)
├── services/uploads.py          # upload errors (surfaced)
├── services/mecanica.py
├── services/waypoint_local_link.py
└── routers/**                   # replace PT detail strings on surfaced paths

frontend/package.json / package-lock.json
backend/pyproject.toml / uv.lock
README.md / CHANGELOG.md         # 0.15.0
```

**Structure Decision**: i18n init isolado em `frontend/src/i18n/`; traduções em `locales/` espelhando RFC; erros backend centralizados em `errors.py` com helper partilhado; `client.ts` devolve `ApiError` tipado em vez de `Error(detailText)`.

## Complexity Tracking

> None.
