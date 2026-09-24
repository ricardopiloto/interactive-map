# Research: Uploads com acesso controlado e cota por campanha

**Feature**: `096-uploads-cota`  
**Date**: 2026-09-20

## 1. Endpoint de mídia vs StaticFiles /uploads

**Decision**: `GET /api/c/{slug}/media/{categoria}/{arquivo}` com `FileResponse` + ACL. Remover (ou fazer 404) o handler actual `GET /uploads/c/{slug}/…` em `main.py`. Categorias no path = nomes de pasta já usados: `map` | `portraits` | `locals` (alinhado ao `category` do upload admin).

**Rationale**: FR-002 / FR-002a; clarificação — `/uploads` não redirecciona, 404. Sem proxy/CDN (IV / fora de escopo).

**Alternatives considered**: Redirect 301 `/uploads` → `/media` — rejeitado (clarificação: 404). Servir via Caddy file_server — fura ACL de retrato.

## 2. ACL de retrato

**Decision**:

1. Resolver campanha pelo slug (404 opaco se inexistente/inactiva — 094).
2. Se pedido tem sessão **membro activo** dessa campanha → 200 se ficheiro existe (FR-003).
3. Caso contrário (anónimo ou membro de outra): 200 **só** se existir ≥1 personagem **nessa** `campanha.db` com `retrato_url` a referenciar esse ficheiro (path normalizado) **e** `visivel_para_todos=true`. Senão 404 opaco (mesmo corpo/código que ficheiro em falta).
4. Mapa e `locals`: públicos se o ficheiro existe na pasta da campanha do slug.

**Rationale**: FR-003–005; edge cases (órfão no disco, dois PJs partilham ficheiro).

**Alternatives considered**: Signed URLs com TTL — complexidade extra sem benefício MVP. 403 em vez de 404 — rejeitado (enumeração / alinhado 094).

## 3. `mapa_arquivo` e ponte 094

**Decision**:

- Upload de mapa: gravar só nome versionado (`{uuid}.ext`) em `map/`; actualizar `Campanha.mapa_arquivo`; apagar ficheiro anterior apontado (se existir); **não** criar `campaign-map.*`.
- `has_map_image` = `bool(mapa_arquivo.strip())` — sem listar pasta após o campo definido.
- Ponte única: se `mapa_arquivo` vazio e existe `campaign-map.{webp,jpg,jpeg,png,gif}` (ordem actual de `instance_config`), persistir esse nome uma vez e seguir.
- Config pública: expor `has_map_image` + `mapa_arquivo` (ou URL absoluta de mídia construída) para o FE não adivinhar o nome (FR-006a).

**Rationale**: Clarificação + FR-006 / FR-006b; remove varredura contínua.

**Alternatives considered**: Manter `campaign-map.*` como symlink — desnecessário com URL na config. Migrar todos os mapas em batch — rejeitado (ponte lazy).

## 4. Rewrite de URLs na leitura

**Decision**: Helper que, em respostas JSON (personagem, local, upload, config), transforma prefixos `/uploads/c/{slug}/…` → `/api/c/{slug}/media/…` (mapear segmentos `map|portraits|locals`). Uploads novos já gravam path de mídia. Sem UPDATE em massa na BD.

**Rationale**: FR-002b; clarificação.

**Alternatives considered**: Alembic data migration — fora de escopo desta fase; mais risco em N campanhas.

## 5. Cota e uso resultante

**Decision**:

- Default `cota_bytes` = 10 × 1024³ (já 093).
- Retrato/local: recusar se `bytes_usados + tamanho_novo > cota_bytes`.
- Mapa: `resultante = bytes_usados - tamanho_anterior + tamanho_novo` (anterior = 0 se sem ficheiro/`mapa_arquivo` vazio); aceitar se `resultante ≤ cota_bytes` mesmo com uso a 100%.
- Erro: `COTA_EXCEDIDA` + detalhes `{ bytes_usados, cota_bytes, tamanho, bytes_resultantes? }`.
- Aviso 90%: após upload aceite, se `bytes_usados * 100 / cota_bytes ≥ 90` e ainda `< 100` (ou ainda há folga), incluir na resposta de upload p.ex. `aviso_cota: true` + uso/teto; UI do ImageSlot mostra i18n. Sem banner na mesa; config pública **sem** cota.

**Rationale**: Clarificações Q3–Q4; FR-008–010.

**Alternatives considered**: Soft quota só com aviso — rejeitado (SC-002). Contar só ficheiros referenciados — rejeitado (órfãos contam; GC fora).

## 6. Cache HTTP

**Decision**:

- `map` e `locals`: `Cache-Control: public, max-age=31536000, immutable` (nome versionado/único).
- `portraits`: `Cache-Control: private, no-store` (sempre — mesmo quando público por visibilidade).

**Rationale**: Clarificação Q2; FR-007 / US4.

**Alternatives considered**: `private, max-age=60` em retratos — ainda reutilizável; rejeitado.

## 7. Reconciliação

**Decision**: CLI `campanha reconciliar-cota --slug SLUG`: somar tamanhos sob `uploads/` dessa campanha (recursivo nas 3 subpastas); gravar `bytes_usados`. Sem UI.

**Rationale**: FR-011; Assumptions.

**Alternatives considered**: Job periódico — YAGNI. Endpoint admin HTTP — possível depois; CLI basta ao operador.

## 8. Frontend

**Decision**: `campaignMediaUrl(categoria, arquivo)` / `defaultMapUrl` a partir de `mapa_arquivo` na config (não hardcode `campaign-map.webp`). ImageSlot mapeia `COTA_EXCEDIDA` e `aviso_cota`. Pedidos de mídia controlada usam `credentials: 'include'` quando em modo GM (retratos ocultos).

**Rationale**: FR-002 / FR-013 / SC-005.

**Alternatives considered**: Service worker para strip cache — overkill vs `no-store`.

## 9. Testes / isolamento

**Decision**: Novos `test_media_acl.py`, `test_quota.py`; actualizar `test_isolation_http.py` e `uploads_url` helper para `/api/c/{slug}/media/…`. Critério-chave SC-001/SC-002 em TDD.

**Rationale**: Constituição I–II; FR-014.

## Resolvidos (sem NEEDS CLARIFICATION)

Todos os pontos técnicos fechados pela spec + clarificações 2026-09-20; stack existente suficiente.
