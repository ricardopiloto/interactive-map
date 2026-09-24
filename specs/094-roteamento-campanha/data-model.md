# Data Model: Roteamento por campanha

**Feature**: `094-roteamento-campanha`  
**Date**: 2026-09-19

## Schema

**Sem alteração** a `control.db` nem a `campanha.db`. Entidades e campos: [093 data-model](../093-controle-alembic-sqlite/data-model.md).

## Conceitos de runtime (sem tabelas novas)

### Pedido por slug

| Aspecto | Regra |
|---------|--------|
| Fonte | Segmento `{slug}` em `/api/c/{slug}/…` ou `/uploads/c/{slug}/…` |
| Resolução | Lookup `Campanha` no controle → sítio UUID (093) |
| Activa | `activa=false` tratado como **inexistente** na HTTP (mesmo erro) |
| Visibilidade | `so_link` \| `listada`: **sem** efeito no acesso por URL nesta fase |
| Env | `CAMPAIGN_SLUG` não participa no pedido HTTP |

### Configuração de mesa (cliente)

| Campo (já em GET config) | Fonte |
|--------------------------|--------|
| sistema | `Campanha.sistema` |
| modulos_ativos | `Campanha.modulos_ativos` |
| has_map_image / mapa | Pasta uploads do sítio + `mapa_arquivo` |

Cache no cliente: indexado por **slug** (não singleton global).

### URLs de mídia

| Antes (093 HTTP único) | Depois (094) |
|------------------------|--------------|
| `/uploads/<rel>` | `/uploads/c/<slug>/<rel>` |

Relativo dentro da pasta `uploads/` da campanha; slug **nunca** no filesystem.

## Validation (HTTP)

- Path sem slug em superfície de conteúdo → 404.
- Slug malformado / inexistente / inactivo → 404 + `CAMPANHA_NAO_ENCONTRADA` (opaco).
- `so_link` + `activa` → acesso normal.

## Transitions

```text
Pedido HTTP com slug
  → resolve Campanha
      → activa && encontrada → Session / dir uploads desse UUID
      → senão → 404 opaco
```

Sem novos estados de entidade.
