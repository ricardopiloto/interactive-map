# Data Model: Route Transport Mode

**Feature**: `050-route-transport-mode` | **Date**: 2026-08-05

No persistent database entities change. Session/request concepts only.

## Entities (request / UI)

### Modo de transporte

| Attribute | Type | Rules |
|-----------|------|-------|
| valor | `pago` \| `proprio` | Required in new UI; API default `pago` |
| Velocidade aplicável | — | Só `proprio` |
| Custos de passagem | — | `pago` = tabela; `proprio` = 0 Dentro e Fora |

### Velocidade própria

| Attribute | Type | Rules |
|-----------|------|-------|
| mi/h | number | `> 0`; UI default **4**; required for meaningful próprio calc |
| Visibilidade | UI | Só quando modo = próprio |
| Reset | UI | Ao entrar em próprio (de pago ou ao abrir e escolher próprio): **4** |

### Parâmetros de plano (existentes, inalterados na forma)

| Attribute | Notes |
|-----------|-------|
| ritmo | normal / intenso — unchanged |
| ordenacao | mais_rapida / mais_barata — unchanged; em próprio barata empata em custo |
| origem / destino | waypoint ids — unchanged |

### Resposta de rota (shape unchanged)

| Field | Pago | Próprio |
|-------|------|---------|
| tempo_* | Tabela × mods | Velocidade própria × mods |
| custo_dentro_bp / custo_fora_bp | Tabela | **0** |
| geometria / tipos | Unchanged | Unchanged |

## Relationships

```text
UI Modo ──pago──► API modo_transporte=pago ──► table speed + table cost
       └──proprio► API modo_transporte=proprio + mph ──► override speed + zero cost
```

## Validation

- Próprio + mph ≤ 0 or non-numeric → UI blocks; API 422 if mph invalid when sent.
- Origem = destino → existing 422.
- Invalid `modo_transporte` → 422.
