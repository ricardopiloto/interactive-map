# Proposal

## Why

Hoje só o admin consegue gerar um link de redefinição de senha: não há "esqueci a senha" na tela de login, e quem se esquece da senha depende de pedir ao admin (agora pelo formulário de contato). Com o registo aberto a qualquer pessoa, isso não escala e deixa contas inacessíveis. A recuperação tem de existir antes de divulgar o produto, sem abrir uma porta para enumerar contas nem para reativar contas desativadas.

## What Changes

- Link "Esqueci a senha" no login (nas duas variantes) que leva à nova página pública `/esqueci-senha`, onde a pessoa informa só o e-mail.
- Novo endpoint público `POST /api/auth/reset/pedir`: resposta sempre igual (`202 {"ok": true}`) quer o e-mail seja de conta ativa, inexistente, pendente ou de conta desativada; o processamento e o envio correm depois da resposta. Só uma conta **ativa** recebe o link; nos outros casos não se envia nada.
- Link de reset pedido pela própria pessoa com validade curta de **1 hora** (o reset gerado pelo admin continua a valer 72 horas), de uso único, e que invalida os links de reset anteriores. A página `/reset/:token` e `POST /api/auth/reset/confirmar` já existentes são reaproveitadas.
- Correção de segurança em `confirm_reset`: deixa de reativar uma conta desativada (hoje define `activo=True`), e passa a limpar o bloqueio de login por falhas do e-mail. As sessões antigas continuam a ser revogadas.
- Defesas reaproveitadas: limite por IP, contador por e-mail com hash (5 por 24 h), campo isca, Turnstile opcional.
- `GET /api/auth/reset/config` indica se a recuperação está disponível; sem provedor de e-mail a página orienta a usar o contato.
- E-mail de recuperação em pt-BR e en; o e-mail "você já tem conta", enviado no registo a quem já existe, passa a oferecer o link para `/esqueci-senha`.
- A validação de arranque dos formulários públicos (`TRUSTED_PROXY=true`) passa a valer também quando há provedor de e-mail configurado.
- O link de reset expirado, já usado ou inválido oferece o atalho para pedir outro.
- Extração (opcional) da validação comum dos pedidos públicos (honeypot, idioma, formato de e-mail, captcha) numa função usada por registo, contato e reset.
- Textos em pt-BR e en; política de privacidade atualizada; CHANGELOG, README, `.env.example` e runbook.

## Capabilities

### New Capabilities
- `reset-senha-autonomo`: recuperação de senha pela própria pessoa, por e-mail, sem revelar contas e sem reativar contas desativadas.

### Modified Capabilities
- `registo-autonomo`: o aviso enviado a quem tenta registar-se com uma conta já existente passa a oferecer a recuperação de senha.
- `contato-publico`: a exigência de proxy confiável no arranque deixa de depender só do endereço de contacto e passa a valer também com o envio de e-mail configurado.

## Impact

- Backend: `app/services/auth_invite.py` (TTL por pedido, `confirm_reset`), novo `app/services/reset_senha.py`, `app/routers/auth.py` (dois endpoints), `app/services/email_templates.py`, `app/services/registo.py` (texto do aviso), `app/services/auth_lockout.py` (prefixo `reset:` na limpeza de contadores), `app/services/registo_config.py` (gatilho do arranque).
- Frontend (`frontend-v2`): link no `LoginForm`, página `/esqueci-senha`, rota nos dois blocos de `main.tsx`, `reset.tsx` (atalho de link expirado), locales pt-BR/en, textos legais, testes e e2e.
- Operação: sem variável nova; com `EMAIL_API_KEY` definido e `DEBUG=false`, a API passa a exigir `TRUSTED_PROXY=true`. O reset consome a mesma quota de e-mails do Resend (100/dia no plano gratuito).
- Fora de escopo: perguntas de segurança, SMS, 2FA, troca de senha dentro da conta logada, aviso por e-mail de "senha alterada", alteração do reset gerado pelo admin (salvo a correção de `confirm_reset`).
