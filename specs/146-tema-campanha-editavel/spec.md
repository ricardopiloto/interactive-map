# Feature Specification: Tema visual da campanha editável

**Feature Branch**: `146-tema-campanha-editavel`  
**Backlog**: [BKLG-034](../../docs/backlog/backlog.md#bklg-034-produto--dono-pode-alterar-o-tema-visual-da-campanha-depois-da-criação)  
**Created**: 2026-09-24  
**Status**: Draft  
**Input**: User description: "Adicione um item no backlog e crie uma spec, para o GM poder alterar o tema de uma campanha."

## Constitution *(constraints; not implementation)*

- Isolamento entre campanhas: somente o dono autenticado pode mudar o tema da campanha indicada; nenhuma alteração pode afetar outra campanha. A superfície de escrita deve integrar a matriz de isolamento.
- Testes primeiro: autorização de dono e isolamento entre campanhas precisam ter testes escritos antes da implementação.
- Produção legada: a mudança não pode exigir alteração manual de instâncias legadas.
- Simplicidade: reutilizar as quatro identidades visuais existentes; sem temas customizados ou dependências novas.
- Interface PT-BR e EN: rótulos, estados de gravação e erros novos devem existir em pt-BR e en. Nomes e conteúdo escritos pelo mestre não devem ser traduzidos.
- Migrações: manter o campo de gênero existente; se a solução exigir mudança de schema, ela deve usar Alembic e justificar-se no plano.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Alterar o tema visual da campanha (Priority: P1)

Como mestre dono de uma campanha, quero escolher um novo tema visual para uma campanha existente, para adequar sua identidade ao cenário da mesa mesmo depois de sua criação.

**Why this priority**: O pedido central é permitir que a identidade visual escolhida na criação possa ser atualizada durante a vida da campanha.

**Independent Test**: Como dono, alterar uma campanha de cada um dos quatro temas disponíveis, salvar e confirmar que a opção permanece selecionada ao reabrir a área de gestão.

**Acceptance Scenarios**:

1. **Given** um dono na gestão de uma campanha existente, **When** abre a configuração de tema, **Then** vê as quatro opções existentes e a opção atualmente salva identificada.
2. **Given** o dono seleciona um tema diferente e salva, **When** a operação termina com sucesso, **Then** a campanha registra e apresenta o novo tema como atual.
3. **Given** a gravação falha, **When** o sistema informa o erro, **Then** o tema previamente salvo permanece vigente e a interface não afirma que a alteração foi concluída.

### User Story 2 - Ver o mesmo tema ao acessar a campanha (Priority: P1)

Como jogador ou mestre participante, quero ver o tema visual atualmente definido para a campanha, para que sua identidade visual seja consistente entre os participantes e nas diferentes visitas.

**Why this priority**: A alteração precisa pertencer à campanha, não apenas ao navegador do mestre que a selecionou.

**Independent Test**: Alterar o tema como dono e abrir a mesma campanha em outra sessão ou navegador; comparar o tema aplicado após carregamento ou recarga.

**Acceptance Scenarios**:

1. **Given** o dono alterou e salvou o tema da campanha, **When** outro membro ou jogador abre ou recarrega a mesma campanha, **Then** vê o tema salvo para aquela campanha.
2. **Given** duas campanhas com temas diferentes, **When** o usuário navega entre elas, **Then** cada campanha mostra seu próprio tema e não herda a configuração da outra.
3. **Given** o tema de uma campanha muda, **When** o dono retorna a uma tela da mesma campanha, **Then** a identidade atualizada está ativa sem depender de uma preferência salva somente no navegador do dono.

### User Story 3 - Manter separadas as preferências pessoais de aparência (Priority: P2)

Como usuário de uma campanha, quero que a troca do tema visual da campanha não apague minha preferência pessoal de aparência, para que os dois ajustes mantenham seus propósitos distintos.

**Why this priority**: O produto já oferece preferência pessoal Automático/Claro/Escuro; a configuração compartilhada da campanha não deve substituí-la.

**Independent Test**: Escolher diferentes gêneros de campanha com preferências pessoais Claro, Escuro e Automático; sair e voltar à campanha e confirmar a preferência nos gêneros que suportam claro e a regra de escuro nos demais.

**Acceptance Scenarios**:

1. **Given** uma campanha no gênero Fantasia, **When** o usuário tem preferência pessoal Claro, Escuro ou Automático, **Then** essa preferência continua sendo aplicada conforme o comportamento atual.
2. **Given** uma campanha no gênero Gótico, Sci-Fi ou Urbano, **When** o usuário tem preferência pessoal Claro, **Then** a regra atual do produto mantém a campanha em modo escuro.
3. **Given** o usuário muda o tema visual da campanha, **When** visita telas fora de campanha ou outra campanha compatível com sua preferência pessoal, **Then** sua preferência pessoal continua preservada.

### Edge Cases

- Tentativa de alteração por usuário anônimo ou membro que não seja dono deve ser recusada, sem modificar o tema salvo.
- Gênero ausente ou inválido não pode substituir o valor atual nem deixar a campanha sem tema; deve ser recusado com erro compreensível.
- Se a campanha já estiver no tema selecionado, salvar novamente não pode produzir estado inconsistente.
- Se houver falha de rede ou persistência, a interface deve distinguir o valor confirmado do valor ainda não salvo.
- Trocar de gênero que força modo escuro para Fantasia deve restaurar a preferência pessoal vigente, sem gravar Escuro por cima dela.
- Alternar entre campanhas não pode reaproveitar cache ou estado visual de gênero da campanha anterior.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O dono MUST poder escolher para uma campanha existente qualquer um dos quatro temas já disponíveis: Fantasia, Gótico, Sci-Fi ou Urbano.
- **FR-002**: A gestão MUST indicar qual tema está atualmente salvo e MUST permitir salvar uma nova escolha ou cancelar a alteração não salva.
- **FR-003**: Uma alteração concluída MUST ser persistida como tema da campanha e permanecer selecionada quando sua configuração for consultada novamente.
- **FR-004**: O tema salvo MUST ser aplicado a todos os membros e jogadores ao acessarem a campanha, inclusive em outro navegador ou sessão; não pode ser apenas uma preferência local do usuário que o alterou.
- **FR-005**: Somente o dono autenticado da campanha MUST poder alterar seu tema. Usuário anônimo e membro sem papel de dono MUST receber recusa e não alterar o valor.
- **FR-006**: A escrita MUST ficar limitada à campanha identificada e MUST preservar o isolamento: atualizar A não altera o tema de B.
- **FR-007**: As regras de identidade visual existentes para cada gênero MUST continuar aplicáveis. Gótico, Sci-Fi e Urbano continuam forçando modo escuro; Fantasia continua respeitando a preferência pessoal vigente.
- **FR-008**: A preferência pessoal Automático/Claro/Escuro MUST permanecer independente da configuração compartilhada da campanha e não pode ser sobrescrita pela gravação do gênero.
- **FR-009**: O sistema de jogo da campanha MUST permanecer inalterado quando o tema for trocado.
- **FR-010**: Erro de validação, autorização, rede ou persistência MUST ser apresentado sem indicar sucesso nem substituir o tema previamente confirmado.
- **FR-011**: Toda copy nova de seleção, confirmação, cancelamento e erro MUST estar disponível em pt-BR e en.

### Key Entities *(include if feature involves data)*

- **Campanha**: Registro existente que contém um tema visual entre os quatro gêneros permitidos. O tema passa a ser editável pelo dono após a criação; os demais atributos da campanha não são alterados por esta funcionalidade.
- **Dono da campanha**: Membro responsável pela gestão da campanha e único papel autorizado a salvar o tema compartilhado.
- **Preferência pessoal de aparência**: Escolha existente de Automático, Claro ou Escuro, pertencente ao usuário; permanece separada do tema compartilhado da campanha.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% das alterações válidas feitas pelo dono, a nova opção é persistida e permanece como tema da campanha após consulta ou recarga.
- **SC-002**: Em 100% dos acessos de outros membros à campanha após a alteração, o tema apresentado corresponde ao último tema salvo pelo dono.
- **SC-003**: Em 100% das tentativas de alteração por anônimo ou membro não dono, a operação é recusada e o tema da campanha permanece inalterado.
- **SC-004**: Alterar o tema de uma campanha nunca modifica o tema de outra campanha ou a preferência pessoal do usuário.
- **SC-005**: As quatro opções permanecem distinguíveis e selecionáveis em pt-BR e en; as regras de Claro/Escuro atuais são preservadas.

## Assumptions

- “Tema da campanha” significa o gênero visual compartilhado já existente — Fantasia, Gótico, Sci-Fi ou Urbano — e não o seletor pessoal Automático/Claro/Escuro.
- A pessoa chamada de GM neste fluxo é o dono da campanha; o modelo atual de produto não oferece gestão de co-mestre pela interface.
- A escolha deve estar disponível na área de gestão da campanha, junto às configurações já editáveis pelo dono.
- Esta spec substitui somente a imutabilidade pós-criação do gênero estabelecida pela spec 111; os quatro gêneros, as paletas, as regras de suporte a modo claro e a imutabilidade do sistema de jogo continuam válidos.
- A campanha continua usando seu último gênero salvo mesmo após logout, mudança de dispositivo ou acesso por outro membro.
