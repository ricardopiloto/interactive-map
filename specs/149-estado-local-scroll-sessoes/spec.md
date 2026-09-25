# Feature Specification: Estado de locais e rolagem de sessões

**Feature Branch**: `149-estado-local-scroll-sessoes`

**Bugs**: [BUG-002](../../docs/bugs/bugs.md#bug-002-não-é-possível-alternar-estado-de-localidade-entre-conhecido-e-visitado), [BUG-003](../../docs/bugs/bugs.md#bug-003-lista-de-sessões-sem-rolagem-no-desktop)

**Created**: 2026-09-24

**Status**: Draft

**Input**: User description: "BUG-002: permitir alterar um local entre Conhecido e Visitado nos dois sentidos. BUG-003: permitir percorrer com rolagem a lista completa de sessões no desktop, como já ocorre no mobile."

## Constitution *(constraints; not implementation)*

- Isolation: o estado de cada local permanece restrito à campanha correspondente; esta feature não deve expor dados entre campanhas.
- Legacy production MUST keep running unchanged until the cutover spec.
- UI strings are PT-BR and EN; text written by the GM is not translated.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Alterar o estado de um local (Priority: P1)

Como pessoa com permissão para editar o mapa, quero mudar um local entre **Conhecido** e **Visitado**, para manter a indicação de exploração da campanha correta.

**Why this priority**: O estado atual não pode ser alterado de forma confiável, então os jogadores e o mestre não conseguem manter ou consultar a situação correta dos locais.

**Independent Test**: Abrir a edição de um local, mudar seu estado em cada direção, salvar e confirmar que a indicação continua correta depois de fechar e reabrir o local.

**Acceptance Scenarios**:

1. **Given** um local Conhecido, **When** uma pessoa autorizada o altera para Visitado e salva, **Then** o estado apresentado passa a ser Visitado.
2. **Given** um local Visitado, **When** uma pessoa autorizada o altera para Conhecido e salva, **Then** o estado apresentado passa a ser Conhecido.
3. **Given** um local cujo estado foi salvo, **When** o usuário recarrega a tela ou consulta o local em outra área que mostra esse estado, **Then** a indicação permanece igual ao valor salvo.
4. **Given** uma alteração de estado que falha ao salvar, **When** a operação termina, **Then** a interface informa a falha e não apresenta o novo estado como persistido.

### User Story 2 - Percorrer a lista completa de sessões no desktop (Priority: P1)

Como usuário da campanha, quero percorrer todas as sessões com rolagem no desktop, para consultar sessões que ficam além da área visível da tela.

**Why this priority**: Sem acesso às sessões que ficam abaixo da área visível, parte do histórico da campanha fica inacessível no desktop.

**Independent Test**: Abrir uma campanha com sessões suficientes para ultrapassar a altura visível do navegador no desktop, percorrer a lista e confirmar que a última sessão pode ser alcançada e lida.

**Acceptance Scenarios**:

1. **Given** uma lista de sessões mais alta que a área visível no desktop, **When** o usuário percorre a página/lista verticalmente, **Then** consegue visualizar integralmente a primeira e a última sessão.
2. **Given** uma lista de sessões mais alta que a área visível no mobile, **When** o usuário percorre a página/lista, **Then** todas as sessões continuam acessíveis como já ocorre nesse ambiente.
3. **Given** uma lista que cabe na área visível, **When** o usuário abre a tela, **Then** o conteúdo permanece acessível sem que controles ou sessões sejam cortados.

### Edge Cases

- Alterar o estado de um local não deve limpar nem reescrever o rótulo textual de sessão associado ao local.
- Após recarregar a tela, o estado do local deve continuar associado ao local e à campanha corretos.
- Uma lista vazia ou curta de sessões não deve impedir o uso normal da tela.
- Com muitas sessões, a pessoa deve conseguir alcançar o fim da lista por interação de rolagem disponível no desktop e no mobile.
- Se a tela for redimensionada enquanto estiver aberta, o restante da lista deve continuar acessível.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Pessoas com permissão de edição MUST poder selecionar **Conhecido** ou **Visitado** para um local.
- **FR-002**: O estado MUST poder ser alterado de Conhecido para Visitado e de Visitado para Conhecido.
- **FR-003**: A alteração de estado MUST ser salva e continuar correta após fechar e reabrir a edição ou recarregar a tela.
- **FR-004**: As representações do estado do local exibidas na campanha MUST refletir o mesmo valor persistido.
- **FR-005**: Alterar o estado MUST NOT modificar o nome, a descrição nem o rótulo de sessão do local.
- **FR-006**: Se o salvamento falhar, a interface MUST informar que a alteração não foi concluída e MUST NOT indicar sucesso persistido.
- **FR-007**: A lista de sessões MUST permitir que o usuário alcance e leia todas as sessões quando seu conteúdo exceder a área visível no desktop.
- **FR-008**: Todas as sessões MUST continuar acessíveis por rolagem em telas mobile e desktop, incluindo após redimensionar a janela.
- **FR-009**: Conteúdo da lista de sessões MUST NOT ficar permanentemente cortado por limites da área visível; quando a lista couber na tela, seu conteúdo deve continuar acessível sem interação extra.
- **FR-010**: O estado de um local MUST permanecer isolado dentro da campanha a que pertence; esta funcionalidade MUST NOT revelar nem alterar estado de locais de outra campanha.
- **FR-011**: Toda copy nova da interface MUST estar disponível em pt-BR e en.

### Key Entities

- **Local**: local de uma campanha, com estado de exploração Conhecido ou Visitado, além de informações como nome, descrição e eventual rótulo de sessão.
- **Sessão**: registro do histórico da campanha apresentado como uma entrada na lista; a posição da entrada na página não pode impedir seu acesso.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos cenários de aceitação de mudança de estado permitem salvar a transição solicitada, nos dois sentidos.
- **SC-002**: Em 100% dos cenários testados após recarregar a tela, cada local continua exibindo o estado que foi salvo.
- **SC-003**: Em campanhas cuja lista ultrapassa a área visível, usuários desktop e mobile conseguem alcançar e ler 100% das sessões, inclusive a última.
- **SC-004**: Nenhuma sessão da lista fica inacessível por corte de conteúdo em qualquer dos tamanhos de tela verificados.
- **SC-005**: Alterações e consultas ao estado de locais de uma campanha não modificam nem revelam os locais de outra campanha.

## Assumptions

- **Conhecido/Visitado** é um estado compartilhado do local na campanha, editável por quem já tem permissão para alterar esse local; não é um progresso individual por jogador.
- O rótulo de sessão é informação textual própria do local e permanece independente do estado Conhecido/Visitado.
- “Lista de sessões” refere-se à lista principal de registros na tela Sessões, não aos seletores de locais ou personagens dentro do formulário de edição de uma sessão.
- Não há solicitação de mudança na ordem, no conteúdo ou nas permissões de visibilidade das sessões; o objetivo é tornar todas as entradas existentes acessíveis por rolagem.
- O ajuste deve preservar o comportamento de rolagem que já funciona no mobile.
