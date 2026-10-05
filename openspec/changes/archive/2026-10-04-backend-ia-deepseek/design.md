# Design

## Context

O backend é FastAPI + SQLModel/SQLite (`backend/app/`). Configuração já segue um padrão único e consistente: `app/config.py` define `Settings(BaseSettings)` (pydantic-settings), lendo de `.env` com `validation_alias` explícito por variável (ex. `ADMIN_USER`, `MAX_UPLOAD_BYTES`). `httpx` já é dependência do projeto — não é preciso adicionar um cliente HTTP novo. `Campanha.modulos_ativos` (`app/models/campanha.py`) é uma coluna JSON já existente, hoje usada só para o módulo "fadiga"; `app/services/mecanica.py` mostra o padrão já comprovado de checar pertencimento a essa lista (`sanitize_extensoes`/`filter_extensoes`, ambos fazem `key in active_set` sobre `campanha.modulos_ativos` ou `settings.modulos_ativos`). A regra de visibilidade já tem um helper central e reaproveitável: `is_visivel_para_jogador(entity)` em `app/services/visibility.py`, hoje usado para decidir o que aparece pra jogador — a mesma função resolve "isso pode ser exposto fora do contexto de mestre", que é exatamente a pergunta que a regra de privacidade desta capability precisa responder antes de montar o payload de IA. Ver proposal.md - Why/What Changes para a motivação.

## Goals / Non-Goals

**Goals:**
- Entregar um único ponto de chamada ao provedor de IA (DeepSeek) que qualquer feature futura de IA no backend reaproveita, em vez de cada feature reimplementar configuração, checagem de módulo e filtragem de privacidade por conta própria.
- Aplicar a regra de privacidade (nunca enviar dados ocultos, nunca misturar campanhas) na própria infraestrutura, de forma que seja estruturalmente difícil para uma feature futura pular essa regra por descuido.
- Reaproveitar 100% dos padrões já existentes do produto (pydantic-settings, `httpx`, `is_visivel_para_jogador`, `modulos_ativos`) — zero dependência nova.

**Non-Goals:**
- Implementar a lógica de negócio de qualquer feature de IA específica (gerar arco a partir de sessões, resumir transcrição, responder perguntas sobre a campanha) — cada uma é uma change OpenSpec própria e posterior, consumindo esta infraestrutura.
- Suportar múltiplos provedores de IA simultaneamente ou um mecanismo de troca de provedor em runtime — a escolha de DeepSeek é fixa nesta fase; abstrair para múltiplos provedores só se justifica se/quando isso for pedido.
- Interface de administração para o mestre gerenciar a própria credencial de IA pela UI — a credencial é configuração de implantação (variável de ambiente), não um dado de campanha editável pelo mestre.
- Cache, rate limiting ou controle de custo das chamadas ao provedor — fora do escopo desta infraestrutura inicial; pode ser adicionado numa change futura se o uso real exigir.

## Decisions

- **O cliente de IA é um módulo de serviço do backend (`app/services/`), não um router novo.** Não há endpoint HTTP próprio nesta proposta — é infraestrutura interna que outro serviço (o motor de geração de arcos, numa change futura) chama diretamente. Alternativa considerada: expor já um endpoint genérico `/ia/complete`. Rejeitada porque exporia uma superfície de API genérica sem nenhum consumidor real ainda, e o acoplamento de autorização (quem pode chamar, com quais dados) é mais seguro quando decidido por cada feature consumidora, não por um endpoint genérico demais.
- **Credencial via `Settings`/`.env`, mesmo padrão de `ADMIN_USER`/`MAX_UPLOAD_BYTES`.** Nova variável (ex. `DEEPSEEK_API_KEY`), lida uma vez na inicialização, nunca passada em payload de request/response. Alternativa considerada: credencial por campanha (cada mestre usa sua própria chave DeepSeek). Rejeitada por agora — o pedido do usuário foi usar a chave que ele já tem; credencial por campanha pode ser revisitado numa change futura sem quebrar a spec atual (a spec não proíbe, só não exige).
- **O valor em `Campanha.modulos_ativos` que habilita IA é `ia_arcos`.** É o mesmo nome já exposto ao mestre no toggle da campanha. Um nome genérico `ia` foi rejeitado para não criar um segundo flag ao lado desse toggle.
- **Filtragem de privacidade (dados ocultos, isolamento por campanha) acontece na montagem do payload, dentro desta infraestrutura, reaproveitando `is_visivel_para_jogador`** — não é responsabilidade do código que chama a infraestrutura filtrar antes de passar os dados. Alternativa considerada: deixar cada consumidor (ex. o futuro motor de arcos) filtrar os próprios dados antes de enviar. Rejeitada porque é exatamente o tipo de regra que, se duplicada em cada feature, eventualmente alguém esquece — e o TR já tinha identificado esse mesmo padrão de risco para outras regras de visibilidade no produto.
- **Falha do provedor é modelada como um resultado explícito (ex. um tipo de retorno com estado de sucesso/falha, ou uma exceção de domínio própria), não uma exceção HTTP crua repassada.** Mesmo padrão de erro de domínio já usado em `app/errors.py`/`raise_api_error` (visto em `mecanica.py`) — mensagens de erro para o utilizador final não devem conter detalhes internos do provedor (corpo de erro da API DeepSeek, stack trace), mas o chamador interno precisa distinguir "módulo desabilitado" de "provedor indisponível" de "credencial ausente" para decidir o que mostrar ao mestre.
- **Autorização "apenas mestre"**: reaproveita o mecanismo de autorização de mestre já usado nos endpoints de administração de `Arco`/`Evento`/`Sessao` — esta infraestrutura não introduz um mecanismo de autorização novo, só exige que o chamador já tenha passado por essa checagem antes de acionar uma chamada de IA.

## Risks / Trade-offs

- **DeepSeek pode mudar formato de API/preço/disponibilidade** → como o cliente é um módulo isolado (não espalhado pelas features consumidoras), trocar de provedor no futuro é uma mudança localizada a este módulo, não uma mudança em cada feature de IA já construída sobre ele.
- **Custo de chamadas de IA sem controle (rate limit/cache) nesta fase** → aceito como Non-Goal explícito; se o uso real mostrar custo relevante, uma change futura adiciona controle sem precisar mudar o contrato desta capability (as chamadas continuam se comportando da mesma forma pro chamador).
- **Risco de um consumidor futuro tentar contornar a filtragem de privacidade chamando o provedor diretamente em vez de passar por esta infraestrutura** → mitigação é de processo/revisão de código, não técnica pura: este design documenta explicitamente que toda chamada de IA do produto deve passar por este módulo; uma change futura que precise chamar IA referencia esta capability como dependência.
- **Falta de controle de custo/privacidade já era uma preocupação registrada em BKLG-015 (IA somente leitura) antes desta proposta** → esta capability resolve a parte de privacidade (dados ocultos, isolamento por campanha) de forma reutilizável; a parte de custo/decisão de produto mais ampla sobre "até onde a IA pode ver a campanha" continua em aberto em BKLG-015 e não é resolvida só por esta infraestrutura.

## Migration Plan

1. Nenhuma migração de schema — `Campanha.modulos_ativos` já existe; esta proposta só documenta/usa um novo valor possível nessa lista (ex. `"ia_arcos"` ou um nome mais genérico a decidir no `tasks.md`).
2. Nova(s) variável(is) de ambiente (ex. `DEEPSEEK_API_KEY`) adicionadas à configuração de implantação; ambiente sem essa variável continua funcionando normalmente, com a IA tratada como indisponível (ver spec - Requirement "Credenciais do provedor configuradas fora do código e nunca expostas").
3. Rollback: como não há migração de schema nem alteração em comportamento existente (nenhuma feature hoje chama IA), reverter é remover o módulo de serviço novo e a variável de ambiente, sem efeito em dados persistidos.
