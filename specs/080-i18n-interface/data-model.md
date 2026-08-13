# Data Model: Internacionalização da Interface

**Feature**: `080-i18n-interface`  
**Date**: 2026-08-13

## Locale (runtime, client-only)

| Field | Type | Values | Notes |
|-------|------|--------|-------|
| `locale` | string | `pt-BR` \| `en` | Idioma activo da UI |
| `source` | enum | `localStorage` \| `navigator` \| `fallback` | Origem da detecção (debug/logging) |

**Not persisted server-side.** Override manual grava em `localStorage` via `i18next-browser-languagedetector`.

### Normalização browser → locale

| Input (prefix) | Output |
|----------------|--------|
| `pt`, `pt-BR`, `pt-PT`, … | `pt-BR` |
| `en`, `en-US`, `en-GB`, … | `en` |
| qualquer outro | `pt-BR` |

## Translation key

| Field | Type | Notes |
|-------|------|-------|
| `namespace` | string | `comum` \| `mapa` \| `relacoes` \| `admin` |
| `key` | string | Dot-path estável, ex. `nav.mapa`, `erros.CREDENCIAIS_INVALIDAS` |
| `defaultValue` | string? | Opcional em dev; produção usa fallbackLng → PT-BR |

### Convenções

- Chaves em **camelCase** ou **snake** consistente por namespace (preferir `camelCase` para novas chaves).
- Interpolação i18next: `{{nome}}`, `{{limite_mb}}`.
- Pluralização: reservada; v2 usa strings separadas se necessário.

## API error code (backend → frontend)

| Field | Type | Notes |
|-------|------|-------|
| `erro` | string | UPPER_SNAKE, ex. `ARQUIVO_EXCEDE_TAMANHO_MAXIMO` |
| `detalhes` | object | Payload opcional para interpolação |

### HTTP envelope (FastAPI)

```json
{
  "detail": {
    "erro": "CODIGO",
    "detalhes": { }
  }
}
```

Status HTTP mantém semântica actual (401, 404, 422, 413, 503, …).

## Master content (NOT translated)

| Entity field | Examples |
|--------------|----------|
| `Local.nome`, `descricao` | Lore escrita pelo GM |
| `Personagem.nome`, `descricao`, `faccao` (texto livre) | Ficha |
| `Vinculo.nota`, qualificadores custom | Relações |
| `Waypoint.nome` | Digitalização |
| `Arco.titulo`, `NPC.nome` | Admin |

### UI labels FOR master enums (translated)

| Stored value | UI key namespace |
|--------------|------------------|
| `personagem.status`: `vivo`, `morto`, `desaparecido` | `comum:status.*` |
| `vinculo.tipo` (catálogo fixo frontend) | `relacoes:tipo.*` |
| Chips GM seleccionados | label traduzida; valor API inalterado |

## Client error resolution flow

```
API response (4xx/5xx)
  → parseApiError(body)
    → { codigo, detalhes } | null
  → useApiErrorMessage(codigo, detalhes)
    → t(`comum:erros.${codigo}`, detalhes) || t('comum:erros.GENERICO')
```

Legacy string PT in `detail` → `codigo=null` → `GENERICO` (nunca mostrar string crua do servidor em EN).

## Validation rules

- `locale` manual: só `pt-BR` ou `en` aceites no seletor.
- `erro` codes: `[A-Z][A-Z0-9_]*`, únicos no catálogo contract.
- Chave de tradução obrigatória em **ambos** locales para passar auditoria SC-002; runtime permite fallback PT-BR se EN em falta (conta como falha na auditoria).

## State transitions (locale)

```
[first visit]
  → read localStorage → if set, use locale
  → else normalize(navigator.language)
  → else pt-BR

[user picks EN/PT in selector]
  → i18n.changeLanguage
  → persist localStorage
  → all mounted t() re-render (<1s, SC-004)
```
