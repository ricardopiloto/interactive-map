# Feature Specification: Contas de mestre, convite, sessão e permissões

**Feature Branch**: `095-contas-sessao-permissoes`

**Created**: 2026-09-20

**Status**: Implemented

**Input**: User description: "Contas de mestre, convite, sessão e permissões. Tabelas Usuario, Membro, Convite e Sessao no banco de controle. Senha com Argon2 (pwdlib). Login e logout com sessão no servidor (token opaco, guarda-se o hash), cookie HttpOnly, Secure, SameSite=Lax, invalidada ao trocar senha; CSRF por SameSite=Lax mais checagem de Origin em métodos que alteram dados. CLI do super-admin: criar mestre (gera link de convite de uso único com validade), gerar link de reset de senha, desativar conta, atribuir dono a uma campanha. Dependência única require_membro substitui verify_admin: o mestre só vê e edita as campanhas de que é membro. Limite de tentativas de login por conta e por IP real (corrigir o uso do IP do proxy no slowapi). Remover o Basic Auth do app e do Caddy; o upload de imagem passa a usar o cookie de sessão. Frontend: tela de login e substituição do gate de senha. Fora de escopo: cadastro aberto, tela de super-admin, co-mestre na interface. Depende de: 094. Critério-chave: teste automatizado que percorre TODAS as rotas admin registradas e falha se alguma responder a anônimo ou a mestre de outra campanha."

**Depends on**: [094-roteamento-campanha](../094-roteamento-campanha/spec.md) (Implemented); Campaign Codex brief ([docs/v2/product-brief-campaign-codex.md](../../docs/v2/product-brief-campaign-codex.md) fase 095); constituição v1.0.0 (I, II, III, IV, V, VI)

## Constitution

- Isolamento (I): Toda rota de **escrita/administração** sob `/api/c/{slug}/…` MUST exigir membro da **essa** campanha. Matriz obrigatória: **todas** as rotas admin registadas — anónimo e mestre de outra campanha MUST falhar (não 2xx de conteúdo). Sem `campanha_id` nas tabelas de conteúdo.
- Testes primeiro (II): Auth, permissões, migrações Alembic do controle e a matriz admin completa MUST ter testes a falhar **antes** da implementação correspondente.
- Produção legada (III): MUST NOT exigir alteração das instâncias WFRP/WoD em `/opt/codex-*` até 099. Remoção de Basic Auth no Caddy/app desta codebase é para o **Campaign Codex** em desenvolvimento, não um corte forçado nas pastas antigas.
- Simplicidade (IV): Controlo em `control.db`; uma dependência de hashing de senha justificada (Argon2 via biblioteca da stack Python). Sem SSO/OIDC. Sem painel super-admin na UI.
- i18n (V): Tela de login e mensagens de auth novas MUST ter chaves pt-BR e en. Lore do mestre não é traduzido. Erros de API por códigos mapeáveis.
- Migrações (VI): Tabelas Usuario / Membro / Convite / Sessao MUST entrar por revisão Alembic do **controle** (`render_as_batch`). Sem schema novo em `campanha.db` nesta fase.

## Clarifications

### Session 2026-09-20

- Q: Identificador de login do mestre → A: Email único = login
- Q: Limites de tentativas de login → A: 5 falhas → bloqueio 15 min (por conta e por IP)
- Q: Atribuir dono quando já existe dono → A: Um dono; atribuir substitui; o anterior deixa de ser membro
- Q: Rotas de login / convite / reset → A: Globais `/login`, `/convite/:token`, `/reset/:token`
- Q: Destino após login sem retorno → A: `?next=` seguro; senão página mínima pós-login (sem listar campanhas)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Super-admin convida um mestre (Priority: P1)

O super-admin, na linha de comando, cria uma conta de mestre e obtém um **link de convite de uso único** com validade. O convidado abre o link, define a própria senha e passa a poder autenticar-se. Não há cadastro aberto na app.

**Why this priority**: Sem contas por convite não há substituição segura do Basic Auth partilhado.

**Independent Test**: CLI cria mestre + imprime link; consumir o link define senha; segundo uso do mesmo link falha; link expirado falha.

**Acceptance Scenarios**:

1. **Given** um **email** livre (único na instância), **When** o super-admin corre o comando de criar mestre, **Then** existe um Utilizador pendente de activação e um Convite válido de uso único com prazo, e a saída inclui o link.
2. **Given** um convite válido, **When** o convidado define a senha pelo link, **Then** a conta fica utilizável para login e o convite deixa de ser reutilizável.
3. **Given** o mesmo link já usado ou fora de validade, **When** se tenta definir senha, **Then** a operação é recusada com erro claro (código mapeável).

---

### User Story 2 - Mestre inicia e termina sessão (Priority: P1)

O mestre autentica-se na tela de login. O servidor cria uma sessão (token opaco; só o **hash** é guardado), envia cookie HttpOnly, Secure, SameSite=Lax. Logout invalida a sessão. Troca de senha (via reset) invalida sessões existentes dessa conta. Leituras públicas da campanha continuam sem login.

**Why this priority**: Substitui o gate Basic Auth / senha GM partilhada.

**Independent Test**: Login → cookie presente → pedido admin autenticado; logout → admin recusado; após reset de senha, cookie antigo recusado.

**Acceptance Scenarios**:

1. **Given** credenciais válidas de mestre activo, **When** faz login, **Then** recebe cookie de sessão e pode chamar rotas admin das campanhas de que é membro.
2. **Given** sessão activa, **When** faz logout, **Then** o cookie/sessão deixa de autorizar escritas.
3. **Given** sessão activa, **When** a senha é redefinida por link de reset, **Then** a sessão anterior deixa de ser válida.
4. **Given** jogador sem conta, **When** pede listagens públicas sob `/api/c/{slug}/…`, **Then** continua a obter leitura sem login (comportamento 094).

---

### User Story 3 - Mestre só gere as campanhas de que é membro (Priority: P1)

O Basic Auth de instância desaparece da app (e da config Caddy do Campaign Codex no repositório). Uma única guarda `require_membro` (conceito: «é membro desta campanha resolvida pelo slug») protege **todas** as rotas admin sob esse slug, incluindo upload de imagem (passa a usar o cookie de sessão). Mestre da campanha A **não** lê nem escreve admin da campanha B.

**Why this priority**: Critério-chave de isolamento com contas (constituição I + brief).

**Independent Test**: Matriz automatizada sobre **todas** as rotas admin registadas: anónimo → falha; mestre não-membro → falha; mestre membro → sucesso (onde aplicável).

**Acceptance Scenarios**:

1. **Given** mestre membro só de A, **When** pede qualquer rota admin sob o slug B, **Then** o pedido é recusado (sem dados de B).
2. **Given** pedido anónimo a qualquer rota admin registada sob um slug válido, **When** corre a matriz, **Then** **nenhuma** responde com sucesso de conteúdo autenticado.
3. **Given** mestre membro de A, **When** faz upload de imagem sob o slug A com cookie de sessão (sem Basic Auth), **Then** o upload é aceite segundo as regras actuais de categoria/tipo.
4. **Given** a configuração de deploy do Campaign Codex no repositório, **When** esta feature está implementada, **Then** já não depende de Basic Auth da app nem do Caddy para o portão GM (credenciais `ADMIN_USER`/`ADMIN_PASSWORD` deixam de ser o portão).

---

### User Story 4 - Super-admin opera contas e donos por CLI (Priority: P1)

Além de criar mestre, o super-admin pode: gerar link de **reset de senha** (uso único, com validade), **desactivar** conta, e **atribuir dono** (membro com papel de dono) a uma campanha existente. Sem UI de super-admin.

**Why this priority**: Operação solo do operador da instância; brief (convite + reset por Ricardo).

**Independent Test**: Cada subcomando CLI com sucesso e casos de recusa (conta inexistente, campanha inexistente).

**Acceptance Scenarios**:

1. **Given** um mestre activo, **When** se gera reset, **Then** um link de uso único com validade permite definir nova senha e invalida sessões anteriores.
2. **Given** uma conta, **When** o super-admin a desactiva, **Then** login e uso de sessões dessa conta falham.
3. **Given** utilizador e campanha existentes, **When** se atribui dono, **Then** esse utilizador passa a ser o **único** membro dono e consegue admin sob o slug dessa campanha.
4. **Given** uma campanha que já tem dono D1, **When** se atribui dono a D2, **Then** D2 é o dono e D1 **deixa de ser membro** dessa campanha (perde acesso admin a ela).

---

### User Story 5 - Login resiste a força bruta; IP real atrás de proxy (Priority: P1)

Tentativas de login falhadas são limitadas **por conta** e **por IP do cliente real** (não o IP do proxy reverso): **5 falhas → bloqueio de 15 minutos** (contadores independentes; durante o bloqueio a senha correcta também falha). O limitador actual que via o proxy MUST ser corrigido para esta superfície (e o padrão fica documentado para o restante rate-limit).

**Why this priority**: Risco explícito no brief; cookie de sessão aumenta o valor do login.

**Independent Test**: Exceder o limite por conta e por IP → recusa temporária; pedidos atrás de proxy usam o IP do cliente configurado (ex. cabeçalho confiado só quando vem da borda esperada).

**Acceptance Scenarios**:

1. **Given** 5 falhas de login na mesma conta, **When** se tenta de novo (mesmo com senha correcta) dentro de 15 minutos, **Then** o login é recusado por bloqueio temporário.
2. **Given** 5 falhas a partir do mesmo IP real (contas iguais ou distintas), **When** se excede o limite, **Then** novos logins desse IP são recusados durante 15 minutos.
3. **Given** a app atrás do proxy/Caddy, **When** se regista o IP para o limite, **Then** usa-se o IP do cliente (não o do proxy).

---

### User Story 6 - Frontend: login no lugar do gate de senha GM (Priority: P1)

A UI deixa de usar o diálogo/credenciais Basic Auth partilhadas. Existe tela de login; após sucesso, o Modo GM / escritas usam a sessão (cookie). Copy nova em pt-BR e en.

**Why this priority**: Sem isto o mestre não consegue operar a UI pós-remoção do Basic Auth.

**Independent Test**: Abrir login, autenticar, entrar em modo edição numa campanha de que é membro; anónimo não passa o portão de escrita.

**Acceptance Scenarios**:

1. **Given** mestre com conta, **When** completa o login na UI em `/login`, **Then** deixa de ver o gate de senha GM antigo e consegue acções admin na campanha membro.
2. **Given** utilizador sem sessão, **When** tenta uma acção admin na UI, **Then** é direcionado a `/login` (não ao antigo Basic Auth).
3. **Given** interface em pt-BR ou en, **When** vê `/login`, `/convite/:token` ou `/reset/:token` e erros de auth, **Then** o texto está no idioma da UI.
4. **Given** login com sucesso e `?next=` apontando a um path interno seguro (ex. `/c/mesa/…`), **When** autentica, **Then** é redirecionado para esse path.
5. **Given** login com sucesso **sem** `next` válido, **When** autentica, **Then** vê uma página mínima pós-login (sessão iniciada / peça link `/c/…`) — **sem** listar campanhas (098).

---

### Edge Cases

- Conta desactivada: login e sessões existentes falham.
- Convite/reset expirado ou reutilizado: recusa; sem revelar dados desnecessários de outras contas.
- Membro sem papel de dono: nesta fase a CLI só atribui **dono** e a campanha tem **no máximo um** dono; atribuir de novo **substitui** e remove o membership do dono anterior. Co-mestre pode existir no modelo para o futuro, mas **sem** UI; `require_membro` trata qualquer membro activo como autorizado a admin nesta fase.
- CSRF: escritas (POST/PUT/PATCH/DELETE) MUST falhar se `Origin`/`Referer` não for confiável, além de SameSite=Lax.
- Cookie Secure: em desenvolvimento local HTTP, política documentada (Secure desligado só em debug explícito, ou equivalente); em produção Secure obrigatório.
- Jogador: rotas públicas intactas; sem conta de jogador.
- Instâncias `/opt/codex-*` intocadas por esta feature (III).
- Página inicial / login: auth em rotas globais; lista de campanhas continua 098.
- Cadastro aberto e painel super-admin na app: fora de escopo.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: MUST existir no banco de **controle** as entidades **Usuario**, **Membro**, **Convite** e **Sessao**, criadas/evoluídas por migração versionada Alembic.
- **FR-001a**: **Usuario.email** MUST ser único na instância e MUST ser o identificador de login (tela e API de autenticação).
- **FR-002**: Senhas MUST ser armazenadas com Argon2 (via biblioteca de hashing adoptada no plano); MUST NOT guardar senha em claro.
- **FR-003**: Login MUST criar sessão no servidor com token opaco (persistir só o hash do token); cookie HttpOnly, SameSite=Lax, Secure em produção; Logout MUST invalidar a sessão.
- **FR-004**: Métodos que alteram dados MUST validar Origin (ou política CSRF equivalente documentada) além de SameSite=Lax.
- **FR-005**: CLI de super-admin MUST permitir: criar mestre (com link de convite uso único + validade), gerar reset de senha (uso único + validade), desactivar conta, atribuir dono a campanha.
- **FR-005a**: Cada campanha MUST ter no máximo **um** membro com papel dono. «Atribuir dono» MUST tornar o utilizador indicado o dono e MUST remover o membership do dono anterior (se existir).
- **FR-006**: Validade omissão de convite/reset: **72 horas** (brief); uso único.
- **FR-007**: Sessão: omissão **12 h** de inactividade e **30 dias** de vida máxima (brief); invalidação ao trocar senha.
- **FR-008**: `require_membro` (ou equivalente único) MUST substituir `verify_admin` / Basic Auth em **todas** as rotas admin sob `/api/c/{slug}/…`, incluindo upload.
- **FR-009**: Mestre MUST só administrar campanhas em que existe Membro activo; pedido a outra campanha MUST falhar.
- **FR-010**: MUST existir teste automatizado que enumera **todas** as rotas admin registadas e falha se alguma responder com sucesso a anónimo **ou** a mestre de outra campanha.
- **FR-011**: Limite de tentativas de login MUST ser **5 falhas → bloqueio de 15 minutos**, aplicado **por conta** e **por IP real** do cliente (contadores independentes); durante o bloqueio, mesmo a senha correcta MUST ser recusada. O rate-limit MUST NOT usar o IP do proxy como se fosse o cliente.
- **FR-012**: Basic Auth da app e o portão Basic Auth do Caddy no deploy Campaign Codex do repositório MUST ser removidos como guarda GM.
- **FR-013**: Frontend MUST oferecer `/login`, `/convite/:token` e `/reset/:token` (rotas globais, fora de `/c/:slug`) e MUST deixar de usar o gate de senha GM baseado em Basic Auth / credenciais partilhadas.
- **FR-013a**: Após login bem-sucedido, se existir query `next` com path interno seguro, MUST redirecionar para esse path; caso contrário MUST mostrar página mínima pós-login (sem inventário de campanhas).
- **FR-014**: Copy nova de auth/login/convite/reset/pós-login MUST existir em pt-BR e en; erros de API por códigos mapeáveis.
- **FR-015**: MUST NOT oferecer cadastro aberto, UI de super-admin, nem UI de co-mestre nesta fase.
- **FR-016**: Leituras públicas por slug (094) MUST permanecer acessíveis sem login.

### Out of Scope

- Cadastro aberto de mestres; contas de jogador; SSO/OIDC.
- Tela/painel de super-admin na aplicação.
- UI e fluxos distintos de co-mestre (modelo MAY prever o papel; sem ecrãs).
- Página inicial com lista de campanhas / «minhas campanhas» completa (098) — login e membership bastam aqui.
- ACL fina de uploads por personagem oculto e cota (096).
- Corte das instâncias legadas (099).

### Key Entities

- **Usuario**: identidade de mestre; **email** único = login; hash de senha; activo/desactivo; timestamps.
- **Membro**: ligação Usuario ↔ Campanha com papel; nesta fase **dono** com cardinalidade **1 por campanha** (atribuir substitui); co-mestre reservado sem UI.
- **Convite**: token de uso único, validade, tipo (activar conta / reset), estado consumido.
- **Sessao**: hash do token opaco, utilizador, expiração/inactividade, invalidação.
- **Campanha** (093): alvo do membership; slug na URL (094).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das rotas admin registadas falham para anónimo e para mestre não-membro da campanha do slug (matriz automatizada; 0 excepções).
- **SC-002**: Um mestre convidado completa convite → login → uma escrita admin na sua campanha em menos de 10 minutos (fluxo feliz documentado no quickstart).
- **SC-003**: Após logout ou reset de senha, 100% dos pedidos admin com a sessão antiga são recusados.
- **SC-004**: 100% das tentativas de reutilizar convite/reset já consumido ou expirado são recusadas.
- **SC-005**: Após 5 falhas de login na mesma conta (e, noutro caso, no mesmo IP), o bloqueio de 15 minutos é observável em teste (pedido recusado mesmo com credenciais válidas).
- **SC-006**: A UI de login está disponível em pt-BR e en; o antigo gate Basic Auth GM já não é o caminho de autenticação.
- **SC-007**: Upload de imagem sob slug da campanha membro sucede com sessão e falha sem sessão (sem Basic Auth).

## Assumptions

- Valores de sessão e convite do brief §8: 12 h inactividade / 30 dias máximo; convite e reset 72 h, uso único — adoptados aqui até clarificação futura.
- Super-admin operacional = operador com acesso CLI à instância (Ricardo); não exige UI.
- «Atribuir dono» define o único dono da campanha; o dono anterior deixa de ser membro. Um utilizador pode ser dono de várias campanhas.
- Co-mestre no modelo é opcional para não bloquear 098+; `require_membro` trata qualquer membro activo como autorizado a admin nesta fase.
- Remoção de Basic Auth no Caddy refere-se aos ficheiros/compose do Campaign Codex **neste** repositório; pastas `/opt/codex-*` antigas ficam para 099.
- Biblioteca `pwdlib` (Argon2) é a escolha de implementação pedida; justificação de dependência no plano (constituição IV).
- Cabeçalho de IP real: confiar só na cadeia documentada (ex. Caddy → app), nunca em cabeçalhos arbitrários da internet aberta.
- Entrada de auth nesta fase: deep links globais `/login`, `/convite/:token`, `/reset/:token`; pós-login com `?next=` seguro ou página mínima; mesa continua em `/c/:slug` (094). Home listada = 098.

## Notes

- Documentar CLI e fluxo de login no README; CHANGELOG `[Unreleased]`; bump SemVer só se o plano da fase o exigir.
- Próximas fases: 096 (uploads/cota), 098 (home/painel).
