## Why

No Obsidian, o mestre marca um combate planejado como um bloco de destaque (callout) que se distingue do resto da preparação. Nas Notas de Preparo da sessão isso não existe: um combate é só mais um parágrafo, difícil de achar na hora da mesa, e o assistente de IA não propõe combates, apesar de o rascunho já montar cenas com conflito.

## What Changes

- Novo formato de **bloco de combate** dentro do texto das Notas de Preparo: um callout markdown `> [!combate] Título` seguido de uma lista com Inimigos, Ambiente, Tática ou gatilho e Desfecho, sem estatísticas de regra.
- A renderização de texto rico passa a exibir esse callout, quando habilitada por uma prop (usada só na leitura das Notas de Preparo), com **cor própria** (token novo, claro e escuro), cabeçalho "Combate" com ícone e quebra de palavra, para ser reconhecível sem depender só da cor.
- O **rascunho de sessão** da IA passa a propor combates nesse formato, só onde a cena pedir conflito, e respeita a instrução do mestre (inclusive "sem combates"). O **resumo** gerado pela IA é instruído a não copiar blocos de combate como fatos ocorridos, e o contexto enviado à IA omite os blocos de combate das notas de sessões anteriores.
- Sem mudança de banco, de rotas ou de visibilidade: o bloco é texto dentro de `notas_preparo`, que continua só do mestre.

## Capabilities

### New Capabilities
- `bloco-combate-preparo`: formato do bloco de combate nas Notas de Preparo e sua apresentação visual distinta na leitura.

### Modified Capabilities
- `motor-ia-assistente`: o rascunho da sessão passa a poder propor combates no formato do bloco, e o resumo não os trata como acontecimentos.

## Impact

- Frontend: `frontend-v2/src/components/codex/RichContent.tsx` (renderização opt-in do callout) e `SessionReadBlocks.tsx` (ativa a prop), tokens de cor em `frontend-v2/src/styles.css`, textos em `locales/{pt-BR,en}/comum.json`.
- Backend: `backend/app/services/motor_ia_assistente.py` (prompt do rascunho e do resumo), `backend/app/services/contexto_ia.py` (omitir blocos de combate das notas anteriores) e seus testes.
- Sem migração, sem nova dependência, sem alteração de API.
