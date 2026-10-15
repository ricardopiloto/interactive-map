# Proposal

## Why

O produto tem hoje um sistema de tema por gênero de campanha (`fantasia`/`gotico`/`scifi`/`urbano`), escolhido pelo dono no wizard de criação e editável depois no Painel, que troca a paleta de cores OKLCH da interface inteira (`html[data-genre="..."]`). Esse mecanismo existe tanto em `frontend/` (produção) quanto em `frontend-v2/` (em migração) e no backend (`Campanha.genero`, endpoint `PATCH /campanhas/{slug}/genero`, export/import). Decisão do usuário: simplificar o produto para um único tema de cores — a paleta OKLCH já adotada de `paper-parchment-pages-main` — sem seleção de gênero, em nenhuma campanha, nova ou existente. O tema claro/escuro/automático da interface (independente do gênero) não é afetado.

## What Changes

- **BREAKING**: `Campanha.genero` deixa de existir — nenhuma campanha (nova ou já existente) tem mais um gênero/tema associado; a paleta de cores passa a ser uma só, igual para toda campanha.
- Remove o seletor de gênero do wizard de criação (`NovoCodexPage`/`novo.tsx`, passo "Sistema e gênero" passa a ser só "Sistema"), do Painel (edição de tema por campanha), da Home (preview de tema por gênero) e do Explorar (se usado como filtro/exibição), tanto em `frontend/` quanto em `frontend-v2/`.
- Remove a paleta de cores alternativa por gênero (`html[data-genre="..."]`, variáveis `--genre-swatch-*`) do CSS de `frontend-v2/`; a paleta base do template (paper-parchment) passa a ser a única.
- Remove o endpoint `PATCH /campanhas/{slug}/genero` e o campo `genero` do contrato de `GET /api/c/{slug}/config`, de `GET /api/campanhas/minhas`, de `GET /api/campanhas/catalogo` e do manifesto de export/import de pacote.
- O campo `sistema` (nome do sistema de RPG, texto livre, ex. "WFRP 4e") **não é afetado** — continua existindo, independente do gênero/tema removido.
- A imagem de capa (`capa_arquivo`/upload de capa) **não é afetada** — continua existindo, independente do gênero/tema removido.
- O seletor de tema claro/escuro/automático da interface **não é afetado**.

## Capabilities

### New Capabilities
- `tema-unico`: o produto usa uma única paleta de cores (a de `paper-parchment-pages-main`) para toda campanha; não existe mais seleção de gênero/tema por campanha, em nenhuma tela.

### Modified Capabilities
(nenhuma — não há capability OpenSpec existente cobrindo o tema por gênero; ele foi construído antes da adoção do OpenSpec neste projeto.)

## Impact

- **Backend**: `backend/app/models/campanha.py` (remove `genero`, migração de schema de `control.db`), `backend/app/services/genre_palette.py` (removido), `backend/app/services/campanha_admin.py` (remove `set_genero`, `create_campanha` deixa de aceitar `genero`), `backend/app/routers/campanhas.py` (remove `PATCH /{slug}/genero` e o campo das respostas), `backend/app/schemas/campanhas.py`/`config.py` (remove os campos `genero`), `backend/app/services/campaign_export.py`/`campaign_import.py` (manifesto de pacote deixa de incluir/ler `genero`), `backend/app/cli.py` (se expõe `genero` em algum comando).
- **Frontend `frontend-v2/`**: `src/theme/genres.ts` (removido), `src/styles.css` (remove variáveis/regras `--genre-swatch-*` e `html[data-genre=...]`), `src/routes/novo.tsx` (wizard perde o passo/campo de gênero), `src/routes/painel.tsx` (remove edição de tema), `src/routes/home.tsx` (remove preview de tema por gênero), `src/routes/explorar.tsx` (se exibe/filtra por gênero), `src/components/site/CampaignCard.tsx` (se usa `genero` para estilo), `src/api/campanhas.ts`/`src/api/campaign.ts` (remove o campo `genero` dos tipos).
- **Frontend `frontend/` (produção)**: `src/theme/genres.ts`, `src/theme/campaignGenre.ts`, `src/pages/HomePage.tsx`, `src/pages/NovoCodexPage.tsx`, `src/pages/PainelPage.tsx`, `src/pages/ExplorarPage.tsx`, `src/components/campaign/CampaignCard.tsx`, `src/api/campanhas.ts`, `src/App.tsx`, `src/types/index.ts` — tratado nesta mesma change (não só em `frontend-v2/`) porque `frontend/` ainda está em produção; esperar o cutover de `frontend-v2-paper-parchment` para remover o tema por gênero deixaria o produto em produção com uma funcionalidade que o dono já decidiu descontinuar.
- **Dados/migração**: migração de schema de `control.db` removendo a coluna `genero` de `Campanha`; nenhum dado é preservado (decisão do usuário) — toda campanha existente perde o gênero que tinha, sem substituto.
- **Descontinuação**: o sistema de tema por gênero (`genre_palette.py`, `theme/genres.ts`/`campaignGenre.ts`, paleta `--genre-swatch-*`) é removido por completo, nos dois frontends e no backend.
