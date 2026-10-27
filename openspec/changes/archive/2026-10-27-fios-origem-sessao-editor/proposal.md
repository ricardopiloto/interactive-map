## Why

Na leitura de uma sessão, o bloco «Fios Narrativos» lista só os fios cuja sessão de origem é aquela sessão, mas isso quase nunca acontece: fios manuais ficam sem sessão de origem e os aceitos da proposta da IA recebem só a sessão que a própria IA citou (`sessao_numero`, opcional), que pode ser outra sessão ou nenhuma. Na sessão de teste 29, os dois fios aceitos da IA estão com `origem=ia` e sem sessão de origem (`NULL`), então o bloco da sessão mostra «Nenhum fio criado nesta sessão». Além disso, o prompt do Resumo manda «terminar com o estado do grupo e fios abertos»: o Resumo da sessão 29 traz uma seção «## Fios em aberto» gerada pela IA a partir do texto, sem receber os fios reais, e ela não coincide com os fios da lista.

## What Changes

- Fios aceitos na revisão da proposta de IA aberta no editor de uma sessão já salva passam a ter **essa sessão como sessão de origem**, em vez da sessão citada pela IA. Se o editor ainda não tem sessão salva, mantém-se o comportamento atual (sessão citada pela IA, quando existir).
- O prompt do Resumo deixa de pedir «fios abertos» ao final: o Resumo conta o que aconteceu e o estado do grupo; os fios ficam só no bloco e na lista de fios.
- Sem alteração de API, banco, exportação ou da regra do bloco «Fios Narrativos» (que continua listando os fios da sessão).

## Capabilities

### New Capabilities

### Modified Capabilities
- `fios-narrativos`: a sessão de origem dos fios aceitos na proposta da IA, quando aberta no editor de uma sessão salva, é essa sessão.
- `motor-ia-assistente`: o prompt do Resumo não pede nem produz a lista de fios abertos.

## Impact

- Frontend: `frontend-v2/src/components/codex/FiosReview.tsx` (origem = `sessaoId` quando houver) e seu teste.
- Backend: prompt de `resumo_sessao` em `backend/app/services/motor_ia_assistente.py` e `tests/test_motor_ia_assistente.py` (`test_prompts_fixos`).
- Fios já existentes mantêm a sessão de origem que têm; não há migração nem retroatividade.
