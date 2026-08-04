# Research: 033-fix-reposition-pin

## 1. Causa raiz

**Decision**: Tratar como desconexão **rascunho ↔ render do pin**. Fluxo 032: `onStartReposition` → unmount dialog → clique → `setLocalDraft({ ...localDraft, x, y })` + `placement = none`. O formulário mostra as novas coords, mas `CampaignMap` posiciona pins com `local.x` / `local.y` da prop `locais` (lista persistida), **nunca** o draft. Resultado: “esconde o modal mas não reposiciona o pin”.

**Rationale**: Explica o sintoma com o código actual; o handler de clique pode estar correcto e o pin mesmo assim não se move.

**Alternatives considered**:
- Clique no mapa “morto” após 032 → possível regressão secundária; validar no quickstart; causa principal confirmada é a fonte de coordenadas do pin
- Save não actualiza → se `refresh()` após save funcionar, o pin moveria só após save; a spec exige movimento **antes** de salvar

## 2. Onde aplicar o override

**Decision**: Em `MapPage`, derivar `displayLocais` (nome interno livre):

- Se `localDraft` existe, `!localDraft.isNew`, e `localDraft.id != null`: para o local com esse `id`, usar `x`/`y` (e opcionalmente `cor_pin`) do draft; resto da lista inalterada.
- Caso contrário: `displayLocais = locais`.
- Passar `displayLocais` a `CampaignMap` (e a quaisquer consumidores do mapa que mostrem a mesma posição, ex. linhas de saída com origem nesse local).

**Rationale**: Um merge no orquestrador alinha pin + connection lines; `CampaignMap` continua agnóstico.

**Alternatives considered**:
- Prop `pinOverrides: Record<id, {x,y}>` no `CampaignMap` → mais API, mesmo efeito
- Mutar `locais` no state ao clicar (optimistic) → confunde cancel (precisa snapshot); pior que draft overlay
- Auto-save no clique de reposition → rejeitado pela spec (preview até save/cancel)

## 3. Cancelar edição vs Cancelar banner

**Decision**:
- Banner Cancel (032): só `setPlacement('none')` — draft coords inalterados → pin (via merge) inalterado.
- Dialog Cancel: `setLocalDraft(null)` — merge desliga → pin volta a `locais` persistidos (FR-005).

**Rationale**: Cumpre US1/US2 sem estado extra de “posição anterior”.

## 4. Durante `placement === 'reposition'` (antes do clique)

**Decision**: Manter merge activo se draft existir. Antes do clique o draft ainda tem coords antigas → pin fica no sítio antigo (correcto). Após o clique o draft actualiza → pin salta (mesmo com dialog a remountar).

**Rationale**: Não precisa de ghost no cursor nesta entrega (YAGNI).

## 5. Vínculo nó ↔ local

**Decision**: Não mover waypoint nem quebrar `waypoint_id`. Só a posição **visual/persistida do local** via draft/save. Divergência pin–nó se já for possível hoje permanece fora de âmbito.

**Rationale**: Assumptions da spec.

## 6. Regressão 032

**Decision**: Não reverter a condição `localDraft && placement !== 'reposition'` nem o Cancelar do banner. Quickstart deve incluir cenário de mapa livre + pin a mover.
