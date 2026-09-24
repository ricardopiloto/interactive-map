# Quickstart: Filtros consistentes em Relações

## Pré-requisitos

- Frontend instalado conforme `frontend/README.md`.
- Campanha de desenvolvimento com personagens e vínculos de pelo menos dois tipos, incluindo ao menos um vínculo bidirecional com tipos diferentes por direção.
- Acesso à tela de Relações como mestre ou jogador.

## Abrir a tela

Na pasta `frontend/`:

```bash
npm run dev
```

Abra `/c/<slug>/relacoes`.

## Cenários manuais

1. **Compartilhamento painel/grafo**: sem tipos ativos, confirme que todos os vínculos aparecem. Ative um tipo e confirme que as arestas e, ao selecionar um personagem, a lista de vínculos dele passam a corresponder à mesma seleção.
2. **União de tipos**: com um tipo ativo, ative um segundo. Confirme que ambos os tipos aparecem no grafo e na lista de detalhe.
3. **Limpar filtro**: remova os tipos ativos um a um. Ao chegar ao conjunto vazio, confirme que todos os tipos voltam a aparecer no grafo e no detalhe.
4. **Duplo-clique**: com vários tipos, duplo-clique em um chip e confirme que só ele fica selecionado; duplo-clique novamente no único tipo selecionado e confirme retorno a “todos”.
5. **Direções distintas**: para um vínculo com um tipo por direção, filtre pelo tipo de cada lado separadamente; confirme que o vínculo é incluído se qualquer direção corresponder.
6. **Status e busca**: selecione um status e faça uma busca. Confirme que a lista aplica ambos, o grafo aplica o status e destaca a busca sem remover nós que não correspondem ao texto.
7. **Seleção e isolamento**: selecione um personagem, ligue isolamento e alterne os tipos. Confirme que somente vínculos incidentes e compatíveis permanecem; desligue isolamento e confirme o conjunto geral filtrado.
8. **Seleção inválida pelo status**: selecione um personagem e mude o status para um que não o inclui; confirme que detalhe/seleção e isolamento são limpos.
9. **Estado vazio**: escolha um tipo sem vínculos para o personagem selecionado. Confirme estado vazio no detalhe e nenhuma aresta incompatível no grafo.
10. **Layout**: compare a tela antes/depois; não devem ocorrer mudanças visuais nos controles, no SidePanel ou na geometria do grafo.

## Resultado esperado

Todos os resultados de vínculo são coerentes entre SidePanel e Grafo para a mesma seleção, status e isolamento; ausência de tipos selecionados restaura todos os tipos. Não há mudanças de dados gravados nem chamadas de API.
