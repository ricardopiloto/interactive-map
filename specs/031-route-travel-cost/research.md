# Research: 031-route-travel-cost

## 1. Dois modos de velocidade

**Decision**:
- **Sem override** (`velocidade_media_mph` omitido / `null`): velocidades **absolutas** por tipo — `estrada=6`, `rio=8`, `trilha=6*0.8=4.8`. Não usar `base * TIPO_MOD` neste modo (porque `6*1.4=8.4 ≠ 8` da tabela).
- **Com override V** (`>0`): `speed = V * TIPO_MOD` com mods atuais `1.0 / 1.4 / 0.8` (clarificação A).

**Rationale**: Spec SC-004 exige razão tempo rio/estrada = 6/8 com campo vazio; com override mantém o modelo 024.

**Alternatives considered**:
- Sempre `V * mod` com default V=6 → rio ficaria 8.4; rejeitado pela tabela
- Default V=4 antigo → rejeitado pela clarificação

## 2. API: velocidade opcional

**Decision**: Query param `velocidade_media_mph` opcional. Se **ausente**, modo tabela 6/8. Se **presente**, deve ser `> 0` (senão 422). Remover default `4.0` do FastAPI Query.

**Rationale**: FR-008–FR-013; FE pode omitir o param quando o input está vazio.

**Alternatives considered**:
- Sentinel `0` = default tabela → confunde com inválido
- Manter default 4 e flag `usar_tabela` → overkill

## 3. Custos bp

**Decision**: Constantes no planner:

| Tipo | Dentro bp/mi | Fora bp/mi |
|------|--------------|------------|
| estrada | 2 | 1 |
| rio | 5 | 2 |
| trilha | 0 | 0 |

Por rota: somar `distancia_milhas * tarifa` por trecho (usar milhas do segmento na aresta). Expor `custo_dentro_bp` e `custo_fora_bp` (float arredondado a 2 casas, ou int se inteiro). Custo **independente** da velocidade.

**Rationale**: FR-001–FR-006; SC-001–SC-003.

**Alternatives considered**: Só um custo + toggle → rejeitado na clarificação.

## 4. `modificador_velocidade` no segmento

**Decision**: Em modo override (V), manter `edge_mod(seg)` (override de segmento se preenchido). Em modo tabela 6/8, se `modificador_velocidade` estiver set, aplicar como fator sobre a velocidade absoluta do tipo (`tipo_speed * modificador` se modificador for fator, ou substituir — **preferir**: se `modificador_velocidade` set, usar como hoje `V_effective = tipo_base_or_V * edge_mod` onde em modo tabela `tipo_base` já é 6/8/4.8 e `edge_mod` devolve 1.0 se não houver override de segmento…  

Simplificar:  
- Modo tabela: `speed = ABS_SPEED[tipo]` unless `seg.modificador_velocidade` is set, then `speed = ABS_SPEED[tipo] * seg.modificador_velocidade` only if we treat it as relative — current code uses `modificador` as full replacement for TIPO_MOD when set. Keep: `mod = edge_mod(seg)` replaces TIPO_MOD.  
- Modo tabela sem override de segmento: `speed = ABS[tipo]` (ignore TIPO_MOD multiply).  
- Modo tabela com `modificador_velocidade`: `speed = ABS[tipo] * (modificador / TIPO_MOD_default)` too clever. **YAGNI**: modo tabela `speed = ABS[tipo]`; se `modificador_velocidade` set, `speed = ABS[tipo] * modificador_velocidade` when we document modificador as relative factor — **OR** keep current: `speed = base * edge_mod` with base=V or in table mode use fake bases.

Clean implementation:

```python
ABS_SPEED = {estrada: 6.0, rio: 8.0, trilha: 4.8}

def segment_speed(seg, override: float | None) -> float:
    if override is not None:
        return override * edge_mod(seg)  # edge_mod = custom or TIPO_MOD
    # table mode: absolute; segment override replaces absolute if set?
    if seg.modificador_velocidade is not None:
        return float(seg.modificador_velocidade)  # absolute mph override on segment (existing semantics as factor was relative to V)
    return ABS_SPEED[seg.tipo]
```

Current `edge_mod` returns custom OR TIPO_MOD (1.0/1.4/0.8). With override V: `V * edge_mod` matches today.  
Table mode without segment custom: return ABS_SPEED[tipo] directly (not ABS * TIPO_MOD).  
Table mode with segment `modificador_velocidade`: treat as absolute mph for that segment (same as current when someone set an absolute? Currently it's a multiplier). **Keep**: table mode `speed = ABS[tipo]`; if `modificador_velocidade` set, `speed = float(modificador)` as absolute override for that edge (GM expert). Safer YAGNI: table mode always ABS[tipo]; segment modificador only applies in override-V mode via edge_mod. Document that.

**Decision final**:  
- Override V: `speed = V * edge_mod(seg)` (inalterado vs 024).  
- Sem V: `speed = ABS_SPEED[tipo]` (6 / 8 / 4.8); **ignorar** `modificador_velocidade` no MVP table mode **ou** se set, `speed = ABS * edge_mod` only when edge_mod != default — skip: ignore segment mod in table mode for MVP.

## 5. Frontend

**Decision**: Input velocidade começa **vazio**; placeholder “opcional (padrão coach/balsa)”. Se vazio, `planRoute` omite query param. Se preenchido, validar `> 0` no cliente. Lista mostra `Dentro: X bp · Fora: Y bp`.

**Rationale**: FR-008, US1/US2.

## 6. Escopo de ficheiros

**Decision**: `route_planner.py`, `schemas/routes.py`, `routers/public/routes.py`, `types/index.ts`, `api/campaign.ts`, `RoutePlannerPanel.tsx` (+ CSS leve se preciso).
