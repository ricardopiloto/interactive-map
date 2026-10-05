# Tasks

## 1. Backend — motor e contrato

- [x] 1.1 Criar `motor_ia_evento_associacoes.py` com prompt fixo sobre a descrição, parse JSON e saneamento de `local_ids`/`personagem_ids` contra o catálogo visível; verificar com `uv run pytest tests/test_motor_ia_evento_associacoes.py -q` a partir de `backend/` que um id inventado ou oculto não entra na sugestão e que listas vazias saneadas devolvem estado `vazio`.
- [x] 1.2 Expor o pedido `{ descricao }` e `POST /api/c/{slug}/admin/eventos/sugerir-associacoes` antes da rota `GET /eventos/{evento_id}`, com `require_dono` e limite `10/minute`; verificar no mesmo teste que descrição em branco responde 422 sem chamar o provedor, que o módulo desligado não chama a rede e que uma sugestão com módulo ligado não cria nem altera um evento.

## 2. Frontend — formulário do evento

- [x] 2.1 Em `LinhaTempoPage`, mostrar o botão só com `ia_arcos` ativo, desabilitá-lo com descrição em branco e unir as ids sugeridas às checkboxes do rascunho; verificar no browser que `vazio` e `falha` não desmarcam uma seleção já feita e que salvar grava só o que ficou marcado.
- [x] 2.2 Adicionar as chaves novas em `locales/pt-BR/linhaTempo.json` e `locales/en/linhaTempo.json` e confirmar a troca de idioma no formulário do evento.

## 3. Verificação integrada

- [x] 3.1 Com o módulo ligado, na campanha wfrp, acionar a sugestão a partir de uma descrição de teste, revisar as checkboxes, salvar o evento e confirmar no GET admin que locais e personagens batem com a seleção final; apagar o evento criado só para o teste.
