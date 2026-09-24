# Research: Tema visual da campanha editável

**Feature**: `146-tema-campanha-editavel`  
**Date**: 2026-09-24

## 1. Identidade persistida e validação

**Decision**: Reutilizar o campo `Campanha.genero` e os quatro IDs fechados `fantasia`, `gotico`, `scifi` e `urbano`. Validar no request e no serviço existente, reutilizando `normalize_genero`/`GENRE_IDS`.

**Rationale**: `genero` já está no model e no banco de controle; a spec 111 definiu paletas e regras visuais, e o serviço `genre_palette.py` já fornece a validação canônica. Não há novo dado nem nova entidade.

**Alternatives considered**: Criar outro campo chamado `tema`, permitir valores de tema arbitrários ou duplicar a validação no frontend. Rejeitados porque confundiriam preferência pessoal com identidade da campanha ou criariam uma segunda fonte de verdade.

## 2. Persistência e migration

**Decision**: Alterar somente a coluna existente em `control.db`; não criar migration.

**Rationale**: `Campanha.genero` foi criado na revisão `005_genero` e é carregado no `GET /api/c/{slug}/config`. Mudar seu valor não muda o schema nem exige tratamento especial em instalações existentes.

**Alternatives considered**: Adicionar coluna ou tabela de temas. Rejeitadas porque a identidade já está representada por uma única coluna persistida.

## 3. Autorização e superfície de API

**Decision**: Expor `PATCH /api/campanhas/{slug}/genero`, exigir `require_dono`, validar o gênero e persistir a linha da campanha indicada. Responder com `{slug, genero}` após commit. Valores inválidos devem produzir erro mapeável `GENERO_INVALIDO`; campanha ausente/inativa continua retornando `CAMPANHA_NAO_ENCONTRADA`.

**Rationale**: `backend/app/routers/campanhas.py` já concentra as operações de dono para visibilidade, unidade de distância e capa; `backend/app/services/campanha_admin.py` contém o padrão de leitura, validação, commit e retorno. `require_dono` resolve a membership para o slug e recusa usuário sem papel dono. Manter o endpoint na área de gestão deixa explícita sua autorização.

**Alternatives considered**: PATCH amplo de toda a campanha, rota pública de configuração ou alteração por qualquer membro. Rejeitados por ampliar o escopo de mutação e enfraquecer o limite de autorização.

**Isolation implication**: Acrescentar a nova escrita à cobertura HTTP de isolamento: alterar campanha A não pode modificar campanha B; usuário não dono não pode alterar a campanha indicada, ainda que participe de outra.

## 4. Superfície de gestão

**Decision**: Adicionar a seleção do tema visual compartilhado junto aos controles existentes de cada campanha em `/painel`, permitindo escolher, salvar ou cancelar a seleção pendente.

**Rationale**: `PainelPage` já enumera campanhas próprias com `campanhasApi.minhas()` e oferece alterações de visibilidade, unidade de distância e capa. O modelo atual identifica dono e não tem gestão de co-mestre.

**Alternatives considered**: Criar uma nova página de edição ou colocar o seletor pessoal `ThemeSelector` no cabeçalho da campanha. Rejeitados: a nova página duplicaria gestão existente e `ThemeSelector` altera preferência individual Automático/Claro/Escuro, não o gênero compartilhado.

## 5. Aplicação do tema e cache

**Decision**: Após sucesso, atualizar a lista do Painel e invalidar o cache de configuração daquele slug. Na abertura ou recarga da campanha, o config GET já fornece o gênero salvo e `CampaignShell` reaplica o tema através de `applyCampaignGenre`.

**Rationale**: `useInstanceConfig` mantém cache em memória por slug, e `App.tsx` aplica a identidade visual a partir da configuração. Invalidar o item alterado evita reaplicar valor obsoleto ao reabrir. A preferência pessoal já fica em `codex.theme`; `applyCampaignGenre` força escuro somente para gêneros sem suporte a claro e restaura a preferência ao retornar à Fantasia.

**Alternatives considered**: Persistir o gênero no navegador, sobrescrever a preferência pessoal ou adicionar sincronização ao vivo entre sessões. Rejeitados porque a decisão precisa ser compartilhada pela campanha, deve manter preferências independentes, e sincronização ao vivo não faz parte da spec.

## 6. Copy e erros

**Decision**: Reutilizar as traduções existentes dos quatro nomes de gênero e adicionar em `comum.json` de pt-BR e en apenas labels/ações/estados necessários à edição e a tradução de `GENERO_INVALIDO`.

**Rationale**: As opções já têm nomes localizados em ambas as línguas. O request usa código de erro da API, e as mensagens visíveis devem seguir o hook `useApiErrorMessage`.

**Alternatives considered**: Texto fixo no componente ou strings de genre duplicadas. Rejeitados por quebrar o padrão de i18n e criar cópias divergentes.

## 7. Testes e estratégia de validação

**Decision**: Escrever antes da implementação testes HTTP para sucesso e persistência dos quatro valores, acesso anônimo, membro não dono, valor inválido, campanha inexistente e isolamento entre slugs. Completar com cenários manuais para aplicação da identidade, preferência pessoal e estados salvar/cancelar/erro.

**Rationale**: A superfície é uma escrita protegida e toca dados de campanha compartilhados; os princípios I e II da constituição exigem autorização e isolamento provados por testes antes do código.

**Alternatives considered**: Validar apenas visualmente ou reutilizar somente os testes da spec 111. Rejeitados porque não provam a nova permissão nem o caminho de alteração pós-criação.
