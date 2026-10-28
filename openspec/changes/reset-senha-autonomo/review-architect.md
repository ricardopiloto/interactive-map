# Review — Arquiteto de Soluções

**Change:** reset-senha-autonomo
**Data:** 2026-10-28
**Veredito geral:** Aprovado com ressalvas

Contexto lido: os quatro artefatos relidos do disco; `backend/app/services/{auth_invite.py, auth_admin.py, auth_session.py, auth_lockout.py, registo.py, registo_config.py, email_templates.py, email_sender.py}`, `backend/app/routers/auth.py`, `frontend-v2/src/{routes/reset.tsx, routes/convite.tsx, auth/Login.tsx, main.tsx}`, as specs principais `registo-autonomo` e `contato-publico`. Topologia: túnel da Cloudflare → Caddy → `api` (FastAPI, 1 worker, `slowapi` em memória, SQLite) e `web`.

## 1. Definição da arquitetura técnica
Veredito: OK
- Reaproveita quase tudo: tipo de convite `reset`, página `/reset/:token`, `POST /api/auth/reset/confirmar`, contador por janela, Turnstile, `valid_email_format`, `EmailSender`. Sem tabela, migração, serviço ou dependência novos. Coerente com o tamanho da equipe.
- A decisão 2 (TTL por parâmetro em vez de tipo novo) é a mais simples e está justificada, com a consequência (expira também um link do admin ainda aberto) assumida.
- Carga: coberta pelos limites (5/h por IP, 3/24 h por e-mail) e pela quota de 100 e-mails/dia do Resend, citada nos riscos.

## 2. Integração com a infraestrutura existente
Veredito: Atenção
- **B1 (Atenção): o gatilho `EMAIL_API_KEY` no arranque muda o contrato de produção.** Hoje `validate_registo_startup()` só valida com o registo `aberto`, e `validate_public_forms_startup()` só com `CONTATO_EMAIL`. Passar a exigir `TRUSTED_PROXY=true` sempre que `EMAIL_API_KEY` existe (decisão 7) é correto para o limite por IP, e já está no plano de migração; mas também derruba o arranque de ambientes de staging/desenvolvimento que usem a chave com `DEBUG=false` e proxy não declarado. Aceitável; manter o aviso destacado no CHANGELOG e no runbook (item "Operação"), e o `.env.example` deve lembrar a ordem (`TRUSTED_PROXY=true` antes de `EMAIL_API_KEY`).
- Dados: sem schema novo; só linhas em `convite` e `login_bloqueio` (prefixo `reset:`, já previsto na limpeza). Nenhum impacto em backup.
- Deploy: sem porta, processo ou variável nova.

## 3. Qualidade de arquitetura e trade-offs
Veredito: Atenção
- **B2 (Atenção, forte): a busca da conta por `email_canonico` pode escolher a conta errada.** `create_usuario_with_invite` só rejeita duplicados pelo e-mail **exato** (`Usuario.email == norm`); dois usuários criados pelo admin (ou antes da coluna) podem ter o mesmo `email_canonico` (por exemplo `ana@gmail.com` e `a.na@gmail.com`). A decisão 3 diz "procura por `email_canonico` (ou por `email`...)"; com `.first()`, quem pede o reset de uma das duas pode nunca receber o link da sua conta, e o e-mail iria para a outra. Recomendação: procurar primeiro pelo e-mail **exato** normalizado; só usar o canônico como alternativa se houver **exatamente um** candidato ativo; se houver mais de um, não enviar nada (o caso é raro e o contato resolve). Registrar na decisão 3 e na spec ("Alias do mesmo endereço").
- **B3 (Atenção): bloqueio de terceiros pelo contador por e-mail.** Qualquer pessoa pode gastar as 3 tentativas diárias do e-mail de outra (3 pedidos do mesmo IP bastam), e o dono legítimo fica 24 h sem conseguir pedir reset. É o clássico trade-off de limitar por alvo. Opções: (a) aceitar e documentar, com `/contato` como saída; (b) subir o teto para 5 por 24 h (o IP continua a limitar o atacante a 5/h); (c) contar só os pedidos que realmente enviam e-mail. Recomendo (b) com a nota no runbook; decidir antes do apply, porque muda os testes do teto.
- **B4 (Atenção, menor): três cópias do mesmo pipeline de validação.** Registo, contato e agora reset repetem honeypot, idioma, formato de e-mail, captcha e erro 429. É a terceira vez; extrair uma função pequena (`validar_pedido_publico`) reduz divergência futura. Pode ser tarefa opcional desta change ou follow-up.
- Segurança: a correção de `confirm_reset` (recusar contas desativadas, não definir `activo`, limpar o `LoginBloqueio`) fecha uma falha real e vem como pré-requisito (tarefa 1.1). A revogação de sessões e a invalidação de links anteriores estão corretas. A resposta idêntica e o processamento em background seguem o padrão do registo. O token vai na URL (`/reset/{token}`), que o Caddy pode registar nos access logs; o TTL de 1 hora reduz o risco (já era assim no convite) — vale uma linha no runbook.
- Performance: sem gargalo; as consultas são por `email_canonico` indexado.

## 4. Documentação e decisões (ADRs)
Veredito: OK
- O design traz alternativas nas decisões 1, 2, 3 e 7, e o risco dos efeitos colaterais (invalidar o link do admin). Não é preciso diagrama: o fluxo é o do registo com um caminho a menos.
- A spec modifica dois requisitos existentes com os blocos MODIFIED completos e válidos (`openspec validate --strict` passa).

## 5. Ponte entre produto e técnico
Veredito: OK
- Cobre o pedido: recuperação sem o admin, sem revelar contas, só contas ativas, link curto, atalho no login e na página expirada, indisponível com saída pelo contato. O aviso "senha alterada" ficou como melhoria futura, explicitamente.

## Bloqueantes antes de implementar
- nenhum (B2 e B3 convém decidir e registar antes do apply)

## Ressalvas a incorporar
- B2 → decisão 3 e spec: busca pelo e-mail exato; canônico só com candidato único; ambiguidade não envia.
- B3 → decisão 5: teto por e-mail (3 ou 5) e a nota de bloqueio por terceiros no runbook.
- B1 → `.env.example` e runbook: ordem `TRUSTED_PROXY=true` antes de `EMAIL_API_KEY`.
- B4 → opcional: extrair o pipeline de validação partilhado.
