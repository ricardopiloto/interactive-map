# Proposal

## Why

Marcar locais e personagens num evento da linha do tempo repete o trabalho que a sugestão por IA já faz no resumo da sessão. O formulário do evento já tem descrição e as mesmas checkboxes; falta acionar o motor a partir dessa descrição e pré-marcar as associações para o mestre revisar antes de salvar.

## What Changes

- No formulário de criação ou edição de evento (página Linha do Tempo), quando a campanha tiver o módulo de IA ativo, o mestre vê um botão para sugerir locais e personagens a partir do texto da descrição.
- A sugestão chama o provedor com a descrição e o catálogo de locais e personagens da campanha, com as mesmas regras de isolamento, visibilidade e autorização de `ia-provider`. A resposta pré-marca as checkboxes; nada é gravado até o mestre salvar o evento pelo fluxo já existente.
- Referências da IA a locais ou personagens inexistentes ou ocultos são descartadas. Descrição vazia não chama o provedor. Falha do provedor informa o mestre e mantém a seleção manual já feita.
- A sugestão soma ids às checkboxes já marcadas, em vez de substituir a seleção. Copy nova em pt-BR e en.

## Capabilities

### New Capabilities

- `motor-ia-evento-associacoes`: sugerir `local_ids` e `personagem_ids` a partir da descrição de um evento, no mesmo contrato da sugestão de associações de sessão.

### Modified Capabilities

- Nenhuma. `ia-provider` e `motor-ia-sessao-associacoes` permanecem como estão. O gate continua a ser o módulo `ia_arcos` do Painel.

## Impact

- Backend: serviço no padrão de `motor_ia_sessao_associacoes.py`, `POST /api/c/{slug}/admin/eventos/sugerir-associacoes` (mestre dono, limite de taxa), schemas de pedido e resposta, testes de saneamento.
- Frontend: botão em `LinhaTempoPage`, abaixo do campo Descrição e acima das listas de locais e personagens; chaves em `locales/*/linhaTempo.json`.
- Sem migração. As ligações gravadas continuam a ser as do save habitual do evento.
