# UI Contract: Personagem visibility (GM)

**Feature**: `084-personagem-visibility`  
**Date**: 2026-08-13  
**Consumers**: `PersonagemFormDialog`, `GraphStage`, Relacoes GM chrome; i18n `relacoes`

## Form control (FR-001, clarify Q3)

| Rule | Behavior |
|------|----------|
| Control | Checkbox or toggle labelled **«Visível para todos»** / EN equivalent |
| Default (create) | Checked / on |
| Off | Personagem apenas GM; show helper text «oculto aos jogadores» (localized) |
| Edit | Reflects stored `visivel_para_todos` |
| Save | Payload includes boolean |

## Graph node (FR-005, clarify Q2)

| Rule | Behavior |
|------|----------|
| When | `isGm && !personagem.visivel_para_todos` |
| What | Discrete badge/marker on the node (CSS class + accessible name/title) |
| Player | N/A — node not in dataset |

## Detail / lists (optional polish)

- Selected hidden personagem in GM detail panel may repeat the «oculto» tag (nice-to-have; form+node are mandatory).

## Player surfaces

- No empty-state copy that implies hidden characters exist.
- Map pin modal only lists NPCs returned in `npc_ids` / public NPC list.

## i18n keys (suggested)

| Key | pt-BR (sketch) | en (sketch) |
|-----|----------------|-------------|
| `personagemForm.visivelParaTodos` | Visível para todos | Visible to everyone |
| `personagemForm.ocultoAosJogadores` | Oculto aos jogadores | Hidden from players |
| `graph.ocultoAria` | Personagem oculto aos jogadores | Character hidden from players |
