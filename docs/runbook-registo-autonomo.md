# Abertura do registo autónomo

1. Manter `REGISTO_MODO=fechado` na primeira implantação. A migração 009 ajusta a cota existente para 300 MiB; conferir o log para campanhas acima da cota.
2. Verificar o domínio no Resend (SPF, DKIM e DMARC). Definir `TRUSTED_PROXY=true` **antes** de configurar `EMAIL_API_KEY` e `EMAIL_FROM`, inclusive em staging: com `DEBUG=false`, a API não arranca com a chave e o proxy não confiável. O plano gratuito tem teto de 100 e-mails por dia; acompanhar entregas, rejeições e spam no painel do Resend.
3. Configurar `PUBLIC_BASE_URL` HTTPS e confirmar que o seu origin está em `CORS_ORIGINS` no `.env` de produção. Verificar no host e no roteador que nenhuma porta do API, web ou Caddy está publicada para a internet; o acesso externo deve ser somente pelo túnel da Cloudflare. Conferir que IPs externos diferentes produzem chaves distintas no limitador.
4. Opcionalmente configurar `TURNSTILE_SECRET` e `TURNSTILE_SITE_KEY`. Um segredo configurado faz a API recusar pedidos se a Cloudflare não responder.
5. Testar entrega de e-mail e ativação numa instância de teste. Então definir `REGISTO_MODO=aberto` na instância desejada. O modo é por instância. Para interromper novos cadastros, voltar a `fechado`.

Contas pendentes de bots podem aparecer no console do admin por até cinco horas. Nesse prazo, o convite do admin para o mesmo e-mail pode receber `EMAIL_DUPLICADO`. Não abrir o registo ao público amplo antes da change de cotas de IA e limite de campanhas por conta.

Em desenvolvimento, `DEBUG=true` permite `LogSender`; `EMAIL_LOG_FILE` deve apontar para um caminho sob `DATA_DIR`. Nunca habilitar esse log em produção, pois contém links de ativação.

## Recuperação de senha

Em `/esqueci-senha`, a pessoa pode pedir um link de redefinição de uso único, válido por 1 hora. O reset gerado pelo admin continua disponível e vale 72 horas. Um pedido novo invalida todos os links de reset anteriores da conta ainda abertos, inclusive os gerados pelo admin. Apenas contas ativas recebem o link; uma conta desativada nunca recebe um link nem é reativada por um link emitido antes da desativação.

Os pedidos têm limite de 5 por e-mail em 24 horas e 5 por IP em 1 hora; Turnstile pode ser configurado. Terceiros podem esgotar o teto diário de um e-mail. Nesse caso, a pessoa pode recorrer ao `/contato`. Os envios consomem a mesma quota do Resend usada pelo registo e pelo contato: 100 e-mails por dia no plano gratuito.

O token na URL `/reset/{token}` aparece nos logs de acesso do Caddy. A validade de 1 hora e o uso único reduzem o risco. Para testar após o deploy, peça o reset de uma conta de teste, abra o link recebido, defina uma senha nova e entre com ela.

## Contacto público

Antes do deploy, conferir o `.env` de produção. Configurar `TRUSTED_PROXY=true` primeiro e só depois `CONTATO_EMAIL`; com contacto configurado, `DEBUG=false` e proxy não confiável, a API não arranca. `CONTATO_LIMITE_DIARIO` (padrão 30) e `CONTATO_LIMITE_PRIVACIDADE` (padrão 10) controlam tetos separados. O plano gratuito do Resend oferece 100 e-mails/dia, quota partilhada com o registo. Recomenda-se manter Turnstile ativo.

O operador trata pedidos de retirada de dados manualmente por e-mail. O `reply-to` é informado por quem escreve; ter cuidado com links e anexos recebidos.

Em cada release, atualizar e conferir a versão nos quatro sítios: `backend/pyproject.toml` e `backend/uv.lock`, `frontend-v2/package.json` e `frontend-v2/package-lock.json`, README e CHANGELOG.
