# Spec Delta

## ADDED Requirements

### Requirement: Resumo não lista fios abertos

O Resumo gerado pela IA SHALL contar o que aconteceu na sessão e o estado do grupo, e o prompt do Resumo NÃO SHALL instruir a IA a listar fios abertos nem pendências. Os fios narrativos permanecem no bloco de Fios Narrativos da sessão e na lista de fios, e não fazem parte do contexto do Resumo.

#### Scenario: Prompt do Resumo sem fios abertos

- **WHEN** o prompt do Resumo é montado
- **THEN** ele não contém a instrução de terminar com fios abertos e mantém a instrução de usar só fatos do contexto

#### Scenario: Resumo não inventa fios

- **WHEN** o mestre pede o Resumo de uma sessão
- **THEN** o contexto enviado não inclui fios narrativos e o prompt não pede a lista de fios abertos
