# Data Model: Home / painel (098)

**Feature**: `098-home-painel-mestre`  
**Date**: 2026-09-20

## Schema changes

**Nenhuma.** Usa entidades 093/095:

### Campanha (controlo)

| Campo | Uso 098 |
|-------|---------|
| `slug`, `nome`, `sistema` | catálogo + painel |
| `visibilidade` | filtro home; editável pelo dono |
| `activa` | omitir se false (home e painel) |
| `bytes_usados`, `cota_bytes` | só painel / API minhas |
| `modulos_ativos` | defaults no create; não editável na UI |

### Membro

| Campo | Uso 098 |
|-------|---------|
| `papel == "dono"` | inclusão em «minhas campanhas»; PATCH visibilidade; export UI |
| outros papéis | omitidos do painel (podem usar `/c/{slug}` se membros) |

## Entidades lógicas (API)

### ItemCatálogo

```text
slug, nome, sistema
```

### ItemPainel

```text
slug, nome, sistema, visibilidade,
bytes_usados, cota_bytes,
aviso_cota: bool   # bytes_usados >= 0.9 * cota_bytes
```

### CriarCampanha (input)

```text
nome: str
slug: str          # validate_slug 093
sistema: str       # KNOWN_SISTEMAS
visibilidade?: "listada" | "so_link"   # default listada
```

## Validation rules

1. Catálogo: só `activa` ∧ `listada`.
2. Minhas: só `activa` ∧ membership dono do user autenticado.
3. Create: slug livre/válido; sistema conhecido; anónimo 401.
4. PATCH visibilidade: só dono; valor ∈ {listada, so_link}.
5. Inactivas: nunca listadas nesta fase (CLI activa/desactiva fora).

## State transitions

```text
criar → Campanha(activa=true, visibilidade=default|body) + Membro(dono)
PATCH visibilidade listada ↔ so_link  (só dono)
# activa true→false: fora de escopo UI
```

## Relationships

```text
Usuario ──dono──► Campanha*   (painel)
Anónimo ────────► Catálogo (subset listada)
```
