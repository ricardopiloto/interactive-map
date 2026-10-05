# Tasks

## 1. Backend — motor e contrato

- [x] 1.1 Criar `motor_ia_sessao_associacoes.py` com prompt fixo, parse JSON, saneamento de `local_ids`/`personagem_ids` contra o catálogo da campanha e estados de falha alinhados a `motor_ia_arcos`; verificar com `uv run pytest backend/tests/test_motor_ia_sessao_associacoes.py -q`.
- [x] 1.2 Expor schemas Pydantic e `POST /api/c/{slug}/admin/sessoes/sugerir-associacoes` (mestre, rate limit); verificar teste de rota admin e recusa quando módulo IA desligado.
- [x] 1.3 Garantir que registros ocultos não entram no catálogo enviado ao provedor; verificar cenário de teste com local/personagem oculto não sugerido.

## 2. Frontend — formulário de sessões

- [x] 2.1 Carregar `modulos_ativos` na página Sessões (ou reutilizar config já disponível) e mostrar botão de sugestão só com `ia_arcos` ativo; verificar manualmente ou teste de render condicional.
- [x] 2.2 Implementar chamada API, loading/erro, desabilitar botão com resumo vazio e aplicar união das ids sugeridas às checkboxes; verificar no browser que salvar persiste só o que o mestre deixou marcado.
- [x] 2.3 Adicionar chaves pt-BR/en em `locales/*/sessoes.json` e confirmar troca de idioma no formulário.

## 3. Verificação integrada

- [x] 3.1 Com módulo ligado, resumo de teste e campanha wfrp: acionar sugestão, revisar checkboxes, salvar sessão e confirmar via API GET admin que `locais`/`personagens` batem com a seleção final; apagar ou reverter dados de teste se criados só para a verificação.
