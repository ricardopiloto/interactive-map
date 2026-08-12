# Contract: UI — Relações screen

**Feature**: `066-relationship-network`  
**Surfaces**: `RelacoesPage`, `CodexHeader`, graph stage, side column, detail panel, GM dialogs

## Navigation

| Requirement | Behaviour |
|-------------|-----------|
| Routes | `/` = Mapa; `/relacoes` = Relações (no campaign map background) |
| Header | Shared: marca Codex; nav Mapa \| Relações (active = accent outline); GM toggle |
| GM on Relações | Show `+ Personagem`, `+ Conexão` when `isGm` |

## Layout

| Region | Behaviour |
|--------|-----------|
| Left column (~236px) | Search, type chips, Isolar selecção, legend — always column (not floating) |
| Stage | Rings + zoom (+/−/1:1); wheel zoom; pan background; drag node = session only |
| Detail | Overlay right ~300px; mobile = bottom sheet; close via ×, stage bg, or same-node toggle |

## Graph behaviour

| State | Behaviour |
|-------|-----------|
| No selection | PJs inner ring, NPCs outer; **no** lines |
| Select | Animate ~0.6s → focus center, directs inner, others outer @ ~28% opacity; **then** fade-in lines for visible edges only |
| Deselect | Animate back to initial; clear lines |
| Player edges | Only `publico` vínculos |
| GM edges | All vínculos |
| Dead | Desaturated + strikethrough name; still selectable |
| Line style | Straight center-to-center; behind discs; conhecido dashed; colors per tipo |
| Labels | Default `rotulosVinculo=foco` |

## Filters

| Control | Behaviour |
|---------|-----------|
| Search | Filter/find by nome |
| Chips | Toggle vínculo tipos (OR of active types for visible edges) |
| Isolar | When focus set: show only focus + direct neighbors (per visible edges) |

## GM dialogs

| Action | Behaviour |
|--------|-----------|
| + Personagem | nome, tipo pj\|npc, papel, facção, descrição (+ portrait as on map) |
| + Conexão / edit line / edit list | A, B, tipo, nota, **público** checkbox (default off on create) |
| Delete personagem | Confirm; cascade vínculos; disappears from map + graph |

## i18n / chrome

Portuguese copy; no emoji UI controls; Nocturne tokens.
