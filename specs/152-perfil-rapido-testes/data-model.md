# Data Model: Perfis de execução de testes

Esta feature não altera entidades ou dados do produto. Ela define conceitos para comandos de validação e para a medição de duração.

## Perfil de execução

| Campo conceitual | Descrição |
|---|---|
| Identificador | Nome estável do perfil, por exemplo `fast` ou `full`. |
| Suítes incluídas | Comandos e seleções de testes executados pelo perfil. |
| Suítes omitidas | Verificações não executadas pelo perfil rápido e referências ao fluxo completo necessário. |
| Pré-requisitos | Estado esperado de dependências, serviços, build e dados/seed. |
| Modo de execução | Serial, desktop-only ou completo; paralelismo exige isolamento próprio. |
| Resultado | Código de saída não zero em falhas; resumo das etapas e testes executados. |

## Registro de medição

Cada amostra de baseline deve incluir:

- suíte/etapa medida e comando usado;
- versão do código e contagem/inventário dos testes coletados;
- SO e informação disponível de CPU/RAM;
- versões de Python, Node, navegador e ferramentas;
- dependências já instaladas e estado de cache (frio/aquecido);
- estado dos serviços E2E e seed antes da amostra;
- duração total e, para E2E, duração separada de serviço, build, readiness, seed e execução quando aplicável.

A linha de base agrega cinco ou mais execuções após aquecimento pela mediana. Não inclui tempo de instalação inicial na meta do perfil rápido.

## Integridade dos dados de teste

Dados mutáveis do backend permanecem isolados pelos fixtures; dados E2E permanecem em diretórios de teste descartáveis/configurados. Perfis completos devem conseguir executar os testes de autenticação, permissões, migração, import/export e isolamento sem depender de dados criados por um perfil rápido.
