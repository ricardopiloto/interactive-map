# Data Model: Filtro de estado na Rede de Relações

**Feature**: `090-relacoes-status-filter`  
**Date**: 2026-08-14

Nenhuma entidade persistida nova. Nenhuma coluna, migração ou contrato HTTP.

## Estado do personagem (já existe)

| Campo | Valores | Notas |
|-------|---------|--------|
| `Personagem.status` | `vivo` \| `morto` \| `desaparecido` \| `desconhecido` | Ausente / null → tratar como `desconhecido` |

## Filtro (sessão, não gravado)

| Campo | Tipo | Omissão |
|-------|------|---------|
| `statusFilter` | `'todos'` \| `vivo` \| `morto` \| `desconhecido` \| `desaparecido` | `'todos'` |

**Validação**: escolha única; valor inválido não deve ocorrer (só as cinco opções do `<select>`). Recarregar a página reinicia em `todos`.

**Lifecycle**:

1. Utilizador muda o `<select>`.
2. `visiblePersonagens` / `visibleVinculos` actualizam.
3. Palco recalcula anéis; lista mostra o novo conjunto (depois a busca).
4. Se o seleccionado saiu do conjunto → desseleccionar.
5. Isolar, se activo, aplica-se ao palco já filtrado.

## Relação com Isolar e chips

- Filtro de estado: **conjunto** de nós (e arestas entre eles).
- Chips de tipo: arestas (um nó pode ficar sem linhas e continuar visível).
- Isolar: máscara no palco sobre o conjunto já filtrado; a lista **não** encolhe por Isolar.
