# UI Contract: Scroll e busca no menu lateral

**Feature**: `037-side-menu-scroll-search`  
**Surface**: `SideMenu` + conteúdo GM em `MapPage`  
**Date**: 2026-08-04

## Scope

Comportamento de layout (scroll) e filtro de listas. Sem contrato HTTP.

## Scroll

| Aspect | Contract |
|--------|----------|
| Região rolável | Apenas o corpo da aba (lista / painel admin / Grupo) |
| Fixos | Header, abas, campo de busca (quando visível) |
| Overflow | Com ≥15 itens (ou conteúdo alto), todos os itens alcançáveis por scroll |
| Viewports | Desktop sidebar + overlay móvel |

## Search

| Aspect | Contract |
|--------|----------|
| Visível | Abas `locais`, `npcs`, `arcos` (jogador e GM) |
| Oculto | Aba `grupo` |
| Query | Um texto partilhado; persiste ao mudar de aba; reaplica na aba nova |
| Match | Substring; case- e accent-insensitive; trim |
| Locais / NPCs | Filtra por `nome` |
| História / arcos | Arco visível se título match **ou** nome de local com esse `arco_id` match |
| GM | Mesmas regras sobre as listas admin (arrays filtrados ou equivalente) |
| Vazio | Mensagem / lista vazia perceptível |
| Selecção | Click num item filtrado = mesmo comportamento de hoje |

## Non-goals

- API / BD
- Fuzzy match
- Filtrar resumo do arco
- Alterar Calcular rota / Rede / mapa (exceto selecção já existente a partir do menu)

## Acceptance mapping

| Spec | Contract |
|------|----------|
| FR-001–002, SC-001, SC-004 | Scroll body + chrome fixo |
| FR-003–008, FR-010–011 | Search rules |
| FR-006 | Persist query |
| FR-007, SC-005 | Player + GM |
| FR-009 | Selection unchanged |
