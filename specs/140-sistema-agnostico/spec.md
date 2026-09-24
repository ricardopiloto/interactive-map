# Feature Specification: Sistema de RPG system agnostic (aceitar qualquer nome)

**Feature Branch**: `140-sistema-agnostico`
**Backlog**: [BKLG-029](../../docs/backlog/backlog.md#bklg-029-produto--sistema-de-rpg-deveria-ser-system-agnostic-aceitar-qualquer-nome)
**Created**: 2026-09-24
**Status**: Draft

**Input**: User description: "Quando o usuário entra com um nome de sistema que nós não esperamos, é exibido uma mensagem de 'Sistema desconhecido', nós devemos aceitar qualquer sistema (System Agnostic)."

**Decision source**: causa raiz confirmada no item `BKLG-029` do backlog.

## Constitution *(constraints; not implementation)*

- Isolamento: N/A; mudança de validação sobre um campo de uma campanha já existente, sem cruzar dados entre campanhas.
- Testes primeiro: mudança de regra de validação com efeito direto em fluxo de criação/importação — cobertura automatizada MUST ser mantida (testes já existentes que hoje esperam rejeição de sistema desconhecido precisam ser atualizados pra refletir a nova regra).
- Produção legada: N/A — não mexe no legado, só na criação/importação de campanhas novas.
- Simplicidade: remove uma allowlist restritiva, sem introduzir mecanismo de validação novo além de um limite de tamanho razoável pra string.
- i18n: a mensagem "Sistema desconhecido"/"Unknown system" deixa de ser exibida no fluxo normal (só permanece pra outros tipos de erro, se aplicável); nenhuma copy nova é necessária além de eventual mensagem de validação de tamanho/vazio.
- Migrações: N/A — não muda schema, só a regra de validação de um valor de texto já armazenado como string livre.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Criar campanha com qualquer nome de sistema (Priority: P1)

Como mestre, quero poder criar uma campanha usando o nome do sistema de RPG que eu realmente uso, mesmo que não seja um dos sistemas com suporte especial da aplicação, pra não ser bloqueado por uma lista fechada que a interface já sugere (mas não cumpre) ser aberta.

**Why this priority**: É o pedido central — hoje só dois sistemas passam na validação, apesar do campo do formulário já ser de texto livre com sugestões (dando a entender que qualquer nome é aceito).

**Independent Test**: No formulário de criação de campanha, digitar um nome de sistema que não seja um dos já conhecidos pela aplicação e confirmar que a campanha é criada normalmente, sem a mensagem de "Sistema desconhecido".

**Acceptance Scenarios**:

1. **Given** o formulário de criação de campanha, **When** o mestre digita um nome de sistema qualquer (não vazio, dentro de um tamanho razoável) que não é um dos sistemas com suporte especial, **Then** a campanha é criada normalmente, sem erro de validação de sistema.
2. **Given** um sistema com suporte especial já existente (ex.: com módulos padrão pré-configurados), **When** o mestre cria uma campanha usando exatamente esse nome, **Then** o comportamento especial (módulos padrão) continua sendo aplicado normalmente, sem regressão.
3. **Given** o campo de sistema vazio, **When** o mestre tenta submeter o formulário, **Then** a validação de campo obrigatório já existente continua impedindo a submissão (essa validação não muda).

---

### User Story 2 - Importar pacote de campanha com qualquer sistema (Priority: P2)

Como mestre, quero poder importar um pacote de campanha exportado com qualquer nome de sistema, sem ser bloqueado pela mesma lista fechada usada na criação.

**Why this priority**: Mesma causa raiz da User Story 1, mas no fluxo de importação de pacote — importante pra consistência, mas afeta menos gente no dia a dia que a criação direta.

**Independent Test**: Importar um pacote de campanha cujo manifesto declara um sistema fora da lista hoje conhecida e confirmar que a importação prossegue (falhando só por outros motivos legítimos, não por causa do nome do sistema).

**Acceptance Scenarios**:

1. **Given** um pacote de campanha válido cujo manifesto declara um sistema não reconhecido hoje, **When** o mestre importa esse pacote, **Then** a importação não é bloqueada por causa do nome do sistema.

### Edge Cases

- Nome de sistema com espaços extras nas pontas ou capitalização diferente da sugerida na lista (ex.: "  WFRP4e  "): deve ser aceito normalizando espaços, sem exigir correspondência exata de caixa/maiúsculas pra sistemas sem suporte especial.
- Nome de sistema extremamente longo (tentativa de abuso): deve continuar respeitando um limite razoável de tamanho de campo, mesmo sem a allowlist.
- Nome de sistema idêntico a um dos sistemas com suporte especial, mas com diferença de caixa (ex.: "WOD" vs. "wod"): comportamento de correspondência pro suporte especial fica sujeito à mesma regra de normalização já usada hoje, sem mudar essa parte do comportamento existente.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A criação de campanha MUST aceitar qualquer nome de sistema não vazio dentro do limite de tamanho já existente pro campo, sem checar contra uma lista fechada de sistemas conhecidos.
- **FR-002**: A importação de pacote de campanha MUST aceitar qualquer nome de sistema declarado no manifesto, pela mesma regra usada na criação.
- **FR-003**: Sistemas com comportamento especial hoje configurado (módulos padrão pré-ativados) MUST continuar recebendo esse comportamento especial quando o nome corresponder exatamente a um desses sistemas.
- **FR-004**: Sistemas sem comportamento especial configurado MUST ser criados sem nenhum módulo padrão pré-ativado (comportamento já existente hoje pra sistema desconhecido, preservado).
- **FR-005**: A validação de campo obrigatório (sistema não pode ficar vazio) já existente MUST continuar em vigor — só a allowlist de nomes conhecidos é removida, não a obrigatoriedade do campo.

### Key Entities

- **Campanha.sistema**: campo de texto livre já existente — deixa de ser validado contra uma lista fechada, passando a aceitar qualquer valor não vazio dentro do limite de tamanho já existente.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Cem por cento das tentativas de criar campanha com um nome de sistema não vazio (dentro do limite de tamanho) são bem-sucedidas, independente do nome escolhido.
- **SC-002**: Sistemas com módulos padrão especiais continuam recebendo esses módulos em cem por cento dos casos, sem regressão.
- **SC-003**: A mensagem "Sistema desconhecido"/"Unknown system" deixa de aparecer no fluxo normal de criação/importação de campanha.

## Assumptions

- O limite máximo de tamanho pro nome do sistema segue o mesmo já usado hoje pro campo (nenhum limite novo é inventado nesta spec).
- "Comportamento especial" (módulos padrão) continua restrito aos sistemas já mapeados hoje (ex.: `wfrp4e`) — esta mudança não adiciona suporte especial a nenhum sistema novo, só remove o bloqueio pra sistemas sem suporte especial.
- A normalização de nome (espaços, capitalização) pra fins de correspondência com os sistemas de suporte especial segue a mesma regra já usada hoje nesse ponto do código, sem mudança de comportamento aí.
