# Quickstart: Tipo Filter Double-Click

**Feature**: `074-tipo-filter-double-click`  
**Purpose**: Validate solo / restore on Relações tipo chips ([spec.md](./spec.md)).

## Prerequisites

- App running; open `/relacoes`
- Side column **Tipos de vínculo** visible

## Scenarios

### 1. Isolate (US1 / SC-001)

1. Ensure several/all chips active.
2. Double-click **Romance**.
3. Expect only Romance active; network shows only romance-matching edges (incl. duas vias rules).

### 2. Restore (US1 / SC-002)

1. From solo Romance, double-click **Romance** again.
2. Expect all six tipos active; no brief empty network.

### 3. Switch solo (US1.3)

1. Solo Romance, then double-click **Aliado**.
2. Expect only Aliado active.

### 4. Single click still works (US2 / SC-003)

1. With all active, single-click Inimizade → turns off.
2. Single-click again → turns on.
3. Then double-click any tipo → solo as in scenario 1.

## Contract

[ui-tipo-filter-double-click.md](./contracts/ui-tipo-filter-double-click.md)
