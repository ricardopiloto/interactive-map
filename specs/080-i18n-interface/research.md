# Research: Internacionalização da Interface

**Feature**: `080-i18n-interface`  
**Date**: 2026-08-13

## 1. Biblioteca i18n

**Decision**: `react-i18next` + `i18next` + `i18next-browser-languagedetector` (bundled no build).

**Rationale**: RFC §1; stack React/Vite puro; detector cobre localStorage → navigator; troca instantânea sem reload (SC-004).

**Alternatives considered**: `next-intl` — rejeitado (não Next.js). `i18next-http-backend` lazy locales — rejeitado (2 idiomas, peso irrelevante). Strings inline sem lib — rejeitado (sem pluralização/detector).

## 2. Locales canónicos e mapeamento por prefixo

**Decision**:

- Locales suportados: `pt-BR` (default/fallback) e `en`.
- Detector custom `normalizeBrowserLanguage(code)`: se `code.startsWith('pt')` → `pt-BR`; se `code.startsWith('en')` → `en`; else → `pt-BR`.
- Ordem: `localStorage` (override manual) → `navigator` (normalizado) → `pt-BR`.
- `i18next` config: `fallbackLng: { en: ['pt-BR'], default: ['pt-BR'] }` (FR-009 — chave EN em falta mostra PT-BR).

**Rationale**: Clarifications Q4/Q5; cobre `en-US`, `en-GB`, `pt-PT` sem locale extra.

**Alternatives considered**: Locale `en-US` separado — rejeitado (duplicação). Match exacto só `pt-BR`/`en` — rejeitado na clarify.

## 3. Organização de namespaces

**Decision**: Quatro namespaces por RFC, ficheiros JSON estáticos importados em `i18n/index.ts`:

| Namespace | Conteúdo |
|-----------|----------|
| `comum` | Nav, botões genéricos, estados (Vivo/Morto/…), erros API, AdminGate |
| `mapa` | MapPage, SideMenu, pins, route planner |
| `relacoes` | RelacoesPage, grafo, ficha, vínculos |
| `admin` | Diálogos GM, digitalização, uploads, arcos/NPC/locais |

Uso: `useTranslation('mapa')` ou `t('comum:nav.mapa')` quando cross-namespace.

**Rationale**: FR-005; RFC §2; ficheiros pequenos; terceiro idioma = pasta nova.

**Alternatives considered**: Um JSON gigante — rejeitado. Namespace por componente — rejeitado (fragmentação).

## 4. Formato de erro API (FastAPI ↔ frontend)

**Decision**: Respostas de erro surfaced usam corpo FastAPI padrão com `detail` **object**:

```json
{
  "detail": {
    "erro": "ARQUIVO_EXCEDE_TAMANHO_MAXIMO",
    "detalhes": { "limite_bytes": 20971520 }
  }
}
```

Helper backend `raise_api_error(code: str, *, status_code, detalhes=None)` em `backend/app/errors.py`. Frontend `parseApiError(text, status)` tenta JSON → extrai `detail.erro` + `detail.detalhes`; se string legacy PT, devolve `codigo=None` → fallback genérico localizado (FR-007).

**Rationale**: Compatível com FastAPI; RFC alinhado (campos `erro`/`detalhes`); migração incremental possível.

**Alternatives considered**: Top-level `{erro, detalhes}` sem `detail` — rejeitado (quebra handlers FastAPI). Manter strings PT — rejeitado (SC-003).

## 5. Âmbito de migração de erros

**Decision**: Migrar **todos os erros que o frontend pode mostrar** ao utilizador (toast, `inline-error`, `window.alert`, status de página, AdminGate). Catálogo em [api-error-codes.md](./contracts/api-error-codes.md). Erros 404 em endpoints só usados internamente sem UI dedicada: migrar se o `catch` expõe mensagem; caso contrário fallback genérico basta.

**Rationale**: Clarification Q2; SC-003 100% surfaced.

**Alternatives considered**: Migrar todos os HTTPException do repo — rejeitado (fora do critério). Catálogo finito sem implementação — rejeitado.

## 6. Seletor de idioma

**Decision**: Componente `LanguageSelector` em `CodexHeader` (lado direito, antes do toggle GM): botão ghost com sigla activa (`PT` / `EN`); menu ou toggle de 2 opções; `i18n.changeLanguage(locale)` + persistência via detector (`localStorage`).

**Rationale**: FR-008; RFC §5; barra partilhada Mapa/Relações.

**Alternatives considered**: Seletor no footer — rejeitado. Flag emoji — rejeitado (acessibilidade inconsistente).

## 7. Extração de strings e auditoria

**Decision**:

1. Inicializar i18n e migrar por superfície: `comum` + `CodexHeader` → `mapa` → `relacoes` → `admin` (incl. `RouteDigitizerView`, diálogos GM).
2. Enums de UI (status personagem, tipos vínculo labels, chips) → chaves em `comum`/`relacoes`; **valores guardados na DB** permanecem inalterados.
3. Auditoria SC-002: script `rg`/`grep` por literais PT em `frontend/src` (excl. testes, comentários) + revisão manual quickstart; meta ≥95%.

**Rationale**: SC-001/SC-002; 079 já estabilizou digitalização.

**Alternatives considered**: i18n só em strings novas — rejeitado (SC-001). eslint-plugin-i18n — adiado (script manual suficiente v2).

## 8. Hub e conteúdo do mestre

**Decision**: `hub/` **excluído** (PT-only; follow-up). Campos `nome`, `descricao`, `nota`, labels de waypoint digitados pelo GM **não** passam por `t()`.

**Rationale**: Clarifications Q1; FR-004.

## 9. Versão

**Decision**: Bump **0.15.0** na implementação (sequência 077→0.12, 078→0.13, 079→0.14, 080→0.15).

**Rationale**: Padrão das frentes v2.
