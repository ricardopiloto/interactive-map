# Tasks

Nota: no frontend só `frontend-v2` é alterado; `frontend/` e `frontend-next/` são legados e ficam como estão. Os testes de rate limit usam uma fixture local que chama `limiter._storage.reset()` (padrão de `test_indice_ia_rotas.py`).

## 1. Cota de campanha (300 MB)

- [ ] 1.1 Adicionar `cota_padrao_bytes` (`COTA_PADRAO_BYTES`, padrão 300 MiB) em `app/config.py`; tornar `DEFAULT_COTA_BYTES` derivado da configuração em vez de constante de módulo e fazer o default de `Campanha.cota_bytes`, `legacy_import` e as duas verificações de `campaign_import` usá-lo; verificar com teste que criação, importação de legado e importação de pacote usam o valor configurado
- [ ] 1.2 Criar a migração `009` em `alembic_control` com `UPDATE campanha SET cota_bytes = 314572800` e registo em log das campanhas que ficam com `bytes_usados` acima; verificar com teste de migração sobre um control DB com campanhas de 10 GiB
- [ ] 1.3 Garantir que campanha acima da cota continua legível e exportável e recusa novos uploads e importação acima da cota; verificar com testes em `uploads.py` e `campaign_import`
- [ ] 1.4 Atualizar o Painel (`frontend-v2`) para mostrar uso/cota, aviso a 90% e estado "excedida" derivado de `bytes_usados >= cota_bytes`, com textos em pt-BR e en; verificar com o `vitest` do painel
- [ ] 1.5 Atualizar CHANGELOG e a menção a 10 GiB (incluindo o comentário em `.env.example`); verificar que `grep -ri "10 GiB"` não deixa referências vigentes

## 2. Modelo, convite `verificar` e canonicalização

- [ ] 2.1 Na migração `009`, adicionar `email_canonico` (indexada) e `termos_aceitos_em` (anulável) a `usuario`, preenchendo `email_canonico` das linhas existentes com uma **cópia embutida** da regra (sem importar código de app); atualizar o modelo `Usuario`; verificar com testes de migração, preenchimento e downgrade
- [ ] 2.2 Implementar `canonical_email` (minúsculas, `+etiqueta`, pontos e domínio `googlemail.com` no Gmail) e preenchê-lo em `create_usuario_with_invite`; verificar com testes unitários, incluindo domínio em maiúsculas, `+` vazio, `googlemail.com` e ponto inicial
- [ ] 2.3 Adicionar o tipo `verificar` (TTL de 5 h) em `auth_invite.py`, fazer `_load_valid_invite` aceitar um conjunto de tipos e `accept_activate_invite` aceitar `activar` e `verificar`; verificar com testes de ativação, expiração e uso único
- [ ] 2.4 Fazer `invite_url` devolver `/convite/{token}` para `verificar`; verificar com teste que o caminho não é `/reset/`

## 3. Envio de e-mail e configuração segura

- [ ] 3.1 Criar `EmailSender`, `ResendSender` (`httpx`, timeout, nunca propaga, regista código HTTP e id sem e-mail em claro nem token) e `LogSender` (log e, com `EMAIL_LOG_FILE`, uma linha JSON por e-mail sob `DATA_DIR`), com seleção por `EMAIL_API_KEY` e `DEBUG`: `LogSender` só com `DEBUG=true` ou nos testes; verificar com testes usando `httpx.MockTransport` para sucesso, 4xx/5xx e timeout, e que o `LogSender` não é selecionado com `DEBUG=false`
- [ ] 3.2 Criar os modelos de e-mail (verificação, "já tem conta", convite do admin) em pt-BR e en; verificar com teste que cada idioma gera assunto e link corretos
- [ ] 3.3 Validar o arranque com `REGISTO_MODO=aberto` e `DEBUG=false`: falhar sem `EMAIL_API_KEY`, com `PUBLIC_BASE_URL` que não seja HTTPS ou aponte para localhost, ou com `TRUSTED_PROXY` diferente de `true`; verificar com um teste de configuração por cada condição
- [ ] 3.4 Atualizar `.env.example` com `EMAIL_API_KEY`, `EMAIL_FROM`, `REGISTO_MODO`, `TURNSTILE_SECRET`, `TURNSTILE_SITE_KEY`, `COTA_PADRAO_BYTES`, `REGISTO_DOMINIOS_BLOQUEADOS` e `EMAIL_LOG_FILE`, todas comentadas, e escrever o runbook em `docs/` (domínio Resend, teto de 100 e-mails/dia, `TRUSTED_PROXY=true`, verificação de que nenhuma porta do host está publicada para a internet e o acesso externo é só pelo túnel da Cloudflare, ordem de abertura, recomendação de não abrir ao público amplo antes da change de cotas de IA e de campanhas por conta); verificar que cada variável do código aparece no `.env.example`

## 4. Endpoint de registo e antispam

- [ ] 4.1 Implementar `app/services/registo.py` com as regras de estado (novo; pendente = inativo sem senha; ativo e desativado só recebem aviso e **nunca** são reativados), invalidação de `verificar` anteriores, registo de `termos_aceitos_em`, captura de `IntegrityError` com nova consulta por canônico e o contador por e-mail (`registo:{email_canonico}`, máx. 3 por 24 h, via mecanismo de `LoginBloqueio`) que vale para os quatro casos; verificar com testes de cada caso, do teto em todos os caminhos e da corrida
- [ ] 4.2 Criar `POST /api/auth/registo` (202 sempre genérico, só validações independentes da conta antes de responder, processamento em `BackgroundTasks` com sessão própria, `5/hour` por IP, aceite obrigatório, honeypot, `idioma`) e `GET /api/auth/registo/config`; verificar com testes de rota: corpo e status idênticos nos casos novo, pendente, ativo e desativado, e nenhuma consulta de conta antes da resposta
- [ ] 4.3 Substituir o tratamento global de `RateLimitExceeded` por um que emita `{"detail": {"erro": "LIMITE_REGISTO"}}` no registo e `LIMITE_PEDIDOS` nas demais rotas, mantendo estado 429 e limites; verificar com testes do registo e de uma rota já limitada existente
- [ ] 4.4 Implementar o bloqueio de domínios descartáveis (lista em `app/data/` e ficheiro opcional); verificar com teste
- [ ] 4.5 Implementar a verificação opcional do Turnstile (`TURNSTILE_SECRET`); verificar com testes de sucesso, falha e desligado
- [ ] 4.6 Implementar `REGISTO_MODO` (`fechado` por padrão) no endpoint e no `config`; verificar com teste de que `fechado` recusa

## 5. Limpeza de contas pendentes

- [ ] 5.1 Extrair o corpo de `delete_user` para uma função sem as verificações de admin/dono e reutilizá-la em `purge_unverified_signups` (apaga `Convite`, `Sessao`, `Membro`, `LoginBloqueio` de login e contador do registo); implementar a limpeza com as condições do design e o CLI `usuario limpar-pendentes`; verificar com testes: apaga conta auto-registada expirada, preserva convite do admin, conta ativa, conta desativada e conta com campanha, e não deixa linhas de bloqueio
- [ ] 5.2 Iniciar a tarefa periódica (15 min) no `lifespan`, com captura e log de exceções e cancelamento no encerramento; verificar com teste do ciclo de vida

## 6. Convite do admin por e-mail

- [ ] 6.1 Adicionar `enviar_email` em `POST /api/admin/convites` (recusado com erro explícito se o provedor real não estiver configurado fora de `DEBUG`) e a informação de disponibilidade do envio para a UI, mantendo o link na resposta; verificar com testes com e sem envio e sem provedor
- [ ] 6.2 Adicionar a opção em `admin-convites` (`frontend-v2`), oculta quando o envio não estiver disponível, com locales pt-BR e en; verificar com teste do componente

## 7. Frontend de registo (`frontend-v2`)

- [ ] 7.1 Criar a rota `/registo` com formulário (e-mail, aceite, honeypot de nome não óbvio com `tabIndex={-1}` e `aria-hidden`, Turnstile quando houver chave, estado "verifique o seu e-mail", estado de registo fechado, redirecionamento de quem tem sessão para `/painel`) e `authApi.register`; verificar com testes de componente
- [ ] 7.2 Registar `/registo`, `/termos` e `/privacidade` nos dois blocos de rotas de `main.tsx` e adicionar "Criar conta" no login e no `SiteHeader`; verificar com teste de rotas
- [ ] 7.3 Adicionar em `errors.*`, nos locales pt-BR e en, os códigos `REGISTO_FECHADO`, `EMAIL_DESCARTAVEL`, `EMAIL_INVALIDO`, `LIMITE_REGISTO`, `LIMITE_PEDIDOS`, `CAPTCHA_INVALIDO` e `TERMOS_NAO_ACEITOS`; verificar com teste que cada código resolve para texto em ambos os idiomas
- [ ] 7.4 Redigir `/termos` e `/privacidade` em pt-BR e en a partir do tratamento real de dados do design (decisão 13, incluindo Resend e DeepSeek); verificar a navegação a partir do formulário (nova aba) e que cada tratamento listado corresponde a código existente
- [ ] 7.5 Ajustar `/convite` para mostrar o atalho "pedir novo link" só em `CONVITE_EXPIRADO` de link de verificação com registo aberto, e orientação ao admin para convite do admin expirado; verificar com testes de componente dos dois casos

## 8. Integração

- [ ] 8.1 Escrever o teste e2e Playwright do fluxo completo (registo com `DEBUG=true` e `EMAIL_LOG_FILE`, ler o último e-mail do arquivo, abrir o link, definir senha, chegar ao Painel) e do caso de link expirado; verificar que a suíte e2e passa
- [ ] 8.2 Executar a suíte completa de backend e de frontend e o type-check; verificar que passam
