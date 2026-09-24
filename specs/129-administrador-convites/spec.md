# Feature Specification: Administrador da aplicação e convites de mestres

**Feature Branch**: `129-administrador-convites`
**Backlog**: [BKLG-006](../../docs/v2/backlog.md#bklg-006-produto--administrador-da-aplicação-e-convites-de-novos-mestres)
**Created**: 2026-09-23
**Status**: Draft

**Input**: User description: "Identificar quem é o administrador da aplicação; só ele pode criar convites pra novos mestres. Todo mestre pode continuar criando campanhas e compartilhando o link delas, sem restrição — isso não muda. Bootstrap do primeiro administrador é só por CLI (decisão confirmada); administrador é único por enquanto, sem impedir tecnicamente mais de um no futuro."

**Decision source**: [TR Administrador e convites](../../docs/v2/tr-admin-convites.md), que recomenda campo `is_admin` em `Usuario`, bootstrap via CLI e reaproveitamento de `create_usuario_with_invite`.

## Constitution *(constraints; not implementation)*

- Isolamento: N/A; `Usuario`/`Convite` vivem no `control.db`, fora do isolamento por campanha. Nenhuma rota nova acessa dados de campanha.
- Testes primeiro: autenticação e permissões MUST ter testes escritos e a falhar antes da implementação — a rota nova de convite entra na mesma matriz de rotas admin que a spec 095 já exige (anónimo e mestre não-administrador MUST ser recusados).
- Produção legada: N/A; não exige mudança nas instâncias `/opt`.
- Simplicidade: reaproveitar `create_usuario_with_invite` existente sem duplicar lógica; sem dependência nova; SQLite/Alembic mantidos.
- i18n: toda copy nova da tela de convites em pt-BR e en.
- Migrações: campo novo em `Usuario` (`is_admin`) MUST entrar por revisão Alembic em `alembic_control`, não por ALTER ad hoc.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Administrador convida um novo mestre pela interface (Priority: P1)

Como administrador autenticado, quero abrir uma tela própria e gerar um link de convite de uso único pra um novo mestre, sem precisar de acesso ao terminal do servidor.

**Why this priority**: É o pedido central — hoje essa ação só existe via CLI; tirar essa dependência do terminal é o valor principal da feature.

**Independent Test**: Autenticado como administrador, abrir a tela de convites, informar um e-mail livre, gerar o link, e confirmar que o convite aparece como pendente e o link funciona no fluxo de aceitar-convite já existente.

**Acceptance Scenarios**:

1. **Given** um administrador autenticado, **When** ele informa um e-mail ainda não cadastrado e confirma, **Then** um usuário pendente e um convite de ativação de uso único são criados, e o link aparece na tela pra copiar.
2. **Given** um administrador autenticado, **When** ele informa um e-mail já cadastrado, **Then** a tela mostra o mesmo erro de e-mail duplicado que a CLI já retorna hoje, sem criar nada.
3. **Given** um link de convite gerado pela tela, **When** o convidado abre o link e define a senha, **Then** o fluxo de ativação funciona de forma idêntica a um convite gerado por CLI.

---

### User Story 2 - Operador do servidor promove o primeiro administrador via CLI (Priority: P1)

Como operador com acesso ao servidor, quero promover um usuário existente a administrador por um comando de CLI, pra que exista pelo menos um administrador antes de qualquer convite ser emitido pela interface.

**Why this priority**: Bloqueia a User Story 1 inteira — sem um administrador definido, a tela nova não tem quem a use. Decisão confirmada de manter esse bootstrap fora da UI, como via de recuperação permanente.

**Independent Test**: Rodar o comando de CLI apontando pra um e-mail de usuário já ativo, e confirmar que esse usuário passa a acessar a tela de convites; rodar o comando inverso (rebaixar) e confirmar que o acesso é revogado.

**Acceptance Scenarios**:

1. **Given** um usuário ativo existente, **When** o operador roda o comando de promoção por e-mail, **Then** esse usuário passa a ter `is_admin = true` e consegue acessar a tela de convites na próxima sessão.
2. **Given** um usuário que já é administrador, **When** o operador roda o comando de rebaixamento, **Then** esse usuário perde `is_admin` e a tela/endpoint de convites passa a recusá-lo.
3. **Given** nenhum administrador definido ainda, **When** o operador roda o comando de promoção pela primeira vez, **Then** não é exigido nenhum passo adicional de configuração além do comando em si.

---

### User Story 3 - Mestre comum não acessa a gestão de convites (Priority: P1)

Como mestre autenticado sem o papel de administrador, não devo ver nem conseguir acionar a tela ou o endpoint de convites, mas devo continuar criando e compartilhando minhas próprias campanhas normalmente.

**Why this priority**: É a contraparte de segurança da User Story 1 — sem essa garantia, a feature vaza uma capacidade de criação de contas pra qualquer mestre.

**Independent Test**: Autenticado como mestre sem `is_admin`, confirmar que a navegação não mostra a tela de convites, que uma chamada direta ao endpoint retorna acesso negado, e que a criação de campanha desse mesmo mestre continua funcionando sem nenhuma restrição nova.

**Acceptance Scenarios**:

1. **Given** um mestre autenticado sem papel de administrador, **When** ele navega pela aplicação, **Then** nenhuma entrada de menu ou link leva à tela de convites.
2. **Given** um mestre autenticado sem papel de administrador, **When** ele chama o endpoint de criação de convite diretamente, **Then** o pedido é recusado (não `2xx`), do mesmo jeito que qualquer outra rota administrativa hoje recusa quem não tem permissão.
3. **Given** o mesmo mestre, **When** ele cria uma nova campanha e compartilha o link dela, **Then** o fluxo funciona exatamente como funciona hoje, sem nenhuma checagem de papel de administrador envolvida.

### Edge Cases

- O único administrador é desativado ou perde a senha: o operador do servidor promove outro usuário (ou reativa o mesmo) via CLI, sem depender da UI pra se recuperar.
- Dois administradores tentam convidar o mesmo e-mail ao mesmo tempo: a segunda tentativa recebe o erro de e-mail duplicado já existente, sem corrida de dados.
- Um administrador tenta se autopromover a partir da UI: não existe essa ação na interface; promoção só existe via CLI.
- Convite gerado pela tela expira sem ser aceito: segue exatamente a mesma regra de validade que o convite gerado por CLI hoje.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `Usuario` MUST ganhar um atributo de papel de administrador (`is_admin`), por migração Alembic em `control.db`, com valor padrão falso para usuários existentes.
- **FR-002**: A CLI MUST ganhar um comando para promover um usuário existente (por e-mail) a administrador, e um comando inverso para rebaixá-lo.
- **FR-003**: Um novo endpoint autenticado MUST permitir criar um convite de ativação para um e-mail, reaproveitando a mesma lógica de criação de usuário-pendente-mais-convite já usada pela CLI, sem duplicá-la.
- **FR-004**: O endpoint de criação de convite MUST exigir sessão válida e `is_admin = true`; qualquer outro caso (anónimo ou mestre sem o papel) MUST ser recusado.
- **FR-005**: MUST existir uma tela, visível apenas para administradores, com um formulário de e-mail e a exibição do link de convite gerado.
- **FR-006**: A tela de convites MUST NOT aparecer na navegação para mestres sem `is_admin`.
- **FR-007**: A criação e o compartilhamento de campanhas por qualquer mestre MUST continuar funcionando sem nenhuma checagem de papel de administrador — esta feature não introduz restrição nova nesse fluxo.
- **FR-008**: A rota nova de convite MUST entrar na mesma matriz de teste de rotas administrativas já exigida pela spec 095 (anónimo e usuário sem permissão MUST falhar, não responder `2xx`).
- **FR-009**: Toda copy nova da tela de convites MUST existir em pt-BR e en.
- **FR-010**: O sistema MUST permitir tecnicamente mais de um administrador (o atributo é um booleano por usuário, sem restrição de unicidade no banco); a regra de "um administrador por enquanto" é uma decisão de produto/processo, não uma trava de schema.

### Key Entities

- **Usuario**: ganha o atributo de papel de administrador, além dos campos já existentes (e-mail, senha, estado ativo).
- **Convite**: sem mudança de forma; passa a poder ser criado também por um administrador autenticado pela UI, além da CLI.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um administrador consegue gerar um link de convite funcional pela interface, sem usar o terminal, do início ao fim.
- **SC-002**: Cem por cento das tentativas de acesso à tela ou ao endpoint de convites por um usuário sem o papel de administrador são recusadas, cobertas pela matriz de testes de rotas administrativas.
- **SC-003**: Um convite criado pela interface é aceito pelo convidado através do mesmo fluxo já existente, sem diferença perceptível em relação a um convite criado por CLI.
- **SC-004**: O primeiro administrador de uma instância nova consegue ser definido só com acesso ao servidor, sem depender de nenhuma ação prévia na interface.
- **SC-005**: A criação e o compartilhamento de campanhas por mestres sem o papel de administrador não apresentam nenhuma regressão mensurável em relação ao comportamento anterior a esta feature.

## Assumptions

- Bootstrap do primeiro administrador é exclusivamente por CLI — decisão já confirmada; não há fluxo de auto-cadastro nem de primeiro-usuário-vira-admin automaticamente.
- Administrador é tratado como único por enquanto, por decisão de produto — sem impedir, no schema, que mais de um exista futuramente.
- Não há infraestrutura de e-mail nesta aplicação; o administrador copia e envia o link de convite manualmente, do mesmo jeito que a CLI já exige hoje.
- O endpoint novo reaproveita `create_usuario_with_invite` sem alterar seu contrato ou o formato do convite/link resultante.
- Listagem, reenvio ou revogação de convites pendentes ficam fora do escopo desta feature — o pedido original cobre só a criação; esses recursos ficam como possível evolução futura.
