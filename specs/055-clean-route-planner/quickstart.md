# Quickstart: Clean Calcular Rota Panel

**Feature**: `055-clean-route-planner`  
**Date**: 2026-08-05

Validação manual. Ver [contracts/ui-clean-route-planner.md](./contracts/ui-clean-route-planner.md) e [research.md](./research.md).

## Prerequisites

- Frontend + backend a correr
- Painel **Calcular rota** com nós De/Para válidos

## Scenarios

### A — Ordem e caminho limpo (SC-001, SC-002, FR-001)

1. Abrir Calcular rota (opções não tocadas).

**Expect**: Ordem De → Para → Calcular → “Opções de viagem” recolhido → (lista vazia); sem parede de fieldsets; sem linha de resumo.

2. Escolher De/Para; Calcular **sem** expandir opções.

**Expect**: Lista aparece; defaults (pago, normal, mais rápida, sem preferência).

### B — Resumo de não-defaults (SC-006, FR-003a)

1. Expandir opções; escolher Próprio e/ou Mais barata e/ou Por rio; recolher.

**Expect**: Cabeçalho mostra resumo curto (ex. `Próprio · Mais barata · Por rio`).

2. Repor tudo aos defaults (ou reabrir painel).

**Expect**: Sem linha de resumo.

### C — Poder intacto (SC-003, SC-004, FR-004)

1. Expandir; alterar transporte, ordenação, preferência; confirmar auto-recalc.
2. Em próprio: campo velocidade visível; em pago: oculto.
3. Fechar e reabrir.

**Expect**: Comportamento 046/050/054 intacto; opções outra vez recolhidas; defaults de negócio repostos.

### D — Resultados compactos (FR-005)

1. Com lista preenchida, inspeccionar um item.

**Expect**: Título + uma linha de meta (mi · tempo · Dentro/Fora), não quatro bandas iguais.

### E — Labels leves (FR-006)

1. Opções expandidas: ritmo Normal/Intenso (horas como apoio, não no label principal); transporte Pago/Próprio.

**Expect**: Escaneável em ≤ 30 s.

### F — Viewport baixa

1. Janela baixa / painel com scroll.

**Expect**: Calcular alcançável sem expandir opções.

## Non-goals

- Não validar mudanças de API ou digitizer.
- Não exigir microcopy exacta além do espírito research §2.
