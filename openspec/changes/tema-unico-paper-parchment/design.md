# Design

## Context

Ver `proposal.md` - Why/What Changes para a motivação completa. Estado atual relevante:

- O gênero (`fantasia`/`gotico`/`scifi`/`urbano`) é um campo fechado (`backend/app/services/genre_palette.py::GENRE_IDS`) de `Campanha`, com default `"fantasia"`, validado por `normalize_genero`. É editável via `PATCH /campanhas/{slug}/genero` e exposto em `GET /api/c/{slug}/config`, `GET /api/campanhas/minhas`, `GET /api/campanhas/catalogo`, e no manifesto de export/import.
- `frontend-v2/` aplica o gênero como `html[data-genre="..."]`, com variáveis CSS `--genre-swatch-*` e regras de paleta alternativa em `styles.css`; o wizard (`novo.tsx`) tem um passo "Sistema e gênero" com preview ao vivo (`applyGenrePreview`); o Painel (`painel.tsx`) permite trocar o gênero de uma campanha existente.
- `frontend/` (produção) tem o mesmo mecanismo em paralelo (`theme/genres.ts`, `theme/campaignGenre.ts`), usado em `HomePage`, `NovoCodexPage`, `PainelPage`, `ExplorarPage`, `CampaignCard`.
- `frontend/` ainda está em produção; o cutover de `frontend-v2-paper-parchment` (seção 12 dessa change) ainda não aconteceu e só avança com confirmação explícita do usuário.

## Goals / Non-Goals

**Goals:**
- Uma única paleta de cores para toda campanha, em produção (`frontend/`) e em migração (`frontend-v2/`), sem esperar o cutover.
- Remover completamente o campo de gênero do backend (schema, contrato de API, export/import) — não só escondê-lo na UI.
- Não afetar sistema de RPG (texto livre) nem capa da campanha.
- Não afetar o tema claro/escuro/automático da interface.

**Non-Goals:**
- Não é escopo desta change ajustar a paleta OKLCH base em si (cores, tokens) — ela continua sendo a de `paper-parchment-pages-main`, só deixa de variar por gênero.
- Não é escopo migrar/preservar o gênero que cada campanha tinha antes — é descartado (decisão do usuário).

## Decisions

### 1. Remover de `frontend/` (produção) também, não só de `frontend-v2/`
**Decisão**: esta change edita `frontend/` diretamente, mesmo essa base estando perto do fim de vida (removida no cutover de `frontend-v2-paper-parchment`).
**Por quê**: o backend é compartilhado pelos dois frontends. Remover o campo `genero` do backend sem tocar em `frontend/` quebraria a produção atual (que ainda lê/escreve esse campo) até o cutover acontecer — que pode levar um tempo indeterminado. A alternativa de manter o campo no backend só para não quebrar `frontend/` contradiz a decisão do usuário de remover a funcionalidade agora, não depois do cutover.
**Alternativa considerada**: manter o campo no backend como morto (aceito mas ignorado) até o cutover, remover de verdade só depois. Rejeitada — o usuário já decidiu explicitamente remover a coluna do schema, não só parar de editá-la.

### 2. Ordem de deploy: backend tolera ausência de gênero antes dos frontends pararem de enviá-lo
**Decisão**: a sequência de implementação remove primeiro o uso de `genero` nos dois frontends (deixam de enviar/ler o campo), depois remove o campo do backend (endpoint, schema, coluna). Durante o período intermediário, se necessário, o backend pode aceitar `genero` como campo opcional ignorado antes de removê-lo de vez — não é obrigatório ter as duas pontas no mesmo deploy atômico, mas a ordem (frontend para de depender → backend remove) evita qualquer janela de erro 422 por campo inesperado.
**Por quê**: minimiza risco de quebra durante o deploy, sem exigir coordenação perfeita de um deploy único.

### 3. Implementar depois de `campanha-slug-com-id`
**Decisão**: esta change é implementada depois que `campanha-slug-com-id` tiver revertido a iteração anterior e estabilizado `create_campanha`/a cadeia de migrações de `control.db`.
**Por quê**: as duas changes editam a mesma função (`create_campanha`) e, se `campanha-slug-com-id` ainda não tiver revertido/reaplicado sua própria migração de `control.db`, a nova revisão Alembic desta change (task 3.4, remoção da coluna `genero`) não sabe encadear corretamente (`down_revision`) até a cadeia de `alembic_control` estar estável. Implementar em paralelo exigiria coordenar duas revisões Alembic concorrentes no mesmo arquivo de histórico — mais arriscado que simplesmente serializar as duas changes.

## Risks / Trade-offs

- **`frontend/` recebe uma mudança de produto, não só `frontend-v2/`** → aceito como necessário (Decision 1); o diff em `frontend/` é de remoção (menos código), baixo risco de regressão em outras áreas.
- **Nenhum dado de gênero é preservado** → aceito, decisão explícita do usuário; sem plano de rollback de dados (só rollback de código, se necessário).
- **Pacotes exportados antes desta change têm `genero` no manifesto** → mitigado fazendo a leitura do manifesto na importação simplesmente ignorar o campo se presente (não validar nem rejeitar), em vez de exigir que ele esteja ausente.
- **Janela de erro no navegador de quem já tinha o app aberto no momento do deploy do backend**: o SPA já carregado em memória continua lendo `config.genero` (passa a vir `undefined`, não quebra render) e pode tentar chamar `PATCH /campanhas/{slug}/genero` (passa a 404) se a pessoa interagir com um controle de tema que ainda não foi removido da tela dela (cache do bundle antigo). Aceito como janela curta e de baixo impacto (o pior caso é um toast de erro ao tentar salvar um tema, não perda de dados); não é mitigado ativamente.

## Migration Plan

0. Pré-requisito: `campanha-slug-com-id` já implementada e com a cadeia de migrações de `control.db` estável (Decision 3).
1. Remover o uso de `genero` em `frontend-v2/` (wizard, Painel, Home, Explorar, CSS) e em `frontend/` (mesmas telas).
2. Remover `PATCH /campanhas/{slug}/genero` e o campo `genero` das respostas (`config`, `minhas`, `catalogo`) e do manifesto de export; fazer a importação ignorar `genero` se presente no manifesto, sem erro.
3. Remover `Campanha.genero` do modelo e migrar o schema de `control.db` (remover a coluna).
4. Remover `backend/app/services/genre_palette.py` e os módulos de tema por gênero dos dois frontends.
5. Validar manualmente: criar campanha nova (sem campo de gênero em nenhuma tela), abrir uma campanha que tinha gênero antes (deve abrir normalmente, com a paleta única), importar um pacote exportado antes desta change (deve funcionar, ignorando o `genero` do manifesto antigo).

**Rollback**: reverter o código; a coluna removida do schema precisaria ser recriada (vazia, sem dado anterior) se o rollback incluir voltar a oferecer a funcionalidade — não é o caso esperado, já que é uma decisão de produto deliberada, não um bug.
