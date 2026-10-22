# Spec Delta

## Purpose

Define as invariantes da integração futura do Campaign Codex com o FoundryVTT: o que a ponte pode levar, o que nunca leva, e que ela não força um schema de ficha por sistema no modelo do Codex. Serve de critério de revisão para qualquer feature que toque mecânica de jogo ou exportação.

## ADDED Requirements

### Requirement: A ponte leva apenas a casca narrativa
O sistema SHALL limitar o conteúdo enviado ao FoundryVTT aos dados narrativos que o Campaign Codex já possui (nome, descrição, papel, facção, status, retrato, posição no mapa e texto de sessão). O sistema SHALL NOT gerar, inferir nem preencher dados de ficha, perícias, atributos ou stat block de nenhum sistema de jogo.

#### Scenario: Personagem exportado chega sem regra
- **WHEN** um Personagem é exportado para o Foundry
- **THEN** o documento criado contém nome, retrato e descrição narrativa, e nenhum campo de regra do sistema de jogo é preenchido pelo Codex

#### Scenario: Texto livre de mecânica não é interpretado
- **WHEN** um Personagem tem `notas_mecanicas` preenchido
- **THEN** o conteúdo é tratado como texto opaco e nunca é convertido em atributos ou perícias

### Requirement: Personagens são exportados como documentos de diário, nunca como atores
O sistema SHALL exportar cada Personagem incluído como uma página de diário (`JournalEntry`) e SHALL NOT criar `Actor` nem `Item` do Foundry nesta fase. NPCs visíveis SHALL ser incluídos por padrão; PJs SHALL ser excluídos por padrão e só incluídos quando o mestre ligar a opção.

#### Scenario: NPC visível vira página de diário
- **WHEN** o mestre gera a exportação com opções padrão e existe um NPC visível
- **THEN** o pacote contém uma página de diário para esse NPC e nenhum `Actor`

#### Scenario: PJ fora por padrão
- **WHEN** o mestre gera a exportação com opções padrão e existem PJs
- **THEN** nenhum PJ aparece no pacote

#### Scenario: PJ incluído por opção do mestre
- **WHEN** o mestre liga a opção de incluir PJs
- **THEN** cada PJ visível aparece como página de diário, também sem criação de `Actor`

### Requirement: Sem schema de ficha por sistema no modelo do Codex enquanto a ponte não existir
O sistema SHALL NOT introduzir, antes de a ponte ser desenhada, campos estruturados de ficha ou stat block por sistema de jogo no modelo de dados do Campaign Codex. O único dado de mecânica permitido em Personagem SHALL permanecer o texto livre `notas_mecanicas` e o mecanismo de módulos já existente.

#### Scenario: Proposta de campo de ficha estruturado
- **WHEN** uma change propõe campos estruturados de ficha (por exemplo pontos de vida, atributos ou perícias) em Personagem
- **THEN** a proposta é rejeitada na revisão por contrariar este requisito, até que a ponte tenha sido especificada

### Requirement: Exportação para o Foundry respeita a visibilidade e os campos de mestre
O sistema SHALL NOT incluir em nenhuma exportação para o Foundry entidades com `visivel_para_todos=false`, a menos que o mestre as inclua explicitamente. O sistema SHALL NOT colocar texto de campos exclusivos do mestre (`notas_mecanicas`, `notas_preparo`) em nenhum documento do Foundry legível por jogadores. A exportação para o Foundry SHALL ser um artefato distinto do pacote de backup completo da campanha, que continua levando todas as linhas.

#### Scenario: Entidade oculta fica de fora por padrão
- **WHEN** o mestre gera a exportação sem opções adicionais e existe um Personagem, Local ou Sessão oculto
- **THEN** a entidade oculta não aparece no pacote

#### Scenario: Notas do mestre não ficam legíveis por jogadores
- **WHEN** a exportação inclui `notas_mecanicas` ou `notas_preparo`
- **THEN** o texto só aparece em páginas de diário cuja permissão padrão impede jogadores de lê-las

#### Scenario: Backup completo continua intacto
- **WHEN** o dono exporta o pacote de backup portátil da campanha
- **THEN** o pacote continua incluindo todas as linhas, inclusive ocultas e campos de mestre, sem alteração de comportamento

### Requirement: A exportação não depende do sistema de jogo da campanha
O sistema SHALL produzir a mesma estrutura de diário para qualquer valor de `Campanha.sistema`, sem lista fechada de sistemas e sem erro para um valor desconhecido.

#### Scenario: Sistema conhecido
- **WHEN** o mestre exporta uma campanha cujo `sistema` é `wfrp4e` ou `wod`
- **THEN** o pacote tem a mesma estrutura de diário que o de qualquer outro sistema

#### Scenario: Sistema desconhecido
- **WHEN** o mestre exporta uma campanha cujo `sistema` não é conhecido
- **THEN** a exportação conclui normalmente, sem erro e sem aviso de sistema não suportado

### Requirement: A primeira entrega da ponte não exige conexão permanente
O sistema SHALL oferecer como primeiro artefato da ponte uma exportação pontual iniciada pelo mestre, que o mestre importa no Foundry por conta própria. A primeira entrega SHALL NOT exigir que o Foundry acesse o Campaign Codex enquanto roda, nem a criação de credenciais de API para o Foundry.

#### Scenario: Importação sem acesso ao Codex
- **WHEN** o mestre importa o pacote gerado num Foundry sem acesso à rede do Codex
- **THEN** a importação conclui apenas com o conteúdo do pacote
