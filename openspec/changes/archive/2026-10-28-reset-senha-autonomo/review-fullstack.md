# Review — Desenvolvedor Fullstack

**Change:** reset-senha-autonomo
**Data:** 2026-10-28
**Veredito geral:** Aprovado com ressalvas

Contexto lido: os quatro artefatos relidos do disco e `review-architect.md`; `backend/app/services/{auth_invite.py, auth_admin.py, auth_session.py, auth_lockout.py, registo.py, registo_config.py, email_templates.py, email_sender.py}`, `backend/app/routers/auth.py`, `backend/tests/test_auth_reset.py`, `frontend-v2/src/{routes/reset.tsx, routes/convite.tsx, routes/site-footer-pages.test.tsx, auth/Login.tsx, auth/Login.test.tsx, main.tsx}`, `locales/pt-BR/comum.json`. Só `frontend-v2` é servido; sem CI (verificação local com `pytest`, `vitest`, `playwright`).

## 1. Desenvolvimento do backend
Veredito: Atenção
- **Concordo com B2 do arquiteto e o código a confirma.** `create_usuario_with_invite` só rejeita e-mail exato duplicado; duas contas com o mesmo `email_canonico` coexistem. Em `process_reset` a busca deve ser: (1) `Usuario.email == normalizado`; (2) só se não achar, os candidatos por `email_canonico` com `activo` e `senha_hash`; (3) se houver exatamente um, usa-o; se houver mais de um, não envia nada. Testes: alias de conta única, ambiguidade sem envio, e-mail exato preferido sobre o canônico.
- **A correção de `confirm_reset` (1.1) é pequena e segura para os testes existentes.** `test_auth_reset.py` usa uma conta ativa (`TEST_GM_EMAIL`) e continuará a passar. Atenção ao import: `auth_invite` passa a importar `clear_failures` e `email_key` de `auth_lockout`; `auth_lockout` só importa modelos, sem ciclo. A chave de bloqueio de login usa o e-mail normalizado (`email_key(usuario.email)`), que é a mesma que `login` usa.
- **`issue_invite(..., ttl_horas=None)` (1.2):** hoje o TTL sai de uma expressão por tipo; manter o comportamento atual quando `ttl_horas` é `None` e testar os quatro tipos.
- **`render_email` (1.3) precisa de refatoração, não só de uma entrada nova.** Hoje o link sai de `invite_url(token, 'verificar' if kind == 'verificar' else 'activar') if kind != 'existente' else login`, que mapearia `reset` para `/convite/…`. Trocar por um mapa explícito `kind -> construtor de link` (`verificar`→`/convite`, `admin`→`/convite`, `reset`→`/reset`, `existente`→`/login` mais `/esqueci-senha`), com teste por tipo e idioma.
- **Contadores (1.4):** `purge_expired_registo_counters` tem os dois prefixos escritos à mão (`registo:`, `contato:`); acrescentar `reset:` e, de passagem, passar a uma tupla de prefixos.
- **Seam de teste do remetente:** os testes de rota do registo e do contato substituem `get_email_sender` no módulo do serviço/router. O router do reset deve importar `get_email_sender` no próprio módulo (para `disponivel`) e `process_reset` no módulo `reset_senha`, para os testes poderem substituir os dois pontos (padrão de `contato.py` e `registo.py`).
- **Pipeline duplicado (B4):** honeypot, idioma, formato, captcha e o 429 repetem-se em três rotas. Concordo em extrair uma função `validar_pedido_publico(...)`; se ficar fora desta change, deixar anotado.
- **429 e tempo:** o tratamento global de 429 já devolve `LIMITE_PEDIDOS` para rotas que não são o registo; sem mudança de código nesta parte.

## 2. Desenvolvimento do frontend
Veredito: Atenção
- **O `LoginForm` é partilhado** (`auth/Login.tsx`) pelas duas variantes; o link "Esqueci a senha" dentro dele cobre as duas. `Login.test.tsx` já existe e é o sítio dos testes (página própria e janela).
- **`site-footer-pages.test.tsx` lista as páginas que têm rodapé** (inclui `ResetPage`); a nova página `/esqueci-senha` deve entrar nessa lista na 3.2.
- **Códigos de erro sem texto.** O `reset.tsx` mostra `explain(reason, t("auth.resetError"))`, e no pt-BR só existe `errors.CONVITE_EXPIRADO`; `CONVITE_JA_USADO` e `CONVITE_INVALIDO` não têm entrada e caem no fallback "Link de reset inválido ou expirado". Funciona, mas o atalho para `/esqueci-senha` (3.3) deve aparecer em **qualquer** falha do link (`CONVITE_EXPIRADO`, `CONVITE_JA_USADO` e `CONVITE_INVALIDO`), não só nas duas listadas, já que pedir outro link é a saída em todos. Acrescentar as duas entradas em `errors.*` (pt-BR e en).
- `reset_confirmar` passa a devolver `detalhes` no erro de expiração (2.1); `ApiError.detalhes` já é lido no `convite.tsx`; reutilizar o mesmo padrão.
- A página `/esqueci-senha` espelha `registo.tsx` e usa o componente `Turnstile` já extraído; sem dependência nova. Mobile: formulário de um campo.

## 3. Deploy e operação
Veredito: OK
- Sem variável, porta, script ou migração novos. O comportamento novo de arranque (`EMAIL_API_KEY` exige `TRUSTED_PROXY=true`) está documentado no plano de migração; reforçar no CHANGELOG (item Operação) e no `.env.example` (ordem das variáveis), como o arquiteto pede (B1).
- Observabilidade: o log de `process_reset` deve registar só códigos e contagens (aceito, sem conta, recusado por limite, falha do provedor com `request_id`), nunca o e-mail; é como depurar "não chegou o meu link" sem dados pessoais.
- O token no caminho `/reset/{token}` aparece nos logs de acesso do Caddy; o TTL de 1 hora reduz o risco. Uma linha no runbook.

## 4. Qualidade de código
Veredito: Atenção
- As tarefas têm verificação concreta e testes dentro de cada grupo, no padrão do projeto. Acrescentar testes: busca pelo e-mail exato vs. canônico (B2), teto de 5 ou 3 por e-mail conforme a decisão (B3), `render_email` por tipo, atalho de link inválido, entradas de erro novas nos dois idiomas, e o `LoginForm` nas duas variantes.
- **E2E (4.1):** o e2e cria a conta pelo registo; depois do registo a pessoa já tem sessão, então o teste deve limpar os cookies do contexto (`context.clearCookies()`) antes de pedir o reset. O `EMAIL_LOG_FILE` acumula e-mails de todas as specs: filtrar por destinatário único (`emailLog.ts` já suporta). O limite de 5 pedidos/hora por IP é por rota e o servidor reinicia a cada execução, então não atrapalha.
- Formatação: o codex deixou erros de `prettier` nas rodadas anteriores; no prompt do apply pedir `npx eslint --fix` só nos arquivos alterados.
- Concorrência: dois pedidos simultâneos do mesmo e-mail passam pelo contador por janela; o pior caso é um pedido a mais num teto suave (aceitável, igual ao registo).

## 5. Execução das decisões arquiteturais
Veredito: OK
- `tasks.md` segue o design sem reabrir decisões. Os ajustes pedidos (B2, B3, atalho em qualquer falha do link, refatoração de `render_email`) são refinamentos de tarefa, não mudanças de rumo.

## Bloqueantes antes de implementar
- nenhum

## Limitações técnicas a reportar ao Arquiteto
- Busca da conta pelo e-mail exato e canônico só com candidato único (B2).
- Teto por e-mail e bloqueio por terceiros (B3): decidir 3 ou 5 antes de escrever os testes.
- `render_email` precisa de mapa de links por tipo, não só de um tipo novo.
- Duplicação do pipeline de validação (B4): extrair agora ou anotar como follow-up.
