# Contract: CLI `campanha importar-legado`

**Feature**: 099  
**Entrypoint**: `uv run campaign-codex` / `python -m app.cli` (093)

## Invocação

```text
campanha importar-legado \
  --origem PATH \
  --slug SLUG \
  --sistema SISTEMA \
  --nome NOME \
  --email EMAIL \
  [--visibilidade listada|so_link] \
  [--cota-bytes N] \
  [--relatorio PATH.json]
```

`campanha importar` (zip 097) **não** aceita `--origem` nem árvore `mapa.db`.

## Parâmetros

| Flag | Obrigatório | Notas |
|------|-------------|--------|
| `--origem` | sim | Pasta da instância (não ficheiro `.db`/zip) |
| `--slug` | sim | Produção: `wfrp` ou `wod` |
| `--sistema` | sim | `wfrp4e` \| `wod` |
| `--nome` | sim | Nome no catálogo 098 |
| `--email` | sim | Utilizador 095 existente e activo → dono |
| `--visibilidade` | não | Omissão `listada` |
| `--cota-bytes` | não | Omissão `10 * 1024**3`; inteiro > 0 |
| `--relatorio` | não | Grava JSON do relatório; stdout imprime sempre resumo |

## Efeitos (sucesso, exit 0)

1. Campanha nova no slug; sítio UUID com `campanha.db` (cópia stampada) + uploads.
2. Ponte + Alembic head **só no destino**.
3. URLs de mídia persistidas (ver [url-rewrite-persist.md](./url-rewrite-persist.md)).
4. Dono atribuído; `bytes_usados` / `mapa_arquivo` / `cota_bytes` coerentes.
5. Relatório `PASS` em stdout (e ficheiro se pedido).
6. Árvore `--origem` **byte-igual** à pré-condição.

Stdout sucesso (linha): `OK {slug} {caminho} PASS`

## Recusas (exit 1, stderr `ERRO {CODIGO}`)

| Código | Quando |
|--------|--------|
| `ORIGEM_INVALIDA` | não é pasta; falta `mapa.db` ou `uploads/`; é zip/`.db` solto |
| `SLUG_INVALIDO` / `SLUG_RESERVADO` / `SLUG_DUPLICADO` | 093 |
| `SISTEMA_INVALIDO` | fora de `wfrp4e`/`wod` (e conhecidos 093) |
| `USUARIO_NAO_ENCONTRADO` | email inexistente/inactivo |
| `COTA_EXCEDIDA` | soma uploads > `cota_bytes` |
| `CONTAGEM_DIVERGENTE` | relatório FAIL |
| `URL_MIDIA_DESCONHECIDA` | URL de imagem não mapeável |
| `UPLOADS_LAYOUT_DESCONHECIDO` | cópia de uploads não classificável (se aplicável) |

Em **qualquer** recusa após criar sítio: rollback destino; origem intacta.

## Não-efeitos

- MUST NOT correr ponte/stamp/`UPDATE` na origem.
- MUST NOT escrever Caddyfile, tunnel, hub, `/opt/codex-*`.
- MUST NOT importar zip 097.
