# Data Model: Vínculos Sort by Name

**Feature**: `072-vinculos-sort-name`  
**Date**: 2026-08-12

No persisted changes. Client-only ordering of an existing list:

| Input | Sort key |
|-------|----------|
| `Vinculo` + selected `personagem.id` | Other endpoint’s `Personagem.nome` via `personagemById` |
| Unresolved other id | Sort bucket: last |
| Tie | `Vinculo.id` |

Visibility (public/GM filter) unchanged upstream.
