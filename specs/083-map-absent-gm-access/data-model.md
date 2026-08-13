# Data Model: Acesso ao Mapa Sem Imagem (GM)

**Feature**: `083-map-absent-gm-access`  
**Date**: 2026-08-13

Sem entidades novas de servidor. Estados derivados na UI.

## Instance map presence

| Source | Field | Type | Notes |
|--------|-------|------|-------|
| `GET /api/config` | `has_map_image` | boolean | Já existente; presença do ficheiro de mapa da campanha no servidor |

Cliente: `useInstanceConfig().config.has_map_image` (FR-006).

## GM session (existing)

| Source | Meaning |
|--------|---------|
| `sessionStorage` admin Basic auth | Credenciais presentes (`hasAdminCredentials()`) |
| `isGm` (estado local MapPage / RelacoesPage) | `true` após `adminApi.session()` OK |

Transição relevante a esta feature: `isGm true → false` (logout) **e** `!has_map_image` → destino obrigatório `/relacoes` se estiver no Mapa.

## Navigation visibility (derived)

| `has_map_image` | `isGm` | Mostrar link «Mapa» |
|-----------------|--------|---------------------|
| true | * | sim |
| false | true | sim |
| false | false | não |
| unknown (loading) | false | não (default seguro) |

## Route access (derived)

| Condição | `/` (Mapa) | `/relacoes` | `/admin` | `*` catch-all |
|----------|------------|-------------|----------|---------------|
| `has_map_image` | MapPage | RelacoesPage | → `/?gm=1` | → `/` |
| `!has_map_image` ∧ sem credenciais admin | → `/relacoes` | RelacoesPage | → `/relacoes` (sem query) | → `/relacoes` |
| `!has_map_image` ∧ com credenciais admin | MapPage (valida sessão) | RelacoesPage | → `/relacoes` (sem auto-gate) | → `/relacoes` |

Nota: catch-all sem mapa vai sempre a Relações; GM usa o link «Mapa» para `/`.

## State transitions (UI)

```text
[sem mapa, visitante]
  open / | /?gm=1 | /admin | unknown
    → /relacoes
  header: só «Relações»

[sem mapa, em /relacoes]
  unlock GM (manual)
    → isGm=true; header mostra «Mapa»
  click «Mapa»
    → / (MapPage, upload)

[sem mapa, MapPage, isGm]
  logout GM
    → clear credentials; navigate /relacoes
  upload map OK
    → has_map_image efectivo true (cache invalidate ou reload)
    → header mostra «Mapa» para todos

[com mapa]
  comportamento actual (ambos os links; / = MapPage)
```
