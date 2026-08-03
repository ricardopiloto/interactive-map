# Quickstart: Validar modais na viewport

## Prerequisites

- Frontend (+ backend se for editar locais reais)
- Preferível: ≥10 locais (lista de Saídas longa) **ou** reduzir altura da janela do browser ≤ 700px
- Um local com descrição Markdown longa para o pin

## Setup

```bash
cd frontend && npm run dev
```

Abrir `http://localhost:5173`. Opcional: DevTools → restringir altura da janela.

## Cenários

### A — Formulário de local, rodapé fixo (SC-001, FR-003/004)

1. Modo GM → editar um local (com muitas opções de Saídas).
2. Encurtar a janela verticalmente.
3. **Esperado**: modal cabe na tela; rolar o miolo mostra todos os campos; **Cancelar/Salvar sempre visíveis** sem rolar até o fim.

### B — Conteúdo curto (FR-007, SC-004)

1. Abrir gate GM ou formulário curto (ex. arco com pouco texto) em janela alta.
2. **Esperado**: painel compacto, não esticado a 90% da tela.

### C — Pin com texto longo (SC-002, FR-005)

1. Abrir pin de local com descrição longa (desktop e ~375px).
2. **Esperado**: corpo rola; **Fechar** permanece visível no rodapé; beside ou centered ambos ok.

### D — Chips longos (FR-008)

1. No form de local, muitos chips de Saídas/NPCs.
2. **Esperado**: chips sobem/descem com o scroll do corpo; sem scrollbar interna só na faixa de chips.

### E — Outros diálogos GM (US3)

1. Abrir editar NPC com descrição longa em janela baixa.
2. **Esperado**: mesmo padrão (corpo rola, ações fixas).

## Referências

- [spec.md](./spec.md)
- [contracts/ui-dialog-viewport-fit.md](./contracts/ui-dialog-viewport-fit.md)
- [research.md](./research.md)
- [data-model.md](./data-model.md)
