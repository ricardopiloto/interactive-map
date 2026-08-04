# UI Contract: Rotas de viagem (jogador + GM)

## Jogador — mesma tela do mapa

### Painel “Calcular rota”

| Elemento | Regra |
|----------|--------|
| De / Para | Apenas Locais com waypoint vinculado |
| Ritmo | cauteloso \| normal \| arriscado (um por cálculo) |
| Calcular | Chama plan; lista ordenada por tempo |
| Seleção | Índice 0 auto-selecionado; clique troca |
| Vazio / erro | Mensagem clara; mapa estável |

### Overlay no mapa

| Camada | Quando | Estilo |
|--------|--------|--------|
| Rota selecionada | Há plan + seleção | Traço destacado (sólido, mais opaco/espesso) |
| Alternativas | Mesmo plan, outras rotas | Discreto / **tracejado** |
| Pins Local | Sempre (nesta vista) | Inalterados |
| Saídas 017 | Regras 017/020 | Overlay **separado**; não misturar classes/semântica |

Limpar overlay ao fechar o painel / limpar cálculo.

## GM — vista dedicada de digitalização

| Regra | Detalhe |
|-------|---------|
| Entrada | Ação no Modo GM (“Rede de rotas” / equivalente) |
| Pins lore | **Ocultos** |
| Visível | Waypoints + segmentos existentes |
| Criar nó | Clique no mapa; nome opcional; link Local opcional |
| Criar segmento | Extremo → intermediários → extremo → tipo → salvar |
| Auth | Só com sessão GM; escrita via admin API |
| Sair | Volta ao mapa/GM normal com pins |

## Must not

- Comparar vários ritmos lado a lado (MVP)
- Editar rede como jogador
- Usar `saida_ids` como arestas de viagem
