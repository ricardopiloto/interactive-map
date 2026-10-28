# Review — Arquiteto de Soluções

**Change:** registo-autonomo
**Data:** 2026-10-28 (segunda revisão, após incorporar o parecer anterior)
**Veredito geral:** Aprovado com ressalvas

Contexto lido: README, `docker-compose.yml`, `deploy/Caddyfile`, `.env.example`, `docs/runbook-corte-campaign-codex.md`, `backend/app/{services/auth_lockout.py, services/client_ip.py, services/rate_limit.py, middleware/csrf.py, campaign_db.py}`, e os quatro artefatos da change relidos do disco. Topologia real: túnel da Cloudflare → Caddy do host → contêineres `api` (FastAPI, 1 worker uvicorn, SQLite control.db + SQLite por campanha) e `web` (nginx + SPA).

## Situação das ressalvas da primeira revisão
Resolvidas no `design.md`/`tasks.md`/spec: A (`TRUSTED_PROXY`, agora ajustada ao túnel), B (`PUBLIC_BASE_URL`), C (contador por e-mail em todos os caminhos), D (regra de pendente/desativada), E (`LogSender` só em depuração), F (corrida e `IntegrityError`), G (cópia da canonicalização na migração), diagramas e alternativas nas decisões 5, 6, 8. Nada disso voltou a aparecer. Surgiram quatro pontos novos, dois deles consequência das próprias correções.

## 1. Definição da arquitetura técnica
Veredito: OK
- Coerente com a stack (FastAPI, SQLModel, Alembic, `slowapi`, `httpx`); nenhuma peça de infraestrutura nova.
- A carga está implícita nos limites (5/h por IP, 3/dia por e-mail) e no teto do Resend (100/dia); está dito no Risco correspondente. Suficiente para o volume do produto.

## 2. Integração com a infraestrutura existente
Veredito: OK
- O acesso só por túnel está refletido no contexto, na decisão 9, no risco e no plano de migração. A verificação "nenhuma porta publicada" é executável e está na tarefa 3.4.
- `CsrfOriginMiddleware` exige `Origin`/`Referer` dentro de `CORS_ORIGINS` em POSTs. O `POST /api/auth/registo` parte do mesmo site, então passa; a validação de arranque de `PUBLIC_BASE_URL` poderia também conferir que o origin público está em `CORS_ORIGINS`, caso contrário o registo falha com `CSRF_ORIGIN_INVALIDA` no primeiro dia (ver H5).
- Multi-instância: o registo é por instância (`.env` próprio). Já não está citado no runbook; acrescentar uma linha.
- Backup/migração: aditivo, coberto.

## 3. Qualidade de arquitetura e trade-offs
Veredito: Atenção
- **H1 (Atenção, forte): a limpeza nunca apagaria contas que pediram um segundo link.** A decisão 2 invalida os `verificar` anteriores marcando-os `consumido_em`; a decisão 3 só apaga contas cujos convites sejam todos "expirados **e não consumidos**". Uma conta pendente que se registou duas vezes teria um convite consumido, logo nunca satisfaz a condição de limpeza e ficaria na base para sempre. Recomendação: invalidar o anterior fixando `expira_em = agora` (em vez de `consumido_em`), e definir a condição de limpeza como "pendente, sem `Membro`/`Sessao`, todos os convites do tipo `verificar`, e o mais recente expirado". Como pendente implica sem senha, nenhum `verificar` consumido com sucesso pode existir numa conta pendente. Efeito colateral bom: o link antigo mostra "expirado" (com atalho para novo registo) em vez de "já foi usado".
- **H2 (Atenção, forte): a limpeza reinicia o limite por e-mail e o torna contornável.** A tarefa 5.1 e o cenário "Registos de bloqueio" da spec apagam o contador `registo:{email_canonico}` junto com a conta. Mas as contas apagadas são exatamente as do atacante, que nunca confirma: a cada ~5 h o contador some e ele recomeça. O teto de "3 por 24 h" vira cerca de 3 por 5 h (≈14/dia) contra a mesma vítima. Recomendação: a limpeza **não** apaga o contador do registo (ele expira sozinho ao fim da janela e uma rotina remove os vencidos); apaga só o `LoginBloqueio` de login. Corrigir o cenário da spec.
- **H3 (Atenção): `LoginBloqueio` não expressa "3 por 24 h".** O mecanismo atual é "N falhas → bloqueio de 15 minutos, depois zera" (`MAX_FAILURES=5`, `LOCKOUT_MINUTES=15` fixos). O design diz "reutilizando o mecanismo (máx. 3 por 24 h)", o que não é verdade sem alterar ou parametrizar. Opções: parametrizar `auth_lockout` (limite e janela por chave) ou adicionar uma contagem por janela deslizante na mesma tabela. Decidir na tarefa 4.1. Sugestão de privacidade: usar um hash do e-mail canônico na chave, para a tabela de contadores não guardar endereços de terceiros que nunca confirmaram.
- **H4 (Atenção, menor): o Turnstile roda no caminho síncrono.** Se a Cloudflare demorar ou cair, o pedido de registo fica pendurado. Definir timeout curto e que, falhando a verificação por indisponibilidade, o pedido é recusado (fecha em vez de abrir), com erro distinto de `CAPTCHA_INVALIDO`.
- **H5 (Atenção, menor): origem do POST.** Incluir na validação de arranque (decisão 9) que o origin de `PUBLIC_BASE_URL` conste em `CORS_ORIGINS`, ou documentar no runbook; hoje o `.env.example` traz `PUBLIC_BASE_URL=http://localhost:5173` e `CORS_ORIGINS` com outro host.
- Segurança preservada: tokens opacos com hash, resposta genérica, desativada nunca reativada, `LogSender` fora de produção, falhas de envio sem e-mail/token no log. Pré-sequestro de conta (atacante registra o e-mail da vítima) não dá acesso, pois a senha só se define com o link enviado ao dono do e-mail.
- UX do limite silencioso: um usuário legítimo que atinja o teto por e-mail vê sucesso e não recebe nada. Aceitável, mas o texto da confirmação deve orientar ("se não chegar em alguns minutos, verifique o spam; se continuar, tente de novo mais tarde").

## 4. Documentação e decisões (ADRs)
Veredito: OK
- Os dois diagramas ajudam a ver exatamente o que H1 quebra (o estado `Pendente → [*]` na limpeza). Atualizar o diagrama depois de corrigir H1.
- Alternativas registradas nas decisões que importam. A decisão 6 deveria registrar a alternativa descartada da janela por tabela nova, quando H3 for decidido.

## 5. Ponte entre produto e técnico
Veredito: OK
- Os requisitos do produto estão cobertos e rastreáveis: auto-registo por e-mail, link de 5 horas, limpeza do lixo, convite do admin mantido, cota de 300 MB. O risco de custo de disco sem limite de campanhas por conta está explicitado e a recomendação de não abrir ao público amplo antes da change de cotas permanece.

## Bloqueantes antes de implementar
- nenhum (H1 e H2 devem ser corrigidos no `design.md`/spec/tasks antes do apply, porque mudam as regras que os testes vão verificar)

## Ressalvas a incorporar
- H1 → decisão 2 e 3, tarefas 4.1 e 5.1, diagrama de estados.
- H2 → decisão 3, spec (cenário "Registos de bloqueio"), tarefa 5.1.
- H3 → decisão 6 e tarefa 4.1 (parametrizar `auth_lockout` ou janela própria; chave com hash).
- H4, H5 → decisões 7 e 9; runbook (3.4).
