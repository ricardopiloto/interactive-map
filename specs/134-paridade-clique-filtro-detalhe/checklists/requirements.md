# Specification Quality Checklist: Filtro de tipo de vínculo passa a isolar/somar tipos ao clicar (Relações)

**Purpose**: Validar completude e qualidade da especificação antes do planejamento
**Created**: 2026-09-24
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] Sem detalhes de implementação (seção "Implementação" separada, ao final, após o comportamento já ter sido verificado ao vivo)
- [x] Foco em valor para usuário e negócio
- [x] Escrito para stakeholders não técnicos
- [x] Seções obrigatórias completas

## Requirement Completeness

- [x] Sem marcadores `[NEEDS CLARIFICATION]`
- [x] Requisitos testáveis e sem ambiguidade relevante
- [x] Critérios de sucesso mensuráveis
- [x] Critérios de sucesso agnósticos de tecnologia
- [x] Cenários de aceitação definidos
- [x] Casos-limite identificados (cliques concorrentes, troca de personagem, sem vínculos do tipo)
- [x] Escopo cobre filtro aditivo (multi-tipo) + isolar via duplo-clique
- [x] Dependências e premissas identificadas

## Feature Readiness

- [x] Requisitos funcionais têm cenários de aceitação
- [x] Histórias cobrem o filtro aditivo (US1) e o atalho de isolar (US2)
- [x] Critérios mensuráveis definidos
- [x] Sem detalhes de implementação vazando pro corpo da spec

## Notes

- **Correção de escopo (2026-09-24):** a v1 desta spec tratava só de "paridade de clique" entre os dois filtros — reproduzindo o relato do usuário ao vivo, descobrimos que a paridade já existia, mas a semântica do clique único estava invertida (clicar num tipo REMOVIA esse tipo de um conjunto "todos ativos", em vez de isolar/mostrar só ele). Reescrita para tratar a causa raiz real. Já implementado e verificado ao vivo no ambiente de dev, em ambos os filtros.
