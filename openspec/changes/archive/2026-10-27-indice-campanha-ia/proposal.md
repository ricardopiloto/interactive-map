## Why

Hoje cada chamada de assistência de IA lê a campanha inteira (sessões, arcos, eventos, personagens, locais) e corta o que passa de 48.000 caracteres, do mais antigo para o mais novo, sem avisar. Como as campanhas são vivas e sempre ganham sessões, a leitura completa não escala: logo o contexto estoura, o histórico antigo some em silêncio e arcos, eventos, personagens e locais podem ficar de fora só porque as sessões ocuparam o espaço.

## What Changes

- Novo **índice de busca por campanha** (SQLite FTS5, no próprio banco da campanha), com o texto de sessões, arcos, eventos, personagens, locais e itens dividido em trechos curtos, mantido automaticamente a cada gravação e reconstruível a qualquer momento.
- O contexto da IA (rascunho de sessão, resumo e descrições) passa a ser montado por composição: **sessões e arcos recentes completos + catálogo compacto de nomes + os trechos mais relevantes ao pedido** recuperados do índice, em vez de ler tudo. O teto de tamanho continua valendo.
- O índice é criado automaticamente na primeira chamada de IA de campanhas já existentes e, se estiver indisponível ou falhar, a IA volta ao comportamento atual (leitura completa com teto), sem perder a assistência.
- Painel da campanha ganha, junto do interruptor de IA, o **estado do índice** e a ação **Reindexar** para o mestre dono.
- Sem alteração do que é enviado a jogadores, da exportação da campanha ou das regras de conteúdo oculto: o índice é dado derivado, só do mestre, e não vai no pacote exportado.
- Fora de escopo nesta change: propostas de fios, de arcos e associações de IA mantêm o contexto atual (ver Design).

## Capabilities

### New Capabilities
- `indice-campanha-ia`: índice de busca da campanha para a IA, sua manutenção automática, a reconstrução (reindexar), o estado visível ao mestre e o comportamento em falha.

### Modified Capabilities
- `motor-ia-assistente`: o contexto de cada chamada de assistência passa a ser composto por recentes, catálogo e trechos relevantes do índice, mantendo o limite de tamanho.

## Impact

- Backend: migração Alembic por campanha (`013`: tabela virtual FTS5 e tabela de estado do índice), serviço novo de índice (trechos, atualização, consulta, reconstrução), ajuste em `contexto_ia.py`/`motor_ia_assistente.py`, rotas `GET`/`POST` de índice sob o roteador de IA, ouvinte de gravação no mesmo estilo do que já existe em `campaign_db.py`, configurações novas com padrão seguro.
- Frontend: seção «Índice da campanha» em `routes/painel.tsx`, cliente em `api/`, textos em `locales/{pt-BR,en}`.
- Sem nova dependência (FTS5 vem com o SQLite). Sem mudança em API pública, exportação ou importação.
