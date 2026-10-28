# Tasks

Nota: no frontend só `frontend-v2` é alterado; `frontend/` e `frontend-next/` são legados e ficam como estão. Os testes de rate limit usam uma fixture local que chama `limiter._storage.reset()` (padrão de `test_indice_ia_rotas.py`).

## 1. Cota de campanha (300 MB)

- [x] 1.1 Adicionar `cota_padrao_bytes` (`COTA_PADRAO_BYTES`, padrão 300 MiB) em `app/config.py`; trocar a constante `DEFAULT_COTA_BYTES` pela função `default_cota_bytes()` (lida da configuração na hora do uso) e fazer o default de `Campanha.cota_bytes`, `legacy_import` e as duas verificações de `campaign_import` usá-lo; verificar com teste que criação, importação de legado e importação de pacote usam o valor configurado
- [x] 1.2 Criar a migração `009` em `alembic_control` com `UPDATE campanha SET cota_bytes = 314572800` e registo em log das campanhas que ficam com `bytes_usados` acima; verificar com teste de migração sobre um control DB com campanhas de 10 GiB
- [x] 1.3 Garantir que campanha acima da cota continua legível e exportável e recusa novos uploads e importação acima da cota; verificar com testes em `uploads.py` e `campaign_import`
- [x] 1.4 Atualizar o Painel (`frontend-v2`) para mostrar uso/cota, aviso a 90% e estado "excedida" derivado de `bytes_usados >= cota_bytes`, com textos em pt-BR e en; verificar com o `vitest` do painel
- [x] 1.5 Atualizar CHANGELOG e a menção a 10 GiB (incluindo o comentário em `.env.example`); verificar que `grep -ri "10 GiB"` não deixa referências vigentes

## 2. Modelo, convite `verificar` e canonicalização

- [x] 2.1 Na migração `009`, adicionar `email_canonico` (indexada) e `termos_aceitos_em` (anulável) a `usuario`, preenchendo `email_canonico` das linhas existentes com uma **cópia embutida** da regra (sem importar código de app); atualizar o modelo `Usuario`; verificar com testes de migração, preenchimento e downgrade
- [x] 2.2 Implementar `canonical_email` (minúsculas, `+etiqueta`, pontos e domínio `googlemail.com` no Gmail) e preenchê-lo em `create_usuario_with_invite`; verificar com testes unitários, incluindo domínio em maiúsculas, `+` vazio, `googlemail.com` e ponto inicial
- [x] 2.3 Adicionar o tipo `verificar` (TTL de 5 h) em `auth_invite.py`, fazer `_load_valid_invite` aceitar um conjunto de tipos e `accept_activate_invite` aceitar `activar` e `verificar`; verificar com testes de ativação, expiração e uso único
- [x] 2.4 Fazer `invite_url` devolver `/convite/{token}` para `verificar`; verificar com teste que o caminho não é `/reset/`

## 3. Envio de e-mail e configuração segura

- [x] 3.1 Criar `EmailSender`, `ResendSender` (`httpx`, timeout, nunca propaga, regista código HTTP e id sem e-mail em claro nem token) e `LogSender` (log e, com `EMAIL_LOG_FILE`, uma linha JSON por e-mail sob `DATA_DIR`), com seleção por `EMAIL_API_KEY` e `DEBUG`: `LogSender` só com `DEBUG=true` ou nos testes; verificar com testes usando `httpx.MockTransport` para sucesso, 4xx/5xx e timeout, e que o `LogSender` não é selecionado com `DEBUG=false`
- [x] 3.2 Criar os modelos de e-mail (verificação, "já tem conta", convite do admin) em pt-BR e en; verificar com teste que cada idioma gera assunto e link corretos
- [x] 3.3 Implementar `validate_registo_startup()` e chamá-la no `lifespan` de `main.py` (não num validador de `Settings`): com `REGISTO_MODO=aberto` e `DEBUG=false`, falhar sem `EMAIL_API_KEY`, com `PUBLIC_BASE_URL` que não seja HTTPS ou aponte para localhost, com o origin de `PUBLIC_BASE_URL` fora de `CORS_ORIGINS`, ou com `TRUSTED_PROXY` diferente de `true`; verificar com um teste direto da função por cada condição e que o CLI e o `pytest` não são afetados
- [x] 3.4 Atualizar `.env.example` com `EMAIL_API_KEY`, `EMAIL_FROM`, `REGISTO_MODO`, `TURNSTILE_SECRET`, `TURNSTILE_SITE_KEY`, `COTA_PADRAO_BYTES`, `REGISTO_DOMINIOS_BLOQUEADOS` e `EMAIL_LOG_FILE`, todas comentadas, e escrever o runbook em `docs/` (domínio Resend, teto de 100 e-mails/dia, `TRUSTED_PROXY=true`, verificação de que nenhuma porta do host está publicada para a internet e o acesso externo é só pelo túnel da Cloudflare, contas pendentes de bots visíveis no console do admin por até 5 h e `EMAIL_DUPLICADO` nesse prazo, registo ligado por instância, conferir `CORS_ORIGINS` no `.env` de produção, ordem de abertura, recomendação de não abrir ao público amplo antes da change de cotas de IA e de campanhas por conta); verificar que cada variável do código aparece no `.env.example`

## 4. Endpoint de registo e antispam

- [x] 4.1 Parametrizar `auth_lockout` (limite e janela por chamada, sem mudar o comportamento do login) e criar o contador de pedidos de registo (chave `registo:{sha256(email_canonico)}`, máx. 3 por 24 h, rotina que remove contadores vencidos); verificar com testes do contador (teto, janela, expiração) e que os testes de `test_auth_lockout.py` continuam a passar
- [x] 4.2 Implementar `app/services/registo.py` com as regras de estado (novo; pendente = inativo sem senha; ativo e desativado só recebem aviso e **nunca** são reativados), invalidação dos `verificar` anteriores com `expira_em = agora`, registo de `termos_aceitos_em`, captura de `IntegrityError` com nova consulta por canônico e o contador por e-mail nos quatro casos; verificar com testes de cada caso, do teto em todos os caminhos e da corrida
- [x] 4.3 Criar `POST /api/auth/registo` (202 sempre genérico, só validações independentes da conta antes de responder, processamento em `BackgroundTasks` com sessão própria, `5/hour` por IP, aceite obrigatório, honeypot, `idioma`) e `GET /api/auth/registo/config`; verificar com testes de rota: corpo e status idênticos nos casos novo, pendente, ativo e desativado, e nenhuma consulta de conta antes da resposta
- [x] 4.4 Substituir o tratamento global de `RateLimitExceeded` por um que emita `{"detail": {"erro": "LIMITE_REGISTO"}}` no registo e `LIMITE_PEDIDOS` nas demais rotas, mantendo estado 429 e limites; verificar com testes do registo e de uma rota já limitada existente
- [x] 4.5 Implementar o bloqueio de domínios descartáveis (lista em `app/data/` e ficheiro opcional); verificar com teste
- [x] 4.6 Implementar a verificação opcional do Turnstile (`TURNSTILE_SECRET`) com timeout de cerca de 3 s e falha fechada (`CAPTCHA_INDISPONIVEL`); verificar com testes de sucesso, falha, indisponível e desligado
- [x] 4.7 Implementar `REGISTO_MODO` (`fechado` por padrão) no endpoint e no `config`; verificar com teste de que `fechado` recusa

## 5. Limpeza de contas pendentes

- [x] 5.1 Extrair o corpo de `delete_user` para uma função sem as verificações de admin/dono e reutilizá-la em `purge_unverified_signups` (apaga `Convite`, `Sessao`, `Membro` e o `LoginBloqueio` de login, **sem** apagar o contador do registo); implementar a limpeza com as condições do design (todos os convites `verificar`, o mais recente expirado) e o CLI `usuario limpar-pendentes`, logando só a contagem de contas apagadas; verificar com testes: apaga conta auto-registada expirada, apaga conta que pediu segundo link, preserva convite do admin, conta ativa, conta desativada e conta com campanha, preserva o contador do registo, e uma conta ativada durante a limpeza não é apagada
- [x] 5.2 Iniciar a tarefa periódica (15 min) no `lifespan`, com captura e log de exceções e cancelamento no encerramento; verificar com teste do ciclo de vida

## 6. Convite do admin por e-mail

- [x] 6.1 Adicionar `enviar_email` em `POST /api/admin/convites` (recusado com erro explícito se o provedor real não estiver configurado fora de `DEBUG`) e a informação de disponibilidade do envio para a UI, mantendo o link na resposta; verificar com testes com e sem envio e sem provedor
- [x] 6.2 Adicionar a opção em `admin-convites` (`frontend-v2`), oculta quando o envio não estiver disponível, com locales pt-BR e en; verificar com teste do componente

## 7. Frontend de registo (`frontend-v2`)

- [x] 7.1 Criar a rota `/registo` com formulário (e-mail, aceite, honeypot de nome não óbvio com `tabIndex={-1}` e `aria-hidden`, Turnstile quando houver chave, estado "verifique o seu e-mail" com a orientação de verificar o spam e tentar de novo mais tarde, estado de registo fechado, redirecionamento de quem tem sessão para `/painel`) e `authApi.register`; verificar com testes de componente
- [x] 7.2 Registar `/registo`, `/termos` e `/privacidade` nos dois blocos de rotas de `main.tsx` e adicionar "Criar conta" no login e no `SiteHeader`; verificar com teste de rotas
- [x] 7.3 Adicionar em `errors.*`, nos locales pt-BR e en, os códigos `REGISTO_FECHADO`, `EMAIL_DESCARTAVEL`, `EMAIL_INVALIDO`, `LIMITE_REGISTO`, `LIMITE_PEDIDOS`, `CAPTCHA_INVALIDO`, `CAPTCHA_INDISPONIVEL` e `TERMOS_NAO_ACEITOS`; verificar com teste que cada código resolve para texto em ambos os idiomas
- [x] 7.4 Redigir `/termos` e `/privacidade` em pt-BR e en a partir do tratamento real de dados do design (decisão 13, incluindo Resend e DeepSeek); verificar a navegação a partir do formulário (nova aba) e que cada tratamento listado corresponde a código existente
- [x] 7.5 Ajustar `/convite` para mostrar o atalho "pedir novo link" só em `CONVITE_EXPIRADO` de link de verificação com registo aberto, e orientação ao admin para convite do admin expirado; verificar com testes de componente dos dois casos

## 8. Integração

- [x] 8.1 Editar `frontend-v2/playwright.config.ts` para o backend do e2e subir com `DEBUG=true`, `REGISTO_MODO=aberto` e `EMAIL_LOG_FILE` dentro do `DATA_DIR`, e escrever o teste e2e Playwright do caminho feliz (registo, ler o último e-mail do arquivo, abrir o link, definir senha, chegar ao Painel); o link expirado fica coberto por testes de backend e de componente, pois o TTL de 5 h não é esperável no e2e; verificar que a suíte e2e passa
- [x] 8.2 Executar a suíte completa de backend e de frontend e o type-check; verificar que passam
