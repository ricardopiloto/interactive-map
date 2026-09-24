# Research: Componentes base e ícones

**Feature**: `101-componentes-base-icones`  
**Date**: 2026-09-20

## 1. Overlay / focus trap

**Decision**: Implementação própria: portal, `role="dialog"`, `aria-modal`, Tab cycle dentro do contentor, Esc fecha, `overflow: hidden` no `body`, restore focus.

**Rationale**: Clarificação Q1; Constituição IV.

## 2. Toast

**Decision**: `ToastProvider` na raiz + `toast.error/success/info(message)` imperativo (fila curta, auto-dismiss ~4s, dismiss manual).

**Rationale**: Clarificação Q3; substitui `alert` sem reestruturar ecrãs.

## 3. ConfirmDialog

**Decision**: Promise-based helper `confirmDialog({ title, body, danger })` **ou** estado controlado; call sites de delete usam ConfirmDialog controlado com callbacks onConfirm/onCancel (mais simples com React). Preferir estado local + ConfirmDialog component nos 7 confirm sites; Toast nos 3 alert sites.

**Rationale**: FR-005; evitar segunda lib.

## 4. Legacy CSS

**Decision**: Novos componentes com classes `ui-*`; `.btn` legado permanece até UX-3+.

**Rationale**: Clarificação Q2.

## 5. Tabler

**Decision**: `npm i @tabler/icons-react`; imports `import { IconTrash } from '@tabler/icons-react'`; tamanhos 16/20; decorativo `aria-hidden`.

**Rationale**: RFC §6; MIT; FR-001.

## 6. Touch targets

**Decision**: `min-height/min-width: 40px`; `@media (pointer: coarse) { min: 44px }`.

**Rationale**: Clarificação Q4.

## 7. Drawer

**Decision**: Componente + demo styleguide; sem migrar formulários (UX-8).

**Rationale**: Clarificação Q5.
