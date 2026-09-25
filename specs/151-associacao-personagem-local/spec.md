# Feature Specification: Associar personagens a Locais

**Feature Branch**: `151-associacao-personagem-local`

**Backlog**: [BKLG-037](../../docs/backlog/backlog.md)

**Created**: 2026-09-25

**Status**: Draft

**Input**: User description: "BKLG-037: permitir associar qualquer personagem da campanha — PJ ou NPC — a um ou mais Locais."

## Constitution *(constraints; not implementation)*

- Associações MUST permanecer isoladas na campanha correspondente e seguir suas permissões de visibilidade.
- Alterações MUST ser feitas somente por pessoas com permissão de edição da campanha.
- A produção legada deve continuar funcionando sem alterações até a spec de corte.
- Toda copy nova deve existir em pt-BR e en; nomes e descrições escritos pelo mestre não são traduzidos.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Associar PJs e NPCs a Locais (Priority: P1)

Como mestre, quero associar personagens jogadores e não jogadores aos Locais relevantes, para registrar quem está ligado a cada lugar.

**Why this priority**: A associação atual não contempla todos os tipos de personagem e impede representar a presença de PJs.

**Independent Test**: Em uma campanha de teste, associar um PJ e um NPC a Locais, salvar, reabrir os detalhes e confirmar as associações e os tipos apresentados.

**Acceptance Scenarios**:

1. **Given** um Local e personagens da mesma campanha, **When** o mestre associa um PJ e um NPC, **Then** ambos aparecem vinculados ao Local com seus tipos identificáveis.
2. **Given** personagens associados a um Local, **When** o mestre remove uma associação e salva, **Then** somente aquela associação deixa de existir.
3. **Given** um personagem já associado a um Local, **When** ele é associado a outro Local, **Then** a associação anterior permanece.
4. **Given** uma alteração salva, **When** o mestre reabre o Local, **Then** a lista de personagens reflete as associações persistidas.

### User Story 2 - Consultar associações respeitando acesso (Priority: P1)

Como membro da campanha, quero ver personagens associados a Locais que posso consultar, para entender quem está ligado a cada lugar.

**Why this priority**: As associações só têm valor se forem apresentadas de forma consistente e respeitarem a visibilidade existente.

**Independent Test**: Consultar Locais e personagens visíveis e ocultos como mestre e jogador; verificar que cada pessoa vê somente informações às quais tem acesso.

**Acceptance Scenarios**:

1. **Given** uma associação visível entre personagem e Local, **When** um membro autorizado consulta o Local, **Then** o personagem aparece com seu tipo.
2. **Given** um personagem ou Local oculto para jogadores, **When** um jogador consulta as associações, **Then** informações ocultas não são reveladas.
3. **Given** uma pessoa sem permissão de edição, **When** tenta alterar associações, **Then** a alteração não é permitida.

### Edge Cases

- Um Local pode não ter personagens associados; a tela deve continuar utilizável.
- Um personagem pode estar associado a vários Locais, e um Local pode ter vários personagens.
- Personagens de outra campanha não podem ser selecionados nem associados.
- Excluir ou tornar indisponível uma entidade associada não pode deixar referências visíveis inválidas.
- Mudanças de associação não devem alterar dados próprios do personagem ou do Local.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Mestres com permissão de edição MUST poder associar qualquer PJ ou NPC da campanha a um ou mais Locais da mesma campanha.
- **FR-002**: Mestres MUST poder remover uma associação sem remover o personagem ou o Local.
- **FR-003**: Um personagem MUST poder estar associado a múltiplos Locais, e cada Local MUST poder ter múltiplos personagens.
- **FR-004**: As associações MUST persistir após fechar e reabrir a tela ou recarregar a campanha.
- **FR-005**: As interfaces que apresentam associações MUST identificar se cada personagem é PJ ou NPC.
- **FR-006**: A consulta e apresentação das associações MUST respeitar as permissões e regras de visibilidade de personagens e Locais já existentes.
- **FR-007**: Pessoas sem permissão de edição MUST NOT criar, alterar ou remover associações.
- **FR-008**: O sistema MUST impedir associações entre entidades de campanhas diferentes.
- **FR-009**: Falhas ao salvar MUST ser comunicadas e MUST NOT apresentar a alteração como persistida.
- **FR-010**: Toda copy nova MUST estar disponível em pt-BR e en.
- **FR-011**: Rotas ou superfícies de dados novas ou alteradas MUST integrar a matriz de testes de isolamento entre campanhas.

## Key Entities

- **Personagem**: PJ ou NPC pertencente a uma campanha, com identidade de tipo preservada nas interfaces.
- **Local**: lugar pertencente a uma campanha, que pode ter associações com vários personagens.
- **Associação Personagem-Local**: vínculo independente que conecta entidades da mesma campanha sem substituir seus dados próprios.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos casos de associação permitem vincular tanto PJs quanto NPCs a Locais da própria campanha.
- **SC-002**: 100% das associações criadas continuam corretas após recarregar a campanha.
- **SC-003**: Em todos os pontos de consulta verificados, o tipo PJ/NPC é identificável.
- **SC-004**: 100% dos testes de permissão impedem alteração por pessoas sem acesso de edição.
- **SC-005**: 100% dos casos de tentativa de associação entre campanhas são rejeitados sem revelar dados da outra campanha.

## Assumptions

- A associação é compartilhada pela campanha, não um estado privado de cada jogador.
- Mestres com permissão de editar Locais poderão administrar associações; jogadores terão somente consulta conforme as regras de visibilidade vigentes.
- Um personagem pode estar relacionado a qualquer quantidade de Locais, sem limite funcional definido nesta versão.
- A feature amplia o vínculo existente para incluir PJs e não altera como os vínculos entre personagens são representados.
