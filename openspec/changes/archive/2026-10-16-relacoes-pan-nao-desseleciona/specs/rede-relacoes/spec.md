# Spec Delta

## ADDED Requirements

### Requirement: Clique simples na área vazia desseleciona; pan preserva a seleção
Na Rede de Relações, um clique simples (pressionar e soltar sem deslocamento relevante do ponteiro) sobre a área do grafo que não seja um nó SHALL limpar a seleção do Personagem atual. Arrastar a área vazia para pan da viewport, ou arrastar um nó, SHALL NOT limpar nem alterar a seleção. Clicar um nó (sem arrastar) continua selecionando ou desselecionando aquele Personagem conforme o comportamento já existente.

#### Scenario: Clique simples na área vazia limpa a seleção
- **WHEN** há um Personagem selecionado e a pessoa clica (sem arrastar) numa área do grafo sem nó sob o ponteiro
- **THEN** a seleção é limpa

#### Scenario: Pan na área vazia preserva a seleção
- **WHEN** há um Personagem selecionado e a pessoa pressiona, arrasta e solta numa área do grafo sem nó sob o ponteiro (pan da viewport)
- **THEN** a seleção permanece no mesmo Personagem

#### Scenario: Arrastar um nó preserva a seleção
- **WHEN** há um Personagem selecionado e a pessoa arrasta outro nó (ou o mesmo) sem o gesto ser um clique simples
- **THEN** a seleção não muda por causa do arrasto
