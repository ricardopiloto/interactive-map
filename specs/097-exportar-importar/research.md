# Research: Exportar e importar campanha

**Feature**: `097-exportar-importar`  
**Date**: 2026-09-20

## 1. Formato do pacote

**Decision**: Zip com lista **fechada** de entradas:

```text
manifest.json
content.json
uploads/map/<arquivo>
uploads/portraits/<arquivo>
uploads/locals/<arquivo>
```

Qualquer outra entrada (incl. `.db`, `.txt`, scripts, paths absolutos, `..`) → recusa do pacote.

**Rationale**: FR-003; clarificação «só entradas do contrato»; espelha layout 093/096.

**Alternatives considered**: Um JSON por entidade em `data/` — mais ficheiros, mesma informação. Tar.gz — menos universal no Windows; zip é o pedido.

## 2. Biblioteca zip

**Decision**: `zipfile` da stdlib Python. Extrair para diretório temporário sob `DATA_DIR/tmp/` (ou `tempfile`) com checagens de path e tecto de tamanho **antes** de criar a campanha.

**Rationale**: Constituição IV; sem dependência nova.

**Alternatives considered**: `pyzipper` / encriptação — fora de escopo. Streaming zip response via `StreamingResponse` + `BytesIO` ou ficheiro temp para export.

## 3. Manifesto e versão de schema

**Decision**:

```json
{
  "schema_version": "<alembic_campaign_revision_id>",
  "app_version": "<pyproject version>",
  "sistema": "wfrp4e",
  "modulos_ativos": ["fadiga"],
  "slug_origem": "minha-campanha",
  "nome": "…",
  "visibilidade": "listada",
  "mapa_arquivo": "abc.webp",
  "package_format": 1
}
```

- Portão: `schema_version` ∈ registadas; se `>` head / desconhecida → `SCHEMA_FUTURO` / `SCHEMA_DESCONHECIDO`.
- Mais antiga reconhecida → aplicar migrators em cadeia até head, **depois** inserir no SQLite novo já criado na head (`ensure_campaign_schema(fresh=True)`).
- `app_version` = diagnóstico, não portão.

**Rationale**: FR-011; Assumptions; VI.

**Alternatives considered**: Versionar só o JSON (`package_format`) e ignorar Alembic — rejeitado (spec liga a revisão de conteúdo). Correr Alembic sobre `.db` extraído — rejeitado (FR-010).

## 4. Migrators de schema antigo

**Decision**: Registo `SCHEMA_MIGRATORS: dict[str, Callable[[dict], dict]]` que transforma `content.json` (+ campos do manifesto se preciso) de revisão N → N+1. Head actual (`001_campaign`) é o alvo. Enquanto só existir uma revisão, o caminho «antigo» testa-se com um id sintético de fixture (ex. `000_pre`) cujo migrator é identidade ou remapeia um campo de teste — documentado nos testes.

**Rationale**: Permite US4 sem inventar segunda revisão Alembic só para a feature.

**Alternatives considered**: Exigir segunda revisão Alembic real já — desnecessário se o JSON actual cobre o modelo.

## 5. Serialização de conteúdo

**Decision**: Um `content.json` com chaves por tabela de conteúdo:

`arcos`, `npcs` (personagens), `locais`, `local_npc`, `local_conexao`, `grupo_posicao`, `vinculos`, `waypoints`, `route_segments`, `map_scale` (objecto único ou lista).

IDs explícitos em cada linha. Links M2M / FKs validados: todo ID referenciado existe no pacote.

**Rationale**: FR-005/012a; um ficheiro simplifica validação atómica.

**Alternatives considered**: Dump SQL — fácil de abusar / acoplado ao SQLite. ORM pickle — inseguro.

## 6. Autorização

**Decision**:

- Export HTTP: `Depends(require_dono)` — sessão + `Membro.papel == "dono"` para o slug.
- Import HTTP: sessão de utilizador **activo** (não precisa membership); cria campanha + `assign_owner` ao importador.
- CLI: sem cookie; operador confiado no host (como `campanha criar`); import exige `--email` de utilizador existente.

**Rationale**: Clarificações Q1; FR-001/013; alinhado 095.

**Alternatives considered**: Só operador na API import — rejeitado (clarificação). Co-mestre exporta — rejeitado (spec).

## 7. Atomicidade e rollback

**Decision**: Pipeline import:

1. Ler zip para temp; validar entradas, manifesto, schema, JSON, FKs, imagens referidas, cota.
2. Só então: `uuid` novo → mkdir sítio → `campanha.db` fresh head → insert rows → copiar imagens → reconciliar `bytes_usados` → insert `Campanha` + `Membro` dono.
3. Qualquer falha após (2) → apagar sítio + rollback controlo (sem linha órfã).

Validação completa **antes** de tocar no controlo sempre que possível; se falhar a meio do (2), cleanup obrigatório (FR-012).

**Rationale**: SC-002; clarificações.

## 8. Slug e URLs de mídia

**Decision**: Resolver slug: `--slug` / body `slug` se válido e livre; senão `slug_origem` se livre; senão `SLUG_OCUPADO` / `SLUG_INVALIDO`. Reescrever no JSON importado todos os paths `/api/c/{old}/media/…` e legados `/uploads/c/{old}/…` para o slug novo (096).

**Rationale**: Clarificação Q2; FR-009/014.

## 9. Tecto zip-bomb

**Decision**: Recusar se soma dos tamanhos descomprimidos (ou `ZipInfo.file_size`) > `cota_bytes` (default 10 GiB) + **64 MiB** margem para JSON/manifesto. Também recusar se número de entradas > limite razoável (ex. 50 000).

**Rationale**: Edge case zip-bomb; IV.

## 10. Rotas e CLI

**Decision**:

| Superfície | Contrato |
|------------|----------|
| `GET /api/c/{slug}/admin/export` | dono; `application/zip` |
| `POST /api/campanhas/import` | multipart `file` + opcional `slug`; cookie sessão |
| `campanha exportar --slug S --out PATH` | CLI |
| `campanha importar --zip PATH --email E [--slug S]` | CLI |

Actualizar matriz 095: export = 401 anónimo, 403 não-dono/outra campanha, 200 dono.

**Rationale**: Spec FR-001/002/013.

## Resolvidos

Clarificações 2026-09-20 fecham quem importa, slug, FKs, imagens em falta, extras. Sem NEEDS CLARIFICATION restantes.
