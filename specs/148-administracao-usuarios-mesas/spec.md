# Feature Specification: Administração de usuários e mesas

**Feature Branch**: `148-administracao-usuarios-mesas`

**Backlog**: [BKLG-035](../../docs/backlog/backlog.md#bklg-035-produto--tela-de-administração-de-usuários-e-mesas)

**Created**: 2026-09-24

**Status**: Draft

**Input**: User description from BKLG-035: "criar uma tela inteira para gerenciamento de usuários, cobrindo deleção de usuário e mesa, reset de senha, criação de convite, status das mesas, data de última modificação de cada mesa, etc."

## Constitution *(constraints; not implementation)*

- **Isolamento**: a área é exclusiva de administradores da aplicação. A visão agregada apresenta somente metadados operacionais de usuários e campanhas, nunca o conteúdo narrativo das campanhas. Uma ação destrutiva deve atingir somente o item explicitamente selecionado e confirmado.
- **Produção legada**: nenhuma mudança nas instâncias legadas é necessária antes do corte da spec 099.
- **Simplicidade**: manter o armazenamento SQLite existente; não adicionar dependências sem justificativa.
- **i18n**: toda copy da área administrativa deve existir em pt-BR e en; conteúdo escrito por mestres não é traduzido.
- **Migrações**: qualquer novo dado persistido para registrar a última modificação de uma campanha deve usar migração versionada e plano de rollback compatível com SQLite.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Administrar contas, convites e redefinições de senha (Priority: P1)

Como administrador da aplicação, quero localizar usuários e administrar seu acesso, emitir convites e iniciar redefinições de senha numa área central, para resolver tarefas de suporte sem depender de comandos no servidor.

**Why this priority**: Reúne operações frequentes sobre contas e reaproveita o fluxo de convites administrativo já existente.

**Independent Test**: Como administrador, localizar contas ativas, pendentes e inativas; criar um convite para um novo e-mail; iniciar redefinição para uma conta ativa; e desativar/reativar uma conta, confirmando os resultados e o acesso correspondente.

**Acceptance Scenarios**:

1. **Given** um administrador autenticado na área de gestão, **When** consulta usuários, **Then** cada conta apresenta e-mail, estado (ativa, pendente ou inativa), indicação de administrador e data de criação, e pode ser encontrada por e-mail.
2. **Given** um e-mail ainda não cadastrado, **When** o administrador cria um convite, **Then** é apresentado um link de ativação de uso único para copiar e compartilhar.
3. **Given** uma conta ativa, **When** o administrador inicia a redefinição de senha, **Then** é apresentado um link de redefinição de uso único e o usuário define a própria senha pelo fluxo existente.
4. **Given** uma conta ativa, **When** o administrador a desativa e confirma, **Then** a conta perde acesso e as sessões existentes deixam de funcionar; **When** reativa a conta, **Then** o acesso pode ser restabelecido por novo login.
5. **Given** um usuário sem campanhas sob sua propriedade, **When** o administrador confirma sua exclusão, **Then** a conta é removida e seus convites e sessões deixam de ser válidos, sem excluir campanhas de outros usuários.
6. **Given** um usuário que ainda é proprietário de uma ou mais campanhas, **When** o administrador tenta excluí-lo, **Then** a área identifica as campanhas e impede a exclusão até que cada uma seja transferida para outro proprietário ativo ou excluída separadamente.

---

### User Story 2 - Consultar e administrar mesas (Priority: P1)

Como administrador da aplicação, quero consultar todas as mesas, seus proprietários, estado e data da última modificação, e poder desativar, reativar ou excluir uma mesa específica.

**Why this priority**: Permite acompanhar a operação das campanhas e resolver problemas de acesso ou de dados de uma mesa específica.

**Independent Test**: Como administrador, localizar uma mesa por nome ou slug, verificar seu proprietário, estado e última alteração; desativá-la e reativá-la; e confirmar exclusão de uma mesa de teste, verificando que as outras permanecem disponíveis.

**Acceptance Scenarios**:

1. **Given** mesas cadastradas, **When** o administrador abre a lista, **Then** cada mesa apresenta nome, slug, sistema, proprietário, estado operacional e data/hora da última modificação; visibilidade pública/por link aparece como informação separada do estado operacional.
2. **Given** muitas mesas cadastradas, **When** o administrador pesquisa por nome, slug ou proprietário e filtra por estado, **Then** a lista contém apenas mesas correspondentes aos critérios.
3. **Given** uma mesa ativa, **When** o administrador a desativa, **Then** novos acessos a essa mesa são bloqueados e seus dados permanecem preservados; **When** a reativa, **Then** ela volta a ficar acessível conforme suas permissões e visibilidade.
4. **Given** uma mesa escolhida para exclusão, **When** o administrador confirma explicitamente a operação identificando a mesa, **Then** essa mesa e seus dados são removidos permanentemente, sem afetar outras mesas.
5. **Given** uma mesa sem alterações após a criação, **When** o administrador consulta sua data de modificação, **Then** a data de criação é apresentada como a última alteração conhecida.

---

### User Story 3 - Acessar a administração com autorização adequada (Priority: P1)

Como administrador, quero que as operações e informações de gestão fiquem protegidas pela minha função, para que outros usuários não possam consultar dados administrativos nem alterar contas ou mesas.

**Why this priority**: A tela concentra ações destrutivas e dados de todas as contas e mesas; a autorização é essencial para todas as outras histórias.

**Independent Test**: Acessar a área e tentar cada operação como administrador, usuário autenticado sem função administrativa e usuário anônimo; apenas o administrador deve conseguir consultar os dados e concluir operações.

**Acceptance Scenarios**:

1. **Given** um administrador autenticado, **When** abre a área de administração, **Then** consegue acessar as listas e operações permitidas.
2. **Given** um usuário autenticado sem função administrativa, **When** tenta acessar a rota ou executar diretamente uma operação administrativa, **Then** o acesso é recusado e os dados não são revelados.
3. **Given** um usuário anônimo, **When** tenta consultar ou alterar dados administrativos, **Then** a consulta/operação é recusada e nenhuma mutação ocorre.
4. **Given** que existe somente um administrador ativo, **When** ele tenta desativar ou excluir a própria conta ou remover a própria função administrativa, **Then** a operação é impedida para evitar deixar a aplicação sem administrador.

### Edge Cases

- E-mail já cadastrado, inválido ou pertencente a conta pendente: o convite não é duplicado e a interface informa o motivo.
- Redefinição solicitada para conta inexistente, pendente ou inativa: nenhuma senha é alterada e a resposta não expõe segredo de autenticação.
- Link de ativação ou redefinição expirado/consumido: segue os estados e mensagens do fluxo existente, sem permitir reutilização.
- Exclusão de usuário com vínculo de membro em campanhas: o acesso desse usuário é removido, mas o conteúdo das campanhas dos demais membros permanece.
- Exclusão ou desativação de proprietário: não pode deixar campanha ativa sem proprietário; a transferência deve ser concluída antes da exclusão.
- Última modificação ainda indisponível para uma campanha legada: a tela indica que a data não está disponível, sem inventar uma data.
- Exclusão de mesa: exige confirmação inequívoca, informa que a ação é permanente e não pode ser desfeita pela tela.
- Falha ao executar uma operação: o estado da lista continua consistente com o resultado efetivamente salvo e apresenta uma mensagem compreensível.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A área administrativa MUST estar disponível somente para usuários autenticados com função de administrador da aplicação.
- **FR-002**: Cada consulta e mutação administrativa MUST ser autorizada no servidor; ocultar links ou proteger somente a interface não é suficiente.
- **FR-003**: A área MUST consolidar gestão de usuários, convites, redefinição de senha e gestão de mesas, incluindo o fluxo de convite administrativo já existente.
- **FR-004**: A lista de usuários MUST apresentar e-mail, estado da conta, indicação de função administrativa, data de criação e campanhas sob sua propriedade; MUST permitir localizar usuário por e-mail e filtrar por estado.
- **FR-005**: O estado da conta MUST distinguir ativa, pendente de ativação e inativa.
- **FR-006**: O administrador MUST poder criar um convite de ativação para um e-mail não cadastrado e copiar o link de uso único; a interface MUST informar e-mail duplicado sem criar outro convite.
- **FR-007**: O administrador MUST poder iniciar redefinição para uma conta ativa por meio de link de uso único; a pessoa titular da conta define sua senha no fluxo existente. A área não deve permitir ao administrador visualizar nem definir a senha do usuário.
- **FR-008**: O administrador MUST poder desativar e reativar contas elegíveis. Desativar impede novos logins, revoga sessões existentes e preserva campanhas e dados da conta.
- **FR-009**: A exclusão definitiva de uma conta MUST invalidar sessões e convites e remover o acesso da pessoa às campanhas; MUST NOT excluir automaticamente conteúdo de campanhas compartilhadas.
- **FR-010**: A exclusão de conta MUST ser bloqueada enquanto essa conta for proprietária de uma campanha; a operação só pode prosseguir após transferir a propriedade a outro usuário ativo ou excluir a campanha separadamente.
- **FR-011**: A aplicação MUST impedir desativar ou excluir a última conta de administrador ativa.
- **FR-012**: A lista de mesas MUST apresentar nome, slug, sistema, proprietário, estado operacional, visibilidade e última data/hora de modificação; MUST permitir pesquisa por nome, slug ou proprietário e filtro por estado.
- **FR-013**: O estado operacional da mesa MUST distinguir ativa e inativa; a visibilidade (listada ou acessível por link) MUST ser apresentada como atributo separado.
- **FR-014**: A data de última modificação MUST representar a alteração mais recente gravada em dados ou configurações da mesa; leitura, visualização de página e login, por si só, MUST NOT atualizar essa data. Para mesa sem alteração posterior à criação, MUST ser exibida a data de criação.
- **FR-015**: Mesa legada sem data de modificação confiável MUST ser identificada como “data indisponível” até que exista uma data válida; a interface MUST NOT inferir uma data incorreta.
- **FR-016**: O administrador MUST poder desativar e reativar uma mesa preservando os dados, com o resultado de acesso claramente indicado.
- **FR-017**: A exclusão de mesa MUST exigir confirmação inequívoca, remover permanentemente apenas a mesa identificada e seus dados associados, e informar claramente que a ação não pode ser desfeita pela interface.
- **FR-018**: A área MUST apresentar estados de carregamento, lista vazia, sucesso e erro sem mostrar operações como concluídas quando não foram salvas.
- **FR-019**: Toda copy nova MUST estar disponível em pt-BR e en.
- **FR-020**: As listas administrativas MUST exibir somente metadados operacionais; a área MUST NOT oferecer leitura do conteúdo narrativo das campanhas.

### Key Entities

- **Conta de usuário**: identidade autenticada com e-mail, situação de ativação, papel administrativo e data de criação; pode participar de mesas.
- **Mesa/campanha**: espaço de jogo com nome, slug, sistema, proprietário, estado operacional, visibilidade e data da última alteração persistida.
- **Vínculo de propriedade/membro**: associação entre uma conta e uma mesa que determina acesso e identifica proprietário; a propriedade precisa ser transferida antes da exclusão de uma conta proprietária.
- **Convite de ativação/redefinição**: autorização de uso único e temporário para ativar conta ou definir nova senha; nunca contém nem revela a senha.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um administrador consegue localizar uma conta, emitir convite, iniciar redefinição e alterar o estado de acesso sem recorrer a comandos no servidor.
- **SC-002**: 100% das tentativas anônimas ou de usuários sem função administrativa para consultar ou alterar dados do console são recusadas.
- **SC-003**: Para toda mesa com data de modificação conhecida, a tela apresenta a última alteração persistida mais recente; alterações de leitura não modificam o valor.
- **SC-004**: Em teste de exclusão, apenas a conta ou mesa confirmada é removida; nenhuma outra conta, mesa ou conteúdo associado a outros proprietários é alterado.
- **SC-005**: A aplicação sempre mantém pelo menos um administrador ativo após qualquer operação disponível no console.

## Assumptions

- O administrador da aplicação já existe conforme o mecanismo da spec 129; esta feature não cria uma forma de promover administradores pela interface, que continua restrita ao procedimento administrativo existente.
- Desativar é a opção reversível para suspender acesso; excluir uma conta é remoção definitiva da identidade, sessões, convites e vínculos de acesso.
- Campanhas não são apagadas junto com a conta de seu proprietário. Antes da exclusão da conta, cada campanha deve ser transferida para outro usuário ativo ou excluída separadamente.
- Excluir uma mesa é permanente e remove seus dados associados; desativar é a alternativa reversível.
- Redefinição e convite continuam sem envio de e-mail automático: a área gera link copiável para o administrador compartilhar pelo canal apropriado.
- “Última modificação” significa a gravação mais recente de conteúdo ou configuração da mesa, não a última visita ou atividade de leitura.
- A interface pode aproveitar os fluxos e regras atuais de convite, ativação e redefinição, mantendo os mesmos prazos e uso único.
