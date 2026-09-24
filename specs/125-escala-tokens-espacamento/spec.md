# Feature Specification: Escala consistente de espaçamento

**Feature Branch**: `125-escala-tokens-espacamento`  
**Backlog**: [BKLG-003](../../docs/v2/backlog.md#bklg-003-debito-tecnico--escala-de-espaco-fora-de-ordem-em-tokenscss)  
**Created**: 2026-09-23  
**Status**: Draft

**Input**: User description: "Corrigir a escala de espaçamento visual para que os níveis sejam sequenciais e coerentes com a escala aprovada no protótipo, auditando os usos existentes para evitar regressões de layout."

## Constitution *(constraints; not implementation)*

- Isolamento: N/A; não há dados ou rotas de campanha envolvidos.
- Testes primeiro: validar usos e capturas das áreas afetadas antes de atualizar a escala visual.
- Produção legada: não exigir mudanças nas instâncias `/opt`.
- Simplicidade: usar a escala de design já adotada, sem dependência ou novo sistema de tokens.
- i18n: N/A; não há copy nova.
- Migrações: N/A; sem alterações de schema.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manter espaçamento visual previsível (Priority: P1)

Como pessoa usuária, quero que os espaços entre elementos sigam uma escala consistente para que páginas e componentes tenham ritmo visual previsível.

**Why this priority**: Valores fora de ordem e escalas implícitas causam diferenças visuais entre páginas e tornam ajustes de interface imprevisíveis.

**Independent Test**: Comparar páginas representativas antes/depois e inspecionar os componentes que usam os níveis de espaçamento alterados.

**Acceptance Scenarios**:

1. **Given** uma tela que usa níveis consecutivos de espaçamento, **When** ela é apresentada em desktop e mobile, **Then** os níveis crescem na ordem esperada e o layout mantém sua hierarquia.
2. **Given** páginas que usam valores ou fallbacks inconsistentes, **When** a escala é alinhada, **Then** os espaços preservam a intenção visual documentada e não saltam de tamanho por erro de nomenclatura.

### User Story 2 - Atualizar estilos sem regressões espalhadas (Priority: P1)

Como equipe do produto, queremos conhecer os usos existentes dos níveis afetados e ajustá-los deliberadamente, para que uma correção de token não altere silenciosamente dezenas de telas.

**Why this priority**: O nível 6 é usado hoje como 24px, enquanto a escala de referência o define como 32px; trocar o token sem revisar consumidores mudaria layouts existentes.

**Independent Test**: Inventariar referências aos tokens/fallbacks, atualizar os casos intencionais e verificar as telas representativas da cobertura visual.

**Acceptance Scenarios**:

1. **Given** uma referência a um nível cuja dimensão muda, **When** a auditoria termina, **Then** o uso foi classificado e mantido, substituído por nível correto ou documentado como exceção.
2. **Given** a escala final, **When** se consulta cada nível suportado, **Then** existe uma sequência completa, crescente e sem níveis ausentes.

### Edge Cases

- Um componente pode depender intencionalmente de um espaço fixo que coincida hoje com um token; não deve mudar por associação acidental.
- Layouts em larguras móveis podem quebrar mesmo quando a mudança parece pequena em desktop.
- Fallbacks CSS antigos podem esconder referências a tokens inexistentes ou fora de escala e também devem ser revisados.
- Espaços específicos de conteúdo ou mapas não devem ser forçados à escala se houver justificativa visual documentada.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A escala de espaçamento MUST conter todos os níveis definidos para a sequência, sem lacunas ou inversão de ordem.
- **FR-002**: Cada nível MUST representar um tamanho estritamente crescente em relação ao nível anterior e corresponder à escala de referência do produto.
- **FR-003**: Usos existentes dos níveis alterados e seus fallbacks MUST ser inventariados antes da mudança e classificados pela intenção de layout.
- **FR-004**: A atualização MUST preservar o espaçamento pretendido dos consumidores revisados, ajustando os usos em vez de depender de valores antigos incorretos.
- **FR-005**: Páginas representativas de Home, Explorar, Sessões e componentes compartilhados MUST ser verificadas em desktop e mobile.
- **FR-006**: Exceções à escala MUST ser explícitas e justificadas; não podem servir para manter inconsistências sem motivo.

### Key Entities

- **Nível de espaçamento**: Medida ordenada que define um incremento visual reutilizável.
- **Consumidor de espaçamento**: Elemento de interface cujo layout referencia um nível ou fallback da escala.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A sequência de tokens apresenta zero lacunas e zero níveis fora de ordem.
- **SC-002**: 100% das referências aos níveis alterados foram revisadas e classificadas.
- **SC-003**: As telas representativas não apresentam sobreposição, corte ou quebra de hierarquia visual em desktop ou mobile.
- **SC-004**: Nenhum fallback remete a nível inexistente ou contradiz a escala documentada.

## Assumptions

- A escala de referência pretendida é a sequência já descrita no backlog e presente no protótipo: 4, 8, 12, 16, 24, 32 e 48 pixels para sete níveis consecutivos.
- A especificação cobre consistência e resultado visual; valores e consumidores podem ser ajustados durante o plano após auditoria completa.
- Não se exige redesenhar páginas cuja composição já esteja correta.
