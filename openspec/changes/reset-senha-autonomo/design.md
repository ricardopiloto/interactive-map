# Design

## Context

O reset de senha já existe, mas só por mão do admin: `reset_usuario` (em `auth_admin.py`) emite um `Convite` de tipo `reset` (72 h) para contas **ativas**, o admin entrega o link, a página `/reset/:token` chama `POST /api/auth/reset/confirmar` e `confirm_reset` (em `auth_invite.py`) troca a senha e revoga as sessões. A change `registo-autonomo` criou o padrão do pedido público sem enumeração de contas (`process_registo`: resposta 202 antes de consultar a conta, trabalho em `BackgroundTasks` com sessão própria), o contador por e-mail com hash (`counter_allows/consume/refund` em `auth_lockout.py`, limpeza por prefixos), `verify_turnstile`, `valid_email_format`, `canonical_email` e a validação de arranque dos formulários públicos. A produção é alcançada só pelo túnel da Cloudflare, o worker é único e o `slowapi` é em memória. Ver proposal.md para a motivação.

Achados na leitura do código que moldam o design:
- `confirm_reset` faz `usuario.activo = True`. Um link de reset emitido enquanto a conta estava ativa **reativaria uma conta desativada pelo admin** se fosse usado depois da desativação (já possível hoje durante as 72 h do reset do admin). Com links de 1 hora pedidos por qualquer pessoa, isto tem de ser fechado.
- `issue_invite` decide o TTL pelo tipo (`verificar` 5 h, resto 72 h); não há como emitir um `reset` de 1 hora.
- O e-mail "existente" do registo só aponta para `/login`.
- O `LoginBloqueio` por e-mail (5 falhas, 15 minutos) pode estar ativo exatamente quando a pessoa esqueceu a senha.

## Goals / Non-Goals

**Goals:**
- Recuperação por e-mail sem enumeração de contas, só para contas ativas.
- Nunca reativar uma conta desativada, nem por links antigos.
- Reutilizar tipo de convite, páginas, endpoint de confirmação e antispam existentes.

**Non-Goals:**
- Perguntas de segurança, SMS, 2FA, troca de senha dentro da conta logada.
- E-mail de aviso "sua senha foi alterada" (fica como melhoria futura, anotada em Open Questions).
- Mudar o fluxo de reset gerado pelo admin, além da correção de segurança de `confirm_reset`.

## Decisions

1. **Correção de `confirm_reset` (segurança, pré-requisito).** Passa a recusar com `CONVITE_INVALIDO` quando a conta não está ativa (`activo` falso ou sem `senha_hash`) e **deixa de definir `activo = True`**. Como `reset_usuario` e o novo pedido só emitem links para contas ativas, o comportamento normal não muda; muda o caso em que o admin desativou a conta depois da emissão do link. Ao concluir, `confirm_reset` limpa o `LoginBloqueio` do e-mail (`clear_failures`), para a pessoa poder entrar logo após redefinir. *Alternativa:* revogar os convites ao desativar a conta — rejeitada, deixaria a garantia espalhada pelo admin console; verificar no ponto de uso é mais robusto.

2. **TTL por parâmetro, mesmo tipo `reset`.** `issue_invite(session, usuario_id, tipo, *, ttl_horas=None)`; o reset pedido pela pessoa usa `ttl_horas=1` (constante `RESET_PEDIDO_TTL_HORAS`). Continua tipo `reset`, aceito por `confirm_reset` sem alterações. *Alternativa:* tipo novo `reset_pedido` — rejeitada: obrigaria a alterar `confirm_reset`, a página e os testes sem benefício, já que a diferença é só a duração. Consequência aceita: ao emitir um reset pedido, **todos** os convites `reset` não usados da conta são expirados (`expira_em = agora`), incluindo um link que o admin tenha gerado; a pessoa passa a ter um link novo e o do admin deixa de valer.

3. **Quem recebe o link.** `process_reset(email, idioma)` procura a conta por esta ordem: (1) `Usuario.email` igual ao e-mail normalizado; (2) só se não houver, os usuários com o mesmo `email_canonico` que estejam ativos e com senha. Se houver **exatamente um** candidato no passo 2, usa-o; se houver mais de um, **não envia nada** (o admin pode ter criado duas contas com o mesmo canônico, porque `create_usuario_with_invite` só rejeita e-mail exato duplicado; o caso é raro e o contato resolve). Só envia quando `activo` e `senha_hash`. Conta pendente (sem senha), desativada ou inexistente: não envia nada. *Alternativa:* enviar "complete o seu registo" às pendentes — rejeitada: contas pendentes duram 5 horas e a pessoa tem o e-mail de verificação; evita mais um e-mail para endereços que podem não ser da pessoa. O e-mail vai sempre para `usuario.email` (o endereço registado), nunca para o alias digitado.

4. **Pedido genérico em background.** `POST /api/auth/reset/pedir` valida de forma síncrona só o que não depende da conta (disponibilidade, honeypot, idioma, formato com `valid_email_format`, captcha, limite por IP `@limiter.limit("5/hour")`) e devolve `202 {"ok": true}`; o resto corre em `BackgroundTasks` com sessão própria, no mesmo desenho de `process_registo`. O critério de teste é "mesmo corpo e status e nenhuma consulta da conta antes da resposta", não igualdade de latência. O erro 429 do IP reutiliza `LIMITE_PEDIDOS` (o tratamento global já o emite para qualquer rota diferente do registo). Domínios descartáveis não são verificados (a conta já existe ou não).

5. **Contador por e-mail.** Chave `reset:{sha256(email_canonico)}`, **5 por 24 h**, com `counter_allows/consume/refund`. Consumido logo no início do processamento para os cinco casos (conta ativa, inexistente, pendente, desativada, alias), para que o teto não distinga contas; **devolvido** (`counter_refund`) quando a conta existia e o provedor falhou, para uma indisponibilidade do Resend não bloquear a pessoa. O prefixo `reset:` entra na limpeza periódica de contadores (`purge_expired_registo_counters`, que passa a usar uma tupla de prefixos `('registo:', 'contato:', 'reset:')`). *Trade-off aceito:* qualquer pessoa pode gastar o teto diário do e-mail de outra (cinco pedidos); o dono fica até 24 horas sem pedir reset e usa o `/contato`. O teto de 5 (em vez de 3) e o limite de 5 por hora por IP reduzem o efeito; está documentado no runbook.

6. **Disponibilidade.** `GET /api/auth/reset/config` devolve `{disponivel, turnstile_site_key}`, com `disponivel = get_email_sender() is not None`. Sem remetente: o `POST` responde `503 RESET_INDISPONIVEL`, e a página mostra "recuperação indisponível" com link para `/contato`.

7. **Arranque seguro.** `validate_public_forms_startup()` passa a exigir `TRUSTED_PROXY=true` (com `DEBUG=false`) quando `CONTATO_EMAIL` **ou** `EMAIL_API_KEY` estiver definido (o reset por e-mail depende do mesmo limite por IP). Impacto de operação: quem já tem `EMAIL_API_KEY` mas `TRUSTED_PROXY=false` deixa de arrancar; documentado no plano de migração e no runbook.

8. **E-mails.** `email_templates.py` ganha o tipo `reset` (assunto "Redefinir sua senha" / "Reset your password"; corpo com o link `/reset/{token}`, validade de 1 hora e "se você não pediu, ignore esta mensagem"). A expressão atual de `render_email` mapearia `reset` para `/convite/…`; é substituída por um **mapa explícito tipo → link**: `verificar` e `admin` → `/convite/{token}`, `reset` → `/reset/{token}`, `existente` → `/login` mais `/esqueci-senha` (sem token). O e-mail `existente` do registo passa a incluir também o link para `/esqueci-senha` (um link fixo, sem token, para não emitir tokens a quem só tentou registar-se).

9. **Frontend (`frontend-v2`).** O link "Esqueci a senha" vai dentro do `LoginForm` (partilhado pelas duas variantes do login). A página `/esqueci-senha` espelha `registo.tsx`: campo de e-mail, honeypot com nome não óbvio, `tabIndex={-1}` e `aria-hidden`, Turnstile (componente já extraído), estados indisponível, sucesso (mensagem neutra, com a orientação de verificar o spam) e erro; usa `SiteHeader` e `SiteFooter`. A rota entra nos dois blocos de `main.tsx`. Em `reset.tsx`, quando o link falha por qualquer motivo (`CONVITE_EXPIRADO`, `CONVITE_JA_USADO` ou `CONVITE_INVALIDO`), mostra o atalho para `/esqueci-senha`, já que pedir outro link é a saída em todos os casos; para isso `reset_confirmar` passa a incluir `detalhes` no erro como o `aceitar_convite` já faz. Códigos novos em `errors.*`: `RESET_INDISPONIVEL`, e passam a existir também `CONVITE_JA_USADO` e `CONVITE_INVALIDO` (hoje só `CONVITE_EXPIRADO` tem texto e os outros caem no genérico). Os testes do link no `LoginForm` ficam em `Login.test.tsx` (as duas variantes) e a nova página entra na lista de `site-footer-pages.test.tsx`.

10. **Pipeline de validação partilhado (opcional).** Registo, contato e reset repetem honeypot, idioma, formato de e-mail, captcha e a resposta de limite. Extrai-se uma função `validar_pedido_publico(...)` usada pelas três rotas, sem mudar o comportamento (os testes existentes de registo e contato são a rede de segurança). Se o custo crescer, fica como follow-up e a tarefa é descartada sem afetar o resto.

11. **Seams de teste e logs.** O router do reset importa `get_email_sender` no próprio módulo e `process_reset` vem de `reset_senha`, para os testes substituírem os dois pontos como em `contato.py` e `registo.py`. Os logs de `process_reset` registam só códigos e contagens (aceito, sem conta, recusado por limite, ambíguo, falha do provedor com o `request_id`), nunca o e-mail.

12. **Texto legal.** A política de privacidade ganha uma seção de recuperação de senha e a seção de segurança menciona o contador de recuperação com hash do e-mail.

## Risks / Trade-offs

- [Enumeração por tempo de resposta ou por efeitos colaterais] → Resposta antes de qualquer consulta da conta, processamento em background, contador consumido igualmente nos cinco casos.
- [E-mail bomb à vítima] → Limite por IP (5/h) e por e-mail (3/24 h) que vale mesmo para contas ativas; o e-mail não contém texto do pedinte.
- [Link de 1 hora curto para quem demora] → O atalho de "pedir novo link" na página de reset expirado.
- [O token em `/reset/{token}` aparece nos logs de acesso do Caddy] → O TTL de 1 hora e o uso único reduzem o risco; anotado no runbook.
- [Terceiros esgotam o teto de pedidos de um e-mail] → Teto de 5 por 24 h, limite de 5 por hora por IP e o `/contato` como saída.
- [Reset invalida o link que o admin gerou] → Aceito e documentado; a pessoa recebe um novo link.
- [Quota partilhada do Resend (100/dia)] → O reset gasta e-mails do mesmo teto do registo e do contato; documentado no runbook (subir de plano antes de divulgar).
- [Roubo de conta por acesso ao e-mail] → Inerente ao reset por e-mail; mitigado por link curto, uso único, sessões revogadas e o aviso "se não pediu, ignore". O aviso de "senha alterada" fica como melhoria futura.
- [API deixa de arrancar em produção com `EMAIL_API_KEY` e `TRUSTED_PROXY=false`] → Plano de migração e runbook mandam definir `TRUSTED_PROXY=true` primeiro.

## Migration Plan

1. Sem migração de banco: usa o tipo `reset`, a tabela `convite` e `login_bloqueio` existentes.
2. Confirmar `TRUSTED_PROXY=true` no `.env` de produção **antes** de definir `EMAIL_API_KEY` ou de fazer o deploy (com `DEBUG=false` a API deixa de subir com `EMAIL_API_KEY` definido e proxy não confiável); o mesmo vale para ambientes de staging que usem a chave. O `.env.example`, o runbook e o CHANGELOG repetem a ordem.
3. Deploy; testar com uma conta de teste: pedir o reset, abrir o link, definir a senha, entrar.
4. Confirmar que o link do admin continua a funcionar e que uma conta desativada não consegue redefinir.
- Rollback: reverter o deploy; não há dados novos a desfazer (convites de reset e contadores expiram sozinhos).

## Open Questions

- Enviar depois da troca de senha um e-mail de aviso "sua senha foi alterada" (melhoria de segurança futura, fora desta change).
