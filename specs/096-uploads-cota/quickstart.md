# Quickstart: Uploads / cota (096)

**Feature**: `096-uploads-cota`

Validação manual + pytest após implementação. Contratos: [contracts/](./contracts/).

## Pré-requisitos

- Specs 093–095 Implemented (controlo, slug, contas).
- `DATA_DIR` de teste; campanha com dono activo.

```bash
cd backend
uv sync --group dev
# criar campanha + utilizador + atribuir-dono (095)
```

## Cenários

### 1. Retrato oculto (SC-001)

1. Como membro: upload portrait; associar a personagem `visivel_para_todos=false`.
2. Anónimo: `GET /api/c/{slug}/media/portraits/{file}` → **404**.
3. Com cookie de membro: mesmo GET → **200**, header `Cache-Control: private, no-store`.
4. Tornar personagem visível → anónimo **200**; voltar a ocultar → anónimo **404** (sem cache partilhada).

### 2. Mapa versionado + config (SC-004)

1. Upload `category=map` → resposta `url` sob `/api/c/…/media/map/…`; `mapa_arquivo` preenchido.
2. `GET /api/c/{slug}/config` → `has_map_image: true` sem depender de `campaign-map.*`.
3. Anónimo obtém o mapa pelo path de mídia.
4. Leftover 094 (opcional): gravar `campaign-map.webp` com campo vazio → ler config → campo stamped.

### 3. Cota (SC-002 / SC-006)

1. Em teste, pôr `cota_bytes` pequeno na campanha.
2. Upload que cabe → 200; `bytes_usados` sobe; se ≥90% → `aviso_cota: true` + UI.
3. Upload que excederia → `COTA_EXCEDIDA`; disco inalterado.
4. Em 100%: novo portrait → recusa; mapa novo ≤ tamanho anterior → aceite (delta líquido).

### 4. Isolamento + /uploads morto (SC-003)

1. Ficheiro só em A; pedido sob B → 404.
2. `GET /uploads/c/{slug}/map/…` → 404.

### 5. Reconciliação (SC-007)

```bash
uv run python -m app.cli campanha reconciliar-cota --slug {slug}
```

Com desvio artificial em `bytes_usados`, após comando o valor = soma no disco.

### 6. FE

Abrir `/c/{slug}`: mapa e imagens usam `/api/c/…/media/…` (Network). Slot de upload mostra aviso/erro de cota em pt-BR e en.

## Pytest

```bash
cd backend && uv run pytest
```

Cobertura mínima: ACL retrato, cota (+ sub mapa), isolamento media, rewrite URL, CLI reconciliar.
