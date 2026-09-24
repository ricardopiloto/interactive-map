# Feature Specification: Posição e formato do marcador do grupo

**Feature Branch**: `124-marcador-grupo-mapa`  
**Backlog**: [BKLG-002](../../docs/v2/backlog.md#bklg-002-gap--mover-o-marcador-do-grupo-e-trocar-formato-bandeirabrasao-nao-existe-no-frontend-next)  
**Created**: 2026-09-23  
**Status**: Draft

**Input**: User description: "Representar no protótipo as ações de mestre para mover o marcador do grupo no Mapa e alternar sua forma entre bandeira e brasão, completando no produto os estados de cancelamento, erro e autorização exclusiva do mestre."

**Depends on**: [123-gestao-arcos](../123-gestao-arcos/spec.md) para o ponto de entrada/menu compartilhado de gestão do mestre no Mapa.

## Constitution *(constraints; not implementation)*

- Isolamento: posição e formato pertencem apenas à campanha atual; novas rotas, se necessárias, entram na matriz de isolamento.
- Testes primeiro: testes de autorização, isolamento e persistência devem falhar antes da implementação.
- Produção legada: não exigir mudanças nas instâncias `/opt` antes do corte.
- Simplicidade: reutilizar o contrato existente de atualização do grupo; nenhuma dependência nova sem justificativa.
- i18n: copy nova em pt-BR e en; nomes e conteúdo da campanha não são traduzidos.
- Migrações: N/A se o contrato existente cobrir posição e formato; qualquer mudança de schema usa Alembic e rollback documentado.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reposicionar o grupo (Priority: P1)

Como mestre, quero escolher a ação de mover o grupo e marcar sua nova posição no Mapa, para manter o mapa alinhado com o avanço da campanha.

**Why this priority**: A posição do grupo é a referência visual dos jogadores sobre onde a companhia está; o fluxo de mover já existe no produto, mas não pode ser cancelado claramente nem trata falha de persistência com segurança.

**Independent Test**: Como mestre, ativar o posicionamento, escolher um ponto válido e recarregar a campanha; como jogador, conferir a nova posição.

**Acceptance Scenarios**:

1. **Given** o Mapa aberto como mestre, **When** escolhe "Mover grupo", **Then** a interface indica que o próximo ponto do Mapa definirá a nova posição.
2. **Given** o modo de posicionamento ativo, **When** o mestre clica em um ponto válido, **Then** o marcador é reposicionado e a posição persiste após recarregar.
3. **Given** o posicionamento ativo, **When** o mestre cancela ou sai do modo sem escolher ponto, **Then** a posição anterior permanece intacta.

### User Story 2 - Escolher a forma do marcador (Priority: P1)

Como mestre, quero alternar o marcador entre bandeira e brasão, para representar visualmente a companhia de forma adequada ao mapa.

**Why this priority**: A escolha de forma já existe no produto, mas está ausente do protótipo e precisa permanecer exclusiva ao mestre.

**Independent Test**: Alternar as duas formas e conferir que mestre e jogador veem a forma escolhida após atualizar o Mapa.

**Acceptance Scenarios**:

1. **Given** uma campanha com marcador em bandeira, **When** o mestre escolhe brasão, **Then** o Mapa apresenta o brasão.
2. **Given** uma campanha com marcador em brasão, **When** o mestre escolhe bandeira, **Then** o Mapa apresenta a bandeira.
3. **Given** um jogador sem permissão de edição, **When** abre o Mapa, **Then** vê a forma atual mas não controles para alterá-la.

### User Story 3 - Usar controles no contexto do Mapa (Priority: P2)

Como mestre, quero encontrar as duas ações no menu de gestão do Mapa, para mover e personalizar o grupo sem sair da campanha.

**Why this priority**: O protótipo hoje só exibe e recentraliza o marcador; falta representar as operações que o produto já oferece.

**Independent Test**: Abrir o menu compartilhado de gestão do mestre e verificar as ações de posição e forma, além do estado visual ativo.

**Acceptance Scenarios**:

1. **Given** um mestre no Mapa, **When** abre as ações de gestão, **Then** encontra mover grupo e escolher forma do marcador.
2. **Given** a ação de mover ativa, **When** o mestre usa o controle de recentralização, **Then** não muda a posição persistida do grupo.
3. **Given** um membro da campanha sem papel de mestre/dono, **When** tenta alterar posição ou formato, **Then** a operação é negada e o marcador não muda.

### Edge Cases

- Clique fora dos limites úteis do Mapa não grava uma posição inválida.
- Falha ao persistir mantém o marcador na posição anterior e informa que a ação não foi concluída.
- Alternar forma enquanto uma operação de mover está ativa não muda a posição nem encerra silenciosamente a operação.
- Repetir a escolha da forma atual não causa erro nem altera dados sem necessidade.
- Campanha sem posição definida apresenta a localização padrão atual e permite ao mestre posicionar o grupo.
- Um identificador de outra campanha não pode ser usado para mover seu marcador ou alterar sua forma.
- Um membro autorizado a consultar a campanha, mas sem papel de dono, não pode gravar a posição ou formato do grupo.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O mestre autorizado MUST poder iniciar, concluir e cancelar o reposicionamento do marcador do grupo no Mapa.
- **FR-002**: A conclusão MUST persistir a posição selecionada e atualizar a visualização do mestre e dos jogadores.
- **FR-003**: A interface MUST distinguir claramente o modo de posicionamento ativo, sua ação de conclusão e o cancelamento.
- **FR-004**: O mestre MUST poder selecionar as formas bandeira e brasão; a forma selecionada MUST persistir e ser visível a todos os participantes autorizados.
- **FR-005**: Jogadores MUST poder visualizar o marcador e não podem acessar controles de alteração.
- **FR-006**: As ações MUST estar disponíveis no menu compartilhado de gestão do mestre previsto em [spec 123](../123-gestao-arcos/spec.md), derivada de BKLG-001.
- **FR-007**: A UI MUST expor erros de salvamento sem apresentar posição ou forma não persistidas como se fossem definitivas.
- **FR-008**: Toda copy nova MUST existir em pt-BR e en.
- **FR-009**: O protótipo MUST representar os mesmos estados e controles para orientar a experiência do produto.
- **FR-010**: A API MUST autorizar alterações de posição e formato somente ao dono/mestre da campanha; ser membro autenticado não é suficiente.

### Key Entities

- **Grupo da campanha**: Marcador compartilhado que possui posição no Mapa e uma forma visual escolhida.
- **Campanha**: Proprietária do estado do grupo e fronteira de autorização.
- **Ponto do Mapa**: Posição selecionada pelo mestre para representar o grupo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O mestre consegue mover o marcador e cancelar uma tentativa sem alterar indevidamente a posição.
- **SC-002**: Ambas as formas podem ser escolhidas e permanecem iguais após recarregar o Mapa.
- **SC-003**: Jogadores veem mudanças persistidas, mas não têm controles de escrita.
- **SC-004**: Testes confirmam zero alterações a campanhas diferentes da atual.
- **SC-005**: 100% da copy nova está disponível em pt-BR e en.
- **SC-006**: Tentativas de escrita por pessoa anónima, não-membro e membro sem papel de dono são negadas; só o dono consegue persistir posição e formato.

## Assumptions

- O sistema já mantém posição e formato do grupo no contrato de campanha e o produto já oferece as duas ações; o protótipo e os estados de robustez/autorização ainda precisam ser completados.
- Mover e alterar formato são ações exclusivas do mestre autenticado.
- O menu do mestre introduzido/desenhado em BKLG-001 é compartilhado; BKLG-002 adiciona ações sem redesenhar ou duplicar esse menu.
