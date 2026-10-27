## 1. Origem dos fios aceitos

- [x] 1.1 Em `frontend-v2/src/components/codex/FiosReview.tsx`, gravar `sessao_origem_id` como `sessaoId ?? sessão citada pela IA ?? null`, nesta ordem.
- [x] 1.2 Teste de `FiosReview` (vitest): com `sessaoId` definido, todos os fios aceitos são enviados com essa sessão mesmo que a IA cite outra; sem `sessaoId`, usa a sessão citada e `null` para itens sem sessão (o teste atual com `sessaoId={null}` continua valendo).

## 2. Prompt do Resumo

- [x] 2.1 Em `backend/app/services/motor_ia_assistente.py`, remover «e fios abertos» do final do prompt de `resumo_sessao`, mantendo as demais instruções.
- [x] 2.2 Teste em `backend/tests/test_motor_ia_assistente.py` (`test_prompts_fixos`): o prompt do Resumo não menciona fios abertos e mantém a instrução de não copiar combates; o contexto do Resumo não contém fios (o teste afirma a ausência da instrução e dos fios, não o texto gerado pela IA).

## 3. Verificação

- [x] 3.1 `uv run pytest` completo (fora do sandbox do codex), `npx vitest run`, `npx tsc --noEmit` e `npx eslint .` passando.
- [x] 3.2 Verificação manual: no editor de uma sessão salva, propor e aceitar fios e conferir que aparecem no bloco «Fios Narrativos» dessa sessão; gerar um Resumo e conferir que não lista fios abertos.
- [x] 3.3 Registrar no `CHANGELOG.md`, em Unreleased (Changed).
