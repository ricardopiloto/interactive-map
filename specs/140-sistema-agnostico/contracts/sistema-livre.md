# Contract: Nome de sistema livre (criação + import)

**Surface**: API / CLI / pacote ZIP — campo `sistema` da campanha.

## Criação — `POST /api/campanhas` (e CLI `campanha criar`)

| Input `sistema` | Antes | Depois |
|-----------------|-------|--------|
| `wfrp4e` / `wod` | 201 + módulos default do mapa | Igual |
| Outro não-vazio ≤40 chars (ex. `desconhecido`, `shadowdark`) | 400 `SISTEMA_INVALIDO` | **201** + `modulos_ativos` = `[]` (salvo override explícito) |
| Vazio / omitido inválido | 422 validação Pydantic | Igual (`min_length=1`) |
| >40 chars | 422 | Igual (`max_length=40`) |

`SISTEMA_INVALIDO` MUST NOT ser emitido por allowlist de nomes.

## Import — validação de pacote ZIP

| Manifest `sistema` | Antes | Depois |
|--------------------|-------|--------|
| Fora de `KNOWN_SISTEMAS` | `PackageError(SISTEMA_DESCONHECIDO)` | Aceite; segue restantes validações (FK, imagens, cota, …) |
| `wfrp4e` / `wod` | OK | OK |

`SISTEMA_DESCONHECIDO` MUST NOT ser emitido só por nome de sistema desconhecido.

## Sem mudança

- Isolamento entre campanhas
- Schema SQLite / export manifest shape (`sistema` string)
- Frontend: input livre + datalist de sugestões
- Lookup de módulos por chave exacta em `DEFAULT_MODULOS_BY_SISTEMA`
