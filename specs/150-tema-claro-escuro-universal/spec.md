# Feature Specification: Tema claro e escuro em todos os gêneros

**Feature Branch**: `150-tema-claro-escuro-universal`

**Backlog**: [BKLG-036](../../docs/backlog/backlog.md)

**Created**: 2026-09-25

**Status**: Draft

**Input**: User description: "BKLG-036: permitir alternar entre tema claro e escuro em todos os gêneros de campanha, mantendo a preferência individual e definindo o comportamento de Automático."

## Constitution *(constraints; not implementation)*

- A preferência de tema é individual e não pode alterar a experiência dos demais membros da campanha.
- O gênero da campanha continua definindo sua identidade visual; esta feature não cria gêneros ou paletas.
- A produção legada deve continuar funcionando sem alterações até a spec de corte.
- Toda copy nova deve existir em pt-BR e en.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Escolher claro ou escuro em qualquer campanha (Priority: P1)

Como membro de uma campanha, quero escolher o modo claro ou escuro em qualquer gênero visual, para ler o conteúdo no modo que prefiro.

**Why this priority**: Gêneros diferentes de Fantasia hoje restringem a leitura ao modo escuro.

**Independent Test**: Em campanhas de cada gênero existente, alternar entre Claro e Escuro e confirmar que a escolha afeta somente a conta atual e preserva a identidade visual do gênero.

**Acceptance Scenarios**:

1. **Given** uma campanha de qualquer gênero, **When** a pessoa escolhe Claro, **Then** a campanha é apresentada no modo claro com a paleta daquele gênero.
2. **Given** uma campanha de qualquer gênero, **When** a pessoa escolhe Escuro, **Then** a campanha é apresentada no modo escuro com a paleta daquele gênero.
3. **Given** dois membros com preferências diferentes, **When** ambos acessam a mesma campanha, **Then** cada um vê o modo escolhido em sua própria conta.
4. **Given** uma preferência salva, **When** a pessoa encerra e inicia outra sessão, **Then** a escolha continua aplicada.

### User Story 2 - Usar o modo automático (Priority: P2)

Como membro, quero que Automático acompanhe a preferência de aparência do meu dispositivo, para não precisar alternar manualmente.

**Why this priority**: Automático já é uma opção do seletor e deve continuar coerente quando todos os gêneros aceitam claro e escuro.

**Independent Test**: Selecionar Automático e alterar a preferência de aparência do dispositivo; confirmar que a interface acompanha a preferência em todos os gêneros.

**Acceptance Scenarios**:

1. **Given** Automático selecionado, **When** o dispositivo está configurado para claro, **Then** a interface usa modo claro.
2. **Given** Automático selecionado, **When** o dispositivo está configurado para escuro, **Then** a interface usa modo escuro.
3. **Given** uma mudança na aparência do dispositivo durante o uso, **When** Automático está selecionado, **Then** a interface acompanha a nova preferência sem alterar a preferência de outros membros.

### Edge Cases

- Preferências salvas anteriormente como Automático, Claro ou Escuro continuam válidas.
- Uma campanha sem gênero reconhecido segue o comportamento padrão existente sem impedir a escolha do modo.
- A mudança de modo não deve trocar gênero, paleta, conteúdo ou dados da campanha.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O seletor MUST oferecer Automático, Claro e Escuro para todos os gêneros de campanha existentes.
- **FR-002**: Claro e Escuro MUST poder ser selecionados em Fantasia, Gótico, Sci-Fi e Urbano.
- **FR-003**: Automático MUST escolher o modo correspondente à preferência de aparência do dispositivo.
- **FR-004**: A preferência MUST ser isolada no contexto local de cada usuário e MUST NOT alterar a apresentação dos demais membros que acessam a campanha em outros contextos.
- **FR-005**: A preferência escolhida MUST permanecer aplicada após recarregar a página e iniciar nova sessão.
- **FR-006**: O gênero MUST continuar determinando a paleta visual independentemente do modo claro ou escuro selecionado.
- **FR-007**: A alteração MUST NOT modificar gênero, sistema de jogo ou dados da campanha.
- **FR-008**: A preferência já salva dos usuários MUST continuar sendo interpretada sem perda ou redefinição involuntária.
- **FR-009**: Toda copy nova ou alterada MUST estar disponível em pt-BR e en.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos quatro gêneros existentes, uma pessoa consegue selecionar e visualizar Claro e Escuro.
- **SC-002**: Em 100% dos cenários verificados, Automático corresponde à preferência atual do dispositivo.
- **SC-003**: Em testes com dois contextos de usuário separados na mesma campanha, alterar a preferência em um não muda o modo visto no outro.
- **SC-004**: Em 100% dos cenários de retorno à aplicação, a preferência salva continua aplicada.
- **SC-005**: As quatro identidades visuais permanecem distinguíveis nos modos claro e escuro.

## Assumptions

- Automático significa seguir a preferência de aparência do sistema operacional/dispositivo, sem agendamento por horário.
- A preferência permanece salva localmente no perfil do navegador, conforme o comportamento atual; sincronização da preferência entre dispositivos ou por conta não faz parte desta feature.
- Cada gênero terá variantes clara e escura usando sua identidade cromática atual; criação de paletas novas está fora de escopo.
- Preferências existentes não precisam de migração destrutiva; valores válidos permanecem válidos.
