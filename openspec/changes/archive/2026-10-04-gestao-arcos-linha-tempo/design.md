# Design

## Context

"Gerenciar arcos" é um item do menu de ferramentas do mapa (`MapPage.tsx`), só com o modo de edição ligado. Abrir esse item troca o painel lateral do mapa por `ArcoAdminList`; o formulário e os diálogos de criação manual ou por IA também vivem nessa página. A Linha do Tempo já carrega arcos, sessões e locais nesse mesmo modo de edição e já mostra o botão de novo evento no `CodexHeader`. Ver proposal.md para a motivação.

## Goals / Non-Goals

**Goals:**

- Um único sítio para gerir arcos, na Linha do Tempo, com o mesmo portão do botão de novo evento.
- Levar a lista, o formulário e a escolha manual/IA juntos, sem duplicar o fluxo.

**Non-Goals:**

- Novos campos, endpoints ou migração.
- Mudar o que o jogador vê na cronologia, em Por arcos ou em Por descoberta.
- Alterar a sugestão automática de cor; isso é da change `conexoes-arcos-no-tempo`.

## Decisions

- **O botão fica nos filhos do `CodexHeader` da Linha do Tempo, ao lado de "Novo", quando `useEditMode().enabled` é verdadeiro.** É o mesmo `isGm` que já esconde a criação de eventos. Alternativa considerada: mostrar a gestão a quem `canEdit` mesmo com o modo de edição desligado. Rejeitada porque o resto das ações de escrita dessa página espera o modo de edição, e a spec fixa esse portão.
- **A lista ocupa a área principal da Linha do Tempo até o mestre voltar, e o seletor de modos permanece.** O formulário continua a ser o `FormDrawer` que já existe. Alternativa considerada: deixar a lista sempre visível por baixo da cronologia. Rejeitada porque a página é estreita e a lista empurraria os três modos para fora do ecrã.
- **O estado do fluxo sai de `MapPage` para um componente usado só pela Linha do Tempo.** Esse componente recebe arcos, sessões e locais e chama os mesmos métodos de `adminApi` (criar, editar, apagar, propor). `MapPage` perde o item de menu, o ramo `arcoManagerOpen` do painel e os diálogos. Alternativa considerada: copiar o bloco de estado para `LinhaTempoPage` e apagar o original. Rejeitada porque o fluxo de IA tem vários estados (`picker`, geração, proposta, insuficiente, falha) e uma cópia diverge na primeira correção.
- **A página do mapa deixa de ser o sítio da gestão.** Não fica um segundo atalho. Quem está no mapa segue a navegação até à Linha do Tempo.

## Risks / Trade-offs

- **`conexoes-arcos-no-tempo` ainda escreve a cor sugerida em `startManualArco` e `aplicarProposta` dentro de `MapPage`** → se essa change for aplicada primeiro, a extração tem de levar o sorteio da cor; se esta for aplicada primeiro, a cor tem de entrar no componente novo, não outra vez em `MapPage`.
- **A Linha do Tempo só pede locais na lista de administração quando o modo de edição está ligado** → a gestão usa essa lista, que já existe nesse estado. Com o modo desligado o controlo nem aparece.
- **O painel do mapa fica mais curto** → o menu de ferramentas continua com as ações do mapa (personagem, grupo). Só sai a gestão de arcos.

## Migration Plan

Não há migração nem alteração de API. Reverter é devolver o item de menu e o painel a `MapPage` e tirar o botão da Linha do Tempo.
