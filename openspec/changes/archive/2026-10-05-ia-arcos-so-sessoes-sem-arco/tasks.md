# Tasks

## 1. Contexto e prompt

- [x] 1.1 Em `coletar_registros`, omitir sessão com `arco_id` preenchido e as linhas de local e personagem dessa sessão; verificar com `uv run pytest tests/test_motor_ia_arcos.py -q` a partir de `backend/` que o contexto de uma campanha com sessão ocupada não contém o título nem o resumo dessa sessão.
- [x] 1.2 Acrescentar ao `PROMPT_PADRAO` que os dados seguintes são só sessões sem arco, mantendo as regras já exigidas por `prompt_tem_regras_obrigatorias`; verificar que o teste do prompt padrão continua a passar no mesmo `pytest`.

## 2. Contagem e saneamento

- [x] 2.1 Confirmar que o mínimo de sessões conta só as sem arco que restam no contexto visível e que, abaixo do mínimo, o provedor não é chamado; verificar com um caso no mesmo ficheiro de teste em que sessões ocupadas não completam o mínimo.
- [x] 2.2 Manter o saneamento atual da exceção de transição e verificar que `test_sessao_de_outro_arco_so_entra_como_transicao` continua a passar, agora também afirmando que o pedido ao provedor não inclui o texto da sessão ocupada.
