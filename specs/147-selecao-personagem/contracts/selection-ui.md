# Contrato de interação: seleção de personagem

Este contrato descreve o resultado visível do fluxo da interface. Não cria contrato HTTP nem muda dados persistidos.

| Tela e origem | Ação | Resultado exigido |
|---|---|---|
| Mapa, lista do painel | Selecionar um personagem | A ficha do personagem selecionado é exibida no painel. |
| Mapa, ficha atual aberta | Selecionar outro personagem disponível | A ficha passa a corresponder ao novo personagem. |
| Relações, lista do painel | Selecionar um personagem | O nó desse personagem fica selecionado e o painel exibe seus detalhes. |
| Relações, nó do grafo | Selecionar outro personagem | O nó selecionado e os detalhes do painel passam a corresponder ao novo personagem. |
| Mapa ou Relações | Personagem sem dados opcionais | A ficha/detalhes disponíveis permanecem acessíveis sem atribuir dados de outro personagem. |

## Regras de consistência

- Cada ação resolve para um personagem da campanha atualmente aberta.
- A troca de seleção não pode deixar o painel e o grafo mostrando personagens diferentes.
- Uma seleção deve continuar compatível com teclado e interação por toque já suportados pelas telas.
- Busca, filtros, modo de edição e interações de arrasto existentes permanecem respeitados.
