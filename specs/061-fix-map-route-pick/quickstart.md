# Quickstart: Fix Map Pick for Calcular Rota

**Feature**: `061-fix-map-route-pick`  
**Date**: 2026-08-06

Validação manual. Ver [contracts/ui-map-route-pick-fix.md](./contracts/ui-map-route-pick-fix.md).

## Prerequisites

- Frontend + backend running
- ≥ 2 cidades que **aparecem no combobox** De/Para e têm pin no mapa
- Preferir cidades que antes abriam só o modal (sintoma 060)

## Scenarios

### A — Sintoma 060 eliminado (FR-009 / FR-010)

1. Abrir **Calcular rota** (De/Para vazios).
2. Clicar pin de uma cidade que está no combobox.

**Expect**: **De** = essa cidade; **modal não abre**.

### B — Para + auto-cálculo (FR-011 / SC-001)

1. Após A, clicar segundo pin (outra cidade do combobox).

**Expect**: **Para** = segunda cidade; lista de rotas aparece **sem** premir Calcular; modal não abre.

### C — Terceiro clique

1. Clicar terceiro pin elegível.

**Expect**: Só Para muda; rotas recalculam.

### D — Sem nó / fallthrough

1. Clicar pin que **não** está no combobox (se existir).

**Expect**: De/Para intactos; modal pode abrir.

### E — Painel fechado (SC-005)

1. Fechar Calcular rota; clicar pins.

**Expect**: Detalhe/selecção como antes.

### F — Híbrido (US3)

1. Escolher De no combobox; clicar Para no mapa.

**Expect**: Para preenchido; auto-cálculo.

### G — Calcular manual (SC-006)

1. Com De/Para válidos, premir Calcular.

**Expect**: Continua a funcionar.

## Non-goals

- Digitizer / placement GM.
