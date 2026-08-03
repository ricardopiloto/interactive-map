# Data Model: 014-sidebar-hover-fit

Nenhuma alteração de persistência, schemas ou APIs.

## Estado de UI

| Conceito | Representação | Notas |
|----------|---------------|-------|
| Hover do item Locais | Pseudo-classe CSS `:hover` no cartão | Sem novo state React obrigatório |
| Hover do pin (005) | `hoveredLocalId` existente | Inalterado |
| Campo de busca | `query` string existente | Só layout; filtro inalterado |

## Entidades existentes (inalteradas)

- **Local**: listado nos cartões da aba Locais (jogador)
- **SideMenu tabs / search**: comportamento de filtro permanece

## Transições

1. Mouse enter no cartão de local → fundo sutil + (já existente) pin highlight
2. Mouse leave → remove fundo sutil + limpa hover do pin
3. Clique → seleção/foco/modal como hoje (inalterado)

## Invariantes

- Fundo sutil só nos cartões Locais do modo jogador.
- Busca sempre contida na largura do menu quando visível.
