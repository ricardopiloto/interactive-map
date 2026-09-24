# Data Model: Exportar / importar (097)

**Feature**: `097-exportar-importar`  
**Date**: 2026-09-20

## Schema changes

**Nenhuma revisão Alembic nova** nesta fase. Usa:

- Controlo: `Campanha`, `Membro` (dono), já 093/095
- Conteúdo: tabelas actuais de `campanha.db` (head `001_campaign` e futuras)

## Pacote (entidade lógica)

### Manifesto (`manifest.json`)

| Campo | Obrigatório | Notas |
|-------|-------------|-------|
| `package_format` | sim | Inteiro; actualmente `1` |
| `schema_version` | sim | ID revisão Alembic conteúdo |
| `app_version` | sim | Metadado |
| `sistema` | sim | Deve ser conhecido (`wfrp4e`, `wod`, …) |
| `modulos_ativos` | sim | Lista |
| `slug_origem` | sim | Para default de slug na importação |
| `nome` | sim | Nome público |
| `visibilidade` | sim | `listada` \| `so_link` |
| `mapa_arquivo` | não | Nome em `uploads/map/` se houver mapa |

### Conteúdo (`content.json`)

Objecto com arrays (e `map_scale` opcional):

| Chave | Fonte |
|-------|--------|
| `arcos` | `arco` |
| `npcs` | `npc` (personagens) |
| `locais` | `local` |
| `local_npc` | `local_npc` |
| `local_conexao` | `local_conexao` |
| `grupo_posicao` | `grupo_posicao` (0..1 linhas típicas) |
| `vinculos` | `vinculo` |
| `waypoints` | `waypoint` |
| `route_segments` | `route_segment` |
| `map_scale` | `map_scale` (objecto ou null) |

Cada registo MUST incluir o `id` original. Campos de URL de mídia podem ainda referir o slug antigo (reescritos no import).

### Imagens

Ficheiros sob `uploads/{map,portraits,locals}/` no zip = cópia do sítio da origem. Órfãos (não referidos no JSON) **permitidos**; referidos em falta → recusa.

## Campanha nova (pós-import)

| Campo controlo | Origem |
|----------------|--------|
| `slug` | Resolvido (FR-014) |
| `nome`, `sistema`, `modulos_ativos`, `visibilidade` | Manifesto |
| `caminho` | `campanhas/<uuid-novo>` |
| `mapa_arquivo` | Manifesto / ficheiro restaurado |
| `cota_bytes` | Default 093 (10 GiB) |
| `bytes_usados` | Reconciliado após cópia |
| `activa` | `true` |

`Membro`: um `dono` = importador (API) ou `--email` (CLI).

## Validation rules

1. Lista fechada de paths no zip.
2. Todo FK / ID referido no JSON existe no pacote.
3. Todo ficheiro referido (`retrato_url`, `imagem_url`, `mapa_arquivo`) existe no zip.
4. Soma imagens ≤ `cota_bytes`.
5. `schema_version` reconhecida; migrar se antiga.
6. `sistema` conhecido.
7. Sem adoptar `.db`.

## State transitions (import)

```text
zip recebido
  → validar (falha: recusa, zero efeitos)
  → criar sítio + DB head + inserts + imagens
      (falha: limpar sítio + sem linha controlo)
  → commit Campanha + Membro dono
  → sucesso
```

## Relationships

```text
Pacote ──export──► Campanha origem (só leitura)
Pacote ──import─► Campanha nova + Membro(dono) + campanha.db + uploads/
```

Contas / sessões / convites **não** viajam.
