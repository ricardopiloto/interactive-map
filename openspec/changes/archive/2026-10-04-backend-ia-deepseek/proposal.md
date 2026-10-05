# Proposal

## Why

Várias ideias já registradas no produto dependem de IA (gancho de criação de arco por IA em [`specs/153-linha-tempo-por-arcos`](../../../specs/153-linha-tempo-por-arcos/spec.md) FR-012/FR-013 e na change [`linha-tempo-por-arcos`](../linha-tempo-por-arcos/proposal.md); BKLG-040, resumo de transcrição de sessão; BKLG-015, IA somente leitura sobre a campanha), mas hoje não existe nenhuma infraestrutura de chamada a um provedor de IA no backend — nem cliente, nem configuração de credenciais, nem respeito ao flag de módulo por campanha. Sem essa infraestrutura, cada feature de IA teria que resolver (e arriscar resolver de forma inconsistente) as mesmas perguntas de configuração, erro de provedor indisponível e, principalmente, privacidade — o que pode ou não ser enviado a um serviço externo. Esta proposta entrega essa infraestrutura de base uma única vez, usando DeepSeek como provedor (decisão do usuário), para que o gancho já especificado em spec153/`linha-tempo-por-arcos` e futuras features de IA a consumam sem reabrir essas decisões.

## What Changes

- Novo módulo de infraestrutura de IA no backend: cliente que chama a API do DeepSeek, com configuração de API key via variável de ambiente (mesmo padrão de `Settings`/`.env` já usado no produto).
- Checagem de "IA habilitada para esta campanha" a partir de `Campanha.modulos_ativos` (campo já existente, mesmo mecanismo já usado para o módulo "fadiga") — nenhuma chamada ao provedor externo ocorre se o módulo não estiver ativo na campanha.
- **Regra de privacidade, aplicada nesta camada de infraestrutura, não deixada para cada consumidor implementar por conta própria**: nenhum dado de sessão/evento/entidade marcado como oculto (`visivel_para_todos=false`) pode ser incluído em nenhuma chamada ao provedor de IA; toda chamada é isolada à campanha de quem a solicitou, nunca combinando dados de campanhas diferentes.
- Tratamento de erro/indisponibilidade do provedor (timeout, erro de API, credencial ausente ou invália) como um estado explícito e tratável pelo chamador, não uma falha não tratada.
- **Não inclui** a lógica de negócio de nenhuma feature de IA específica (gerar arco a partir de sessões, resumir transcrição, responder perguntas sobre a campanha) — isso fica para changes OpenSpec separadas e posteriores, que vão consumir esta infraestrutura.

## Capabilities

### New Capabilities
- `ia-provider`: infraestrutura de chamada a um provedor de IA (DeepSeek) a partir do backend — configuração de credenciais, respeito ao flag de módulo por campanha, regra de privacidade (nunca enviar dados ocultos, nunca misturar campanhas) e tratamento de indisponibilidade do provedor. Não inclui lógica de negócio de nenhuma feature de IA específica.

### Modified Capabilities
(nenhuma — `linha-tempo-por-arcos` e `linha-tempo-por-descoberta` não têm suas specs alteradas por esta proposta; o gancho de IA que elas já especificam continua definido como está, apenas passa a ter, depois desta change, uma infraestrutura real para eventualmente ser ligado a ele numa change futura.)

## Impact

- **Backend**: novo módulo de serviço (ex. `app/services/ia_provider.py` ou pacote equivalente) com o cliente DeepSeek (reaproveita `httpx`, já é dependência do projeto — sem dependência nova); nova(s) variável(is) de ambiente em `Settings`/`.env` (ex. `DEEPSEEK_API_KEY`), mesmo padrão de `app/config.py`; reaproveita `is_visivel_para_jogador` (`app/services/visibility.py`) e o padrão de leitura de `Campanha.modulos_ativos` já usado em `app/services/mecanica.py` para a checagem de módulo.
- **Sem impacto em frontend** nesta proposta — não há UI nova; o toggle Manual/IA e o estado "não habilitada" já especificados em `linha-tempo-por-arcos` continuam sendo a única superfície visível, sem mudança de comportamento observável até uma change futura ligar o motor de fato a esta infraestrutura.
- **Sem impacto em schema de dados além do já existente** — `Campanha.modulos_ativos` já existe; não há migração nesta proposta.
- Detalhes de decisão técnica (formato do cliente, tratamento de erro, onde a filtragem de privacidade é aplicada) em [`design.md`](design.md).
