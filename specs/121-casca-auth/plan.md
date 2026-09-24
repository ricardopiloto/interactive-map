# Implementation Plan: Casca visual de login, convite, reset e conta

**Branch**: `121-casca-auth` | **Date**: 2026-09-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/121-casca-auth/spec.md`

## Summary

Aplicar paridade visual do cartão do protótipo às quatro páginas de autenticação e conta já expostas em `/login`, `/convite/:token`, `/reset/:token` e `/conta`. A implementação deve elevar as classes compartilhadas `.auth-page` e `.auth-card` no CSS global, usar os tokens existentes para fundo, superfície, raio e estados, tornar os campos pílulas e os botões primários largos. `AuthPages.tsx`, as rotas, `authApi`, tokens de URL, erros e redirects permanecem funcionalmente intactos. O convite e o reset continuam páginas separadas.

## Technical Context

**Language/Version**: TypeScript / React 19; CSS

**Primary Dependencies**: React Router 7, react-i18next, `authApi`, kit `Button` existente e tokens CSS do produto

**Storage**: N/A; nenhum estado persistente ou dado novo

**Testing**: Quickstart manual de UI e fluxos com credenciais/tokens de teste; `cd frontend && npx tsc --noEmit` como verificação estática

**Target Platform**: Browser, desktop e viewport estreita; temas claro/escuro

**Project Type**: Web app frontend

**Performance Goals**: N/A; alteração apenas de apresentação

**Constraints**: Não alterar rotas, chamadas/contratos de auth, tokens, validação, erros ou redirects; não adicionar dependências; preservar autocomplete, tipos e requisitos dos campos; não tocar `/opt`

**Scale/Scope**: Quatro páginas já em `frontend/src/pages/AuthPages.tsx`; CSS compartilhado em `frontend/src/styles/global.css`; estilos globais de token em `frontend/src/styles/tokens.css`; sem alteração de backend

## Constitution Check

*GATE: before Phase 0 — re-check after Phase 1*

- **I. Isolamento entre campanhas**: N/A. A feature não cria endpoints nem lê/escreve dados de campanha; só apresenta páginas de autenticação existentes. **PASS**
- **II. Testes primeiro**: A feature é polimento visual. Não altera autenticação, permissões ou dados; quickstart manual e verificação de tipos são adequados. **PASS**
- **III. Produção legada**: Apenas o frontend do Campaign Codex; não exige alterações de instâncias legadas nem de `/opt`. **PASS**
- **IV. Simplicidade**: Reutiliza classes compartilhadas, kit Button e tokens existentes; sem dependências ou armazenamento novos. **PASS**
- **V. i18n**: Reaproveita as strings existentes. Qualquer copy adicional (inclusive link auxiliar) terá chaves pt-BR e en. **PASS**
- **VI. Migrações versionadas**: N/A; sem alteração de schema. **PASS**

Post-design: unchanged. **PASS**

## Project Structure

### Documentation (this feature)

```text
specs/121-casca-auth/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    └── auth-pages.md
```

### Source Code (repository root)

```text
frontend/src/pages/AuthPages.tsx     # markup and existing flows; no behavior changes expected
frontend/src/styles/global.css       # shared auth-page/auth-card presentation and field styling
frontend/src/styles/tokens.css       # existing theme/radius tokens; reuse, avoid unrelated palette changes
frontend/src/components/ui/Button.tsx
frontend/src/components/ui/ui.css    # existing block and pill button behavior
frontend/src/locales/{pt-BR,en}/comum.json # only if new visible copy is chosen
```

**Structure Decision**: Frontend web application. Use the existing shared auth classes in `global.css` so all four pages inherit one visual treatment. Keep route and API behavior in `AuthPages.tsx` unchanged; no new shared React component is needed for this CSS-only scope.

## Complexity Tracking

Nenhuma violação da constituição.
