# Review — Arquiteto de Soluções

**Change:** fios-origem-sessao-editor
**Data:** 2026-10-27
**Veredito geral:** Aprovado com ressalvas

## 1. Definição da arquitetura técnica
Veredito: OK
- Mudança confinada a um componente de frontend (`FiosReview.tsx`) e a uma string de prompt no backend (`motor_ia_assistente.py`); sem nova stack, rota, tabela ou migração. O `sessaoId` já chega ao componente (`SessionEditor.tsx`: `sessaoId={draft.id ?? null}`) e a rota de lote já valida `sessao_origem_id` (`routers/admin/fios.py`, `_validate_sessao`). Coerente com o desenho existente.
- Escala: sem impacto.

## 2. Integração com a infraestrutura existente
Veredito: OK
- Sem deploy, variável de ambiente, banco ou exportação novos. O campo `sessao_origem_id` já faz parte do pacote de exportação/importação (spec `fios-narrativos`), então fios com a nova origem exportam e importam sem ajuste.
- Sem retroatividade: fios existentes (como os da sessão 29 de teste, com origem `NULL`) não mudam, e isso está dito no design.

## 3. Qualidade de arquitetura e trade-offs
Veredito: Atenção
- **Semântica do campo muda.** `sessao_origem_id` passa a significar «sessão em cujo editor o fio foi aceito», não «sessão onde o fato nasceu narrativamente» (a IA propõe fios a partir de todas as sessões). O design registra a perda da sessão citada pela IA (Riscos), mas a spec principal (`fios-narrativos`) ainda descreve o campo de forma genérica («sessão de origem opcional»). Recomendação: o delta deveria também ajustar a descrição do campo no requisito «Lista de fios narrativos só do mestre» ou, no mínimo, deixar a nova definição explícita num único lugar para não haver duas leituras.
- **Bloco e filtro continuam coerentes**: `GET /fios?sessao_origem_id=` e o bloco «Fios Narrativos» não mudam.
- **Ambiguidade de produto:** uma sessão com vários lotes de proposta acumula os fios de todos; aceitável, e coerente com «fios criados nesta sessão».
- **Fios manuais** criados na lista da página continuam sem sessão de origem e nunca aparecem no bloco de uma sessão. Está fora de escopo, mas é a causa da mesma queixa para quem cria fios à mão; vale registrar como follow-up (permitir escolher a sessão ao criar).
- **Segurança:** sem mudança; validação de sessão no servidor preservada; fios continuam só do mestre.

## 4. Documentação e decisões (ADRs)
Veredito: OK
- `design.md` tem as duas decisões, alternativa rejeitada para a origem (campo novo, sem consumidor e com migração) e riscos. Para a decisão do Resumo falta registrar a alternativa rejeitada (enviar os fios ao Resumo), embora a proposta cite que o produto a descartou. Recomendação: uma linha no design.
- Diagrama desnecessário.

## 5. Ponte entre produto e técnico
Veredito: OK
- As duas escolhas do usuário (origem = sessão do editor; Resumo sem fios abertos) foram traduzidas diretamente. O diagnóstico foi conferido nos dados da campanha de teste (fios `origem=ia` com `sessao_origem_id` nulo; Resumo com seção «Fios em aberto»).
- Expectativa a alinhar: os fios já existentes não aparecerão no bloco da sessão 29 sem reaceitar ou editar a origem.

## Bloqueantes antes de implementar
- nenhum

## Ajustes recomendados (não bloqueantes)
1. Alinhar a descrição do campo «sessão de origem» na spec principal com a nova semântica.
2. Registrar no design a alternativa rejeitada para o Resumo.
3. Registrar como follow-up a criação manual de fio com sessão de origem.
