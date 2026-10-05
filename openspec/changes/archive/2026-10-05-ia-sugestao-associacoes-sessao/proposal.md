# Proposal

## Why

Marcar manualmente locais e personagens em cada sessão exige reler o resumo e procurar nomes na lista longa de checkboxes. O motor de IA já existe (`ia-provider`, módulo `ia_arcos`, padrão de proposta revisável usado em arcos) e a tela de sessões já tem resumo, locais e personagens no mesmo formulário — falta só acionar a IA a partir do resumo e pré-marcar as associações para o mestre revisar antes de salvar.

## What Changes

- No formulário de criação ou edição de sessão (página Sessões), quando a campanha tiver o módulo de IA ativo, o mestre vê um botão para sugerir locais e personagens a partir do texto do resumo.
- A sugestão chama o provedor com o resumo e o catálogo de locais e personagens da campanha (mesmas regras de isolamento, visibilidade e autorização já definidas em `ia-provider`). A resposta pré-marca as checkboxes correspondentes; nada é gravado até o mestre clicar em salvar no formulário.
- Referências da IA a locais ou personagens inexistentes ou ocultos são descartadas antes de mostrar o resultado. Falha do provedor ou resumo vazio informa o mestre sem alterar o rascunho de forma destrutiva.
- Copy nova em pt-BR e en (botão, estados de carregamento, erro, sucesso parcial/vazio).

## Capabilities

### New Capabilities

- `motor-ia-sessao-associacoes`: lógica de negócio e contrato de API para sugerir `local_ids` e `personagem_ids` a partir do resumo de uma sessão, reutilizando a infraestrutura de IA da campanha.

### Modified Capabilities

(nenhuma.) `ia-provider` e `motor-ia-arcos` permanecem como dependências; o gate continua sendo o módulo `ia_arcos` já exposto no Painel, sem alterar os seus Requirements.

## Impact

- **Backend**: novo serviço (espelhando o padrão de `motor_ia_arcos.py`), endpoint admin POST (ex.: sugerir associações de sessão), schemas de pedido/resposta, testes de saneamento e integração com `ia_provider.completar`.
- **Frontend**: `SessoesPage` — botão junto ao resumo, estado de loading/erro, aplicação das ids sugeridas nas checkboxes existentes; leitura de `modulos_ativos` como em Linha do Tempo / ArcoManager.
- **Sem migração de schema** — apenas links já existentes em `SessaoLocalLink` / `SessaoNpcLink` no save habitual.
