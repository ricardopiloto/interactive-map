# UI Contract: Combobox De/Para (Calcular rota)

**Feature**: `036-route-endpoint-search`  
**Surface**: Painel `RoutePlannerPanel` — campos **De** e **Para**  
**Date**: 2026-08-03

## Scope

Substitui os `<select>` de origem/destino. Não define contrato HTTP.

## Control behaviour

| Aspect | Contract |
|--------|----------|
| Controlo | Combobox (input de texto + lista de sugestões) |
| Labels | `waypointOptionLabel` (inalterado) |
| Lista vazia de filtro | Mensagem visível de “nenhuma correspondência” (ou equivalente); sem opções seleccionáveis |
| Filtro vazio | Todas as opções elegíveis, ordenadas |
| Match | Substring; case-insensitive; accent-insensitive; trim no query |
| Selecção | Clique ou teclado (Enter) numa sugestão → `selectedId` + `query = label` |
| Reeditar | Qualquer mudança no input após selecção → `selectedId` limpo |
| Independência | De e Para com estado/filtro próprios |
| Extremo oposto | Não omitir da lista; De ≠ Para só em Calcular |
| Calcular | Usa apenas `selectedId` (não texto solto sem selecção) |

## Non-goals

- Pesquisa no servidor
- Fuzzy match / sinónimos
- Alterar overlay de rotas, ritmos, custos ou API `planRoute`
- Digitizer / mapa

## Acceptance mapping

| Spec | Contract |
|------|----------|
| FR-001–005, FR-009 | Combobox + select clear-on-edit |
| FR-003 | Accent-fold match |
| FR-006 | Same visible labels |
| FR-007 | Planner untouched |
| FR-008 | Empty state visible; no calc without selection |
| FR-010 | Full option set both sides |
