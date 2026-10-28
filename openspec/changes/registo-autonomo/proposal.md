# Proposal

## Why

Hoje só existe conta por convite manual do admin: o admin cria o usuário e copia o link para entregar à pessoa. Isto impede a adoção do produto. É preciso permitir o auto-registo, mas sem abrir a porta a spam e bots: a posse do e-mail tem de ser provada antes de a conta existir de facto, e contas nunca confirmadas não podem ficar na base. Aproveita-se para reduzir a cota de campanha (10 GiB → 300 MB), porque, com cadastro aberto, 10 GiB por campanha é um risco de custo de disco.

## What Changes

- Nova página pública de criação de conta (`/registo`): a pessoa informa só o e-mail, aceita termos/privacidade e recebe um link por e-mail.
- Novo endpoint `POST /api/auth/registo`: cria `Usuario` inativo sem senha e emite um `Convite` do novo tipo `verificar` com validade de 5 horas. O link leva à página `/convite/:token` já existente (definir senha e ativar).
- Resposta sempre genérica (não revela se o e-mail já existe). E-mail já ativo recebe um aviso de que a conta já existe, com link para entrar; e-mail pendente recebe um novo link.
- Envio de e-mail via **Resend** (HTTPS, `httpx`), atrás de uma interface `EmailSender`, com implementação de log para desenvolvimento e testes. Novas variáveis `EMAIL_API_KEY`, `EMAIL_FROM`.
- Limpeza: contas criadas por auto-registo e não ativadas dentro das 5 horas são apagadas (CLI + execução periódica), sem tocar em contas criadas por convite do admin.
- Antispam: rate limit por IP (erro 429 com código `LIMITE_REGISTO`, via tratamento global do limite) e por e-mail canonicalizado, o mesmo para os caminhos novo, pendente, ativo e desativado, honeypot, bloqueio de domínios de e-mail descartável, normalização de aliases, captcha Turnstile opcional, modo `REGISTO_MODO` (`fechado` | `aberto`).
- O convite do admin continua como hoje (72 h, link copiado); ganha a opção de enviar o link por e-mail quando o envio está configurado.
- **BREAKING (operacional)**: a cota de **todas** as campanhas passa para 300 MB (migração do control DB e novo padrão, configurável por `COTA_PADRAO_BYTES`). Campanhas já acima de 300 MB ficam bloqueadas para novos uploads, mas continuam legíveis.
- Arranque seguro em modo `aberto`: recusa-se a subir sem provedor de e-mail, sem `PUBLIC_BASE_URL` HTTPS ou sem `TRUSTED_PROXY=true` (fora do modo de depuração).
- Teste ponta a ponta possível: em modo de depuração, os e-mails são também gravados num arquivo (`EMAIL_LOG_FILE`).
- Textos em pt-BR e en.

## Capabilities

### New Capabilities
- `registo-autonomo`: auto-registo com verificação de e-mail, expiração e limpeza de contas pendentes, antispam e entrega de e-mail.
- `cota-campanha`: limite de armazenamento por campanha (valor padrão, migração, aviso e bloqueio de upload).

### Modified Capabilities
<!-- Nenhuma: os specs existentes não cobrem auth nem cota. -->

## Impact

- Backend: `app/routers/auth.py`, `app/services/auth_invite.py`, `app/services/auth_admin.py`, `app/services/admin_console.py`, `app/config.py`, `app/cli.py`, `app/main.py` (tarefa periódica), novos `app/services/email_sender.py` e `app/services/registo.py`, migração `009` em `alembic_control`.
- Cota: `app/models/campanha.py`, `app/services/campanha_admin.py` (`DEFAULT_COTA_BYTES`), `legacy_import.py`, `campaign_import.py`, `uploads.py` e testes.
- Frontend (`frontend-v2`): nova rota `/registo`, link na página de login e no header, ajustes à página `/convite`, textos de cota, locales pt-BR/en, testes.
- Operação: conta Resend, domínio com SPF/DKIM/DMARC, novas variáveis em `.env`; opcionalmente chaves Turnstile.
- Operação: `TRUSTED_PROXY=true` em produção (túnel da Cloudflare até o Caddy), plano gratuito do Resend limitado a 100 e-mails por dia; recomenda-se não divulgar o registo ao público amplo antes da change de cotas de IA e de limite de campanhas por conta.
- Fora de escopo: cotas de IA e limite de campanhas por conta (change futura); aprovação manual de contas.
