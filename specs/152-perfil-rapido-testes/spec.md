# Feature Specification: Otimizar a execução dos testes

**Feature Branch**: `152-perfil-rapido-testes`

**Backlog**: [BKLG-038](../../docs/backlog/backlog.md)

**Created**: 2026-09-25

**Status**: Draft

**Input**: User description: "BKLG-038: reduzir o tempo de espera dos scripts de teste, com um perfil rápido de feedback local, mantendo cobertura e isolamento."

## Constitution *(constraints; not implementation)*

- A otimização MUST preservar a cobertura e os testes de isolamento existentes.
- Testes de autenticação, permissões, migrações e importação/exportação continuam sujeitos aos gates de qualidade do projeto.
- A produção legada deve continuar funcionando sem alterações até a spec de corte.
- Dependências novas não fazem parte do objetivo; qualquer necessidade deve ser justificada no planejamento.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Obter feedback rápido durante o desenvolvimento (Priority: P1)

Como desenvolvedor, quero executar um perfil rápido e previsível de testes, para validar mudanças frequentes sem esperar pela execução completa das suítes.

**Why this priority**: O tempo de espera atual interrompe o ciclo de desenvolvimento e desestimula verificações frequentes.

**Independent Test**: Executar o perfil rápido em uma mudança representativa e confirmar que ele conclui dentro da meta definida, reporta falhas corretamente e cobre o conjunto documentado.

**Acceptance Scenarios**:

1. **Given** o ambiente local preparado, **When** o desenvolvedor inicia o perfil rápido, **Then** as verificações selecionadas executam sem repetir preparação desnecessária.
2. **Given** uma falha em um teste do perfil, **When** a execução termina, **Then** o comando retorna falha e identifica o teste responsável.
3. **Given** mudanças que exigem verificações de segurança ou dados, **When** o perfil rápido é usado, **Then** ele inclui essas verificações obrigatórias ou informa claramente quais devem ser executadas adicionalmente.

### User Story 2 - Medir e otimizar as suítes completas (Priority: P1)

Como desenvolvedor, quero conhecer o tempo e os gargalos das suítes completas, para reduzir esperas sem remover cobertura.

**Why this priority**: Sem uma linha de base separada por suíte, otimizações podem atuar no ponto errado ou ocultar verificações necessárias.

**Independent Test**: Registrar a linha de base das suítes e comparar a duração após as otimizações, confirmando que os mesmos cenários e verificações continuam ativos.

**Acceptance Scenarios**:

1. **Given** as suítes de backend e frontend/E2E disponíveis, **When** são medidas em ambiente documentado, **Then** cada uma tem duração de referência e principais etapas de espera identificadas.
2. **Given** uma otimização aplicada, **When** as suítes são executadas, **Then** duração e cobertura podem ser comparadas com a linha de base.
3. **Given** um teste que falha ou excede seu limite, **When** a suíte termina, **Then** a causa é reportada sem aguardar silenciosamente um timeout excessivo.

### Edge Cases

- Um perfil rápido não pode parecer verde quando etapas obrigatórias de segurança ou isolamento foram omitidas sem aviso.
- Execução paralela não pode causar colisão de bancos, arquivos temporários, portas ou dados compartilhados.
- Resultados de tempo devem identificar condições do ambiente e não prometer uma duração absoluta em máquinas diferentes.
- Falhas de inicialização de serviços devem ser diferenciadas de falhas de asserção dos testes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O projeto MUST oferecer um perfil rápido documentado para feedback local frequente.
- **FR-002**: O perfil rápido MUST declarar quais suítes e verificações executa e quais ficam fora dele.
- **FR-003**: Verificações de autenticação, permissões, migrações, importação/exportação e isolamento MUST continuar obrigatórias nos fluxos completos apropriados.
- **FR-004**: O projeto MUST manter comandos documentados para executar as suítes completas de backend e frontend/E2E.
- **FR-005**: A documentação MUST registrar duração de referência por suíte e ambiente de medição, além dos gargalos identificados.
- **FR-006**: A solução MUST reduzir trabalho repetido de preparação quando isso puder ser feito sem enfraquecer isolamento ou confiabilidade.
- **FR-007**: Timeouts MUST permitir distinguir falhas de inicialização e interação de uma execução lenta legítima e MUST produzir diagnóstico acionável.
- **FR-008**: Paralelização MUST NOT permitir colisões de dados, arquivos, portas ou sessões entre testes.
- **FR-009**: Otimizações MUST NOT remover cenários ou reduzir cobertura para atingir metas de duração.
- **FR-010**: O perfil rápido MUST concluir em até 2 minutos em ambiente local de referência documentado, excluindo instalação inicial de dependências.
- **FR-011**: A duração mediana das execuções de referência das suítes recorrentes MUST melhorar em pelo menos 25% sem perda de cobertura, ou o plano deve documentar por que a meta não é tecnicamente alcançável.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Desenvolvedores conseguem executar o perfil rápido em até 2 minutos no ambiente de referência documentado.
- **SC-002**: A duração mediana das suítes recorrentes é reduzida em pelo menos 25% frente à linha de base, sem reduzir cobertura ou isolamento.
- **SC-003**: 100% das suítes completas permanecem acessíveis por comandos documentados.
- **SC-004**: Todo teste deliberadamente falho no perfil rápido resulta em código de saída de falha e diagnóstico identificável.
- **SC-005**: 100% dos testes de isolamento e demais verificações obrigatórias continuam executáveis e incluídos nos fluxos completos apropriados.

## Assumptions

- O objetivo é reduzir o tempo percebido do ciclo local; tempos de CI podem ser medidos separadamente e não precisam obedecer à meta do perfil local.
- O perfil rápido pode selecionar subconjuntos de testes, mas deve informar seus limites e não substituir as suítes completas antes de integração ou entrega.
- A linha de base será medida antes de otimizar, em ambiente local documentado e com repetições suficientes para reduzir o efeito de variações pontuais.
- A meta de 25% é aplicada às suítes recorrentes que forem identificadas como otimizáveis; a cobertura permanece a mesma.
