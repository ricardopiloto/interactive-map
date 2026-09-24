# Contract: CLI campanha (criar / listar)

Superfície de operador (não HTTP). Códigos de erro estáveis (stdout/stderr + exit ≠ 0).

## `campanha criar`

**Args** (mínimo): `--slug`, `--nome`, `--sistema`; opcional `--visibilidade` (`listada` default), `--modulos` (senão default do sistema).

**Sucesso**: exit 0; registo em `control.db`; pasta `{DATA_DIR}/campanhas/<uuid>/` com `campanha.db` (revisão head) e `uploads/`; imprime slug + caminho (ou UUID).

**Falhas** (exit ≠ 0, sem pasta órfã):

| Condição | Código sugerido |
|----------|-----------------|
| Slug malformado / `--` | `SLUG_INVALIDO` |
| Slug reservado | `SLUG_RESERVADO` |
| Slug duplicado | `SLUG_DUPLICADO` |
| Sistema desconhecido (opcional strict) | `SISTEMA_INVALIDO` |

## `campanha listar`

**Sucesso**: exit 0; lista (vazia ok) com pelo menos slug, nome, sistema, visibilidade por linha.

## Fora

Activar/desactivar; importar legado; convites.
