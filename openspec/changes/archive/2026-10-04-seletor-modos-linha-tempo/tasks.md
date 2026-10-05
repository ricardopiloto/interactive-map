# Tasks

## 1. A API deixa de configurar os modos de visualização

- [x] 1.1 Tirar `linha_tempo_arcos` e `linha_tempo_descoberta` de `MODULOS_TOGGLE_PERMITIDOS` e do `Literal` em `backend/app/schemas/campanhas.py`, mantendo `ia_arcos`. Em `backend/tests/test_modulo_toggle.py`, fazer `linha_tempo_arcos` e `linha_tempo_descoberta` serem rejeitados no `PATCH /api/campanhas/{slug}/modulos` como nome fora da lista; reescrever `test_dono_liga_e_desliga_modulo_linha_tempo_arcos`, `test_modulos_sao_independentes` e `test_descoberta_opt_in_some_quando_desligado_e_jogador_nao_altera` para isso, e manter a alternância de `ia_arcos` e a rejeição de quem não é dono. Verificar com `uv run pytest tests/test_modulo_toggle.py` a partir de `backend/`

## 2. Seletor na Linha do Tempo

- [x] 2.1 Em `frontend/src/pages/LinhaTempoPage.tsx`, mostrar sempre o seletor com cronológica, "Por arcos" e "Por descoberta", nesta ordem, com estado inicial `cronologico`. Remover a leitura de `linha_tempo_arcos` e `linha_tempo_descoberta`, o efeito que devolve o modo para cronológico quando o flag está desligado, e o uso desses flags na busca da descoberta e no `ItemManager` (a gestão de itens continua só com `isGm && isDono`). Verificar no browser, numa campanha sem esses flags em `modulos_ativos`: ao abrir `/c/:slug/linha-do-tempo` o modo selecionado é o cronológico e os três modos aparecem para mestre e para a visão de jogador; escolher "Por arcos" e "Por descoberta" troca a vista e a volta ao cronológico continua disponível; recarregar a página volta ao cronológico; fora do modo edição não há ação de escrita de item

## 3. Painel

- [x] 3.1 Remover os checkboxes "Por arcos" e "Por descoberta" de `frontend/src/pages/PainelPage.tsx`, o tipo correspondente em `toggleModulo` e em `frontend/src/api/campanhas.ts`, e as chaves `moduloLinhaTempoArcos` e `moduloLinhaTempoDescoberta` em `frontend/src/locales/pt-BR/comum.json` e `frontend/src/locales/en/comum.json`. Manter o checkbox de `ia_arcos`. Verificar no browser que o painel do dono não oferece controle para habilitar ou desabilitar as duas visualizações e que o toggle de IA para sugerir arcos continua presente
