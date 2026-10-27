# Review — Arquiteto de Soluções

**Change:** fios-narrativos-lista
**Data:** 2026-10-25
**Veredito geral:** Aprovado com ressalvas (nenhum bloqueante; 4 ajustes importantes antes de implementar)

Base: leitura dos 4 artefatos, de `models/sessao.py`, `sessao_service.delete_sessao`, `package_schema.py`, `campaign_export.py`, `campaign_import.py`, `alembic_campaign/versions/009_item.py`, `011_personagem_notas_mecanicas.py`, `ia_provider.py`, `motor_ia_assistente.py` (estado atual com `rascunho_sessao`) e `routes/sessoes.tsx`. Não há documento de arquitetura em `docs/`; o `design.md` das changes é o ADR do projeto.

## 1. Definição da arquitetura técnica
Veredito: OK com ressalvas
- Stack coerente: SQLModel + Alembic por campanha, router admin com `require_dono`, serviço de IA sobre `ia_provider`, `frontend-v2`. Nenhuma tecnologia nova. OK.
- A entidade mínima (`fio_narrativo`) é bem delimitada e extensível para o BKLG-012 sem prometê-lo. OK.
- **Duplicação de coleta de contexto.** `motor_ia_fios.coletar_*` reimplementaria o que `motor_ia_assistente.coletar_registros` já faz (sessões com fallback resumo → notas de preparo → título, arcos, eventos, personagens, locais, orçamento). Duas cópias divergem com o tempo. — Extrair um coletor/orçamento compartilhado (ou reusar as funções existentes) e deixar só o prompt, o formato de saída e o saneamento específicos em `motor_ia_fios`. Acrescentar como task em 2.1.
- Escalabilidade: a carga é de poucos mestres e chamadas manuais, compatível com o limite de 10/minuto. A change não declara isso; vale uma frase no `design.md`.

## 2. Integração com a infraestrutura existente
Veredito: **Atenção (2 achados importantes)**
- **`ON DELETE SET NULL` não é efetivo no SQLite sem `PRAGMA foreign_keys=ON`, e o projeto não o habilita** (nenhuma ocorrência em `app/`). `delete_sessao` remove os links manualmente, o que confirma o padrão. Resultado: `sessao_origem_id` ficaria apontando para uma sessão apagada. — Tratar explicitamente em `sessao_service.delete_sessao` (zerar `sessao_origem_id` dos fios da sessão) e testar; remover a promessa de `ON DELETE SET NULL` do design como mecanismo.
- **Compatibilidade de pacotes exportados.** `campaign_head_revision()` é o head do Alembic; `migrate_to_head` só aceita a versão atual ou as registradas em `SCHEMA_MIGRATORS`, que hoje só tem `000_pre`. Ao criar a migração `012`, todo pacote exportado em `011` passa a ser recusado como `SCHEMA_FUTURO` na importação. A importação ignorar chaves desconhecidas não resolve isso. — Registrar um migrador identidade de `011_personagem_notas_mecanicas` para o novo head (e verificar se o mesmo problema já existe para `010`), com teste de importação de um pacote 011.
- **O pacote atual é parcial** (`build_content_dict` não inclui eventos nem itens; só arcos, personagens, locais, vínculos, waypoints, sessões e links). O requirement "fios na exportação/importação" é, portanto, mais forte que a paridade com o resto. — Confirmar a intenção: manter o requirement e incluir `fios` em `build_content_dict`, em `_insert_content` e em `_validate_fks` (verificar `sessao_origem_id` contra as sessões do pacote, preservando ids), ou rebaixá-lo a "backup de arquivo" apenas. O backup por cópia do banco já os inclui.
- Sem novo processo, porta ou variável de ambiente; deploy conjunto. OK. Migração idempotente no padrão de `009_item.py` (checar `get_table_names`). OK.

## 3. Qualidade de arquitetura e trade-offs
Veredito: Atenção
- **Aceitação não atômica.** Aceitar N propostas via N chamadas `POST /fios` pode deixar a lista parcial em caso de falha de rede. — Oferecer `POST /fios/lote` (transacional, limite de itens) e usá-lo no diálogo; manter o `POST /fios` unitário para o fio manual.
- **Segurança.** A lista é só do mestre por construção (sem `visivel_para_todos`, sem schema público), e conteúdo oculto no contexto da IA segue a Decisão 1 da `ia-assistente-mestre`. O campo `descricao` gerado a partir de ocultos fica só no mestre. OK. Manter o teste de que nenhuma rota pública expõe fios, e acrescentar um teste de que exportações para jogadores (se existirem) não os contêm.
- **Prompt injection.** Os fios existentes e o texto das sessões entram como dados do contexto; repetir no prompt de `motor_ia_fios` as regras de "ignorar ordens dentro do conteúdo" e de saída JSON sem markdown. Já previsto; confirmar nos asserts de prompt (constantes, palavras-chave estáveis).
- **Performance.** Contexto de ~48k caracteres numa chamada `deepseek-chat` leva ~17–25 s (medido na `ia-assistente-mestre`); a proposta de fios retorna JSON curto, o que ajuda. O timeout dedicado de 120 s já existe (`ia_assistente_timeout_seconds`); usar o mesmo em `fios/propor`. A lista em si não tem gargalo (dezenas de itens).
- **Código morto.** O tipo `fios_narrativos` de `/ia/assistir` deixa de ser usado pela UI mas continua aceito pela rota. — Remover o tipo na mesma change (backend, schema Literal, testes, copy) em vez de deixar "para limpeza posterior"; evita dois caminhos para a mesma função.
- Manutenibilidade: simples o bastante para a equipe (uma tabela, um router, um serviço, uma seção de UI). OK.

## 4. Documentação e decisões (ADRs)
Veredito: OK
- O `design.md` registra alternativas rejeitadas (texto em `notas_preparo`, missões/relógios do BKLG-012, reuso de `/ia/assistir` com parse de texto) e riscos. OK.
- Open Questions bem delimitadas. Recomendações: (1) manter o botão de proposta só no editor de sessão não visível, como pedido; (2) enviar fios resolvidos como "já resolvidos" é útil e barato (títulos curtos), manter; (3) piso de 300 caracteres por sessão é um ponto de partida razoável, medir em campanha grande.
- Diagrama: não exigido (fluxo linear UI → rota → motor → provedor; lista simples).
- Corrigir uma inconsistência: o `design.md` diz "`ON DELETE SET NULL`" na Decisão 1 e no spec; ajustar conforme o achado da dimensão 2.

## 5. Ponte entre produto e técnico
Veredito: OK
- Os cinco pedidos do usuário (ler todas as sessões, lista editável, revisão item a item, realimentar o Rascunho, só do mestre) estão traduzidos em requirements testáveis e tasks.
- Dependência de sequência com a `ia-assistente-mestre` está declarada. Observação: o requirement "fios em aberto alimentam o Rascunho" depende de `rascunho_sessao`, que já existe no código (Notas de Preparo, só do mestre). OK.
- Atenção ao uso de "Rascunho" e "Notas de Preparo" nos textos: o destino do Rascunho é Notas de Preparo (corrigido em 2026-10-25); o spec e o design desta change já estão alinhados.

## Bloqueantes antes de implementar
- Nenhum.

## Ajustes importantes antes de implementar
1. Tratar a remoção de sessão explicitamente (zerar `sessao_origem_id`), já que o SQLite do projeto não aplica `ON DELETE SET NULL`.
2. Registrar migrador de pacote `011` → novo head e testar a importação; decidir o escopo real de exportação (ver dimensão 2).
3. Aceitação em lote transacional (`POST /fios/lote`).
4. Reaproveitar o coletor/orçamento de contexto da assistência em vez de duplicá-lo; remover o tipo `fios_narrativos` de `/ia/assistir` nesta change.
