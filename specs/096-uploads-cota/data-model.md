# Data Model: Uploads / cota (096)

**Feature**: `096-uploads-cota`  
**Date**: 2026-09-20

## Schema changes

**Nenhuma revisão Alembic nova.** Campos já em `Campanha` (093 / `control.db`):

| Campo | Uso nesta fase |
|-------|----------------|
| `mapa_arquivo` | Nome do ficheiro em `uploads/map/` (versionado ou ponte `campaign-map.*`); vazio = sem mapa |
| `cota_bytes` | Teto (default 10 GiB); não editável na UI nesta fase |
| `bytes_usados` | Contador; actualizado em upload/substituição mapa; corrigido por CLI |

`campanha.db` inalterado (Personagem/`retrato_url`, Local/`imagem_url` já existem).

## Layout em disco (inalterado 093)

```text
{DATA_DIR}/campanhas/<uuid>/uploads/
  map/         # mapa corrente (nome = mapa_arquivo)
  portraits/   # retratos (nome UUID)
  locals/      # imagens de locais (nome UUID)
```

Slug **nunca** aparece no caminho de disco.

## Entidades lógicas

### PedidoMedia

| Campo | Origem |
|-------|--------|
| slug | path |
| categoria | `map` \| `portraits` \| `locals` |
| arquivo | basename (sem `..`) |
| actor | anónimo \| membro da campanha \| membro outra |

### RegraVisibilidadeRetrato

- Membro da campanha do slug → permitido se ficheiro existe.
- Senão → permitido sse ∃ Personagem (nessa DB) com URL a apontar para esse ficheiro **e** `visivel_para_todos`.

### CotaOperacao

| Tipo upload | Uso resultante |
|-------------|----------------|
| portrait / local | `bytes_usados + size` |
| map (com anterior) | `bytes_usados - size(mapa_arquivo) + size_novo` |
| map (sem anterior) | `bytes_usados + size_novo` |

Recusa se resultante > `cota_bytes`. Órfãos (retrato/local antigos) **não** descontam.

### PonteMapa094

Transição única:

```text
mapa_arquivo == "" AND ∃ campaign-map.{webp|jpg|jpeg|png|gif}
  → mapa_arquivo := esse nome; commit
  → has_map_image true daí em diante só via campo
```

## Relationships

```text
Campanha (control) 1—1 sítio uploads (caminho)
Campanha.mapa_arquivo → ficheiro em uploads/map/
Personagem.retrato_url → path lógico /api/c/{slug}/media/portraits/… (ou legado /uploads/… reescrito na leitura)
Local.imagem_url → idem locals
Membro (095) → ACL «sempre acede» na campanha
```

## Validation

- Path traversal / categoria inválida → 404 ou 400 (sem sair do sítio).
- Config pública: **não** expor `bytes_usados` / `cota_bytes`.
- Upload member-only (095).
