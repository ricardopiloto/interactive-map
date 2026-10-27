# Review — Arquiteto de Soluções

**Change:** pagina-fios-narrativos
**Data:** 2026-10-27
**Veredito geral:** Aprovado com ressalvas

## 1. Definição da arquitetura técnica
Veredito: OK
- Mudança só de frontend (nova rota filha, item de navegação, reorganização de `FiosList` e remoção da lista de `sessoes.tsx`), sobre a stack existente (React + react-router, `campaignChildren()` único, i18n por namespace). Sem backend, API ou banco novos; `/admin/fios` continua com `require_dono` no roteador (`routers/admin/fios.py`).
- Escala: o volume de fios por campanha é pequeno (dezenas); lista simples com `<details>` basta, sem paginação.

## 2. Integração com a infraestrutura existente
Veredito: OK
- Segue o padrão de rotas de campanha (`campaignRoutes.tsx`, forma canônica e compatível) e o de navegação (`Shell.tsx`, barra superior e inferior). Nenhum impacto em deploy, banco, backup ou exportação.
- Sem retrocompatibilidade a manter além do âncora `#fios-em-aberto`, interno e não documentado.

## 3. Qualidade de arquitetura e trade-offs
Veredito: Atenção
- **Permissão do item de navegação diverge do dono.** O design (Decisão 3) fala em `canEdit && enabled`, mas no `EditModeContext` `canEdit` é verdadeiro para qualquer membro com sessão administrativa (`canEdit: true` para qualquer papel), enquanto `isDono` só vale para o mestre dono. A spec diz «somente o mestre dono» e a API usa `require_dono`: um editor não dono veria o item e a página, e receberia 403. Recomendação: usar `isDono && enabled` para o item e para a página (e `ready` para não mostrar «só do mestre» antes de a permissão carregar); `canEdit` seria o critério de «Ferramentas», não de Fios.
- **Itens de navegação que aparecem/somem com o Modo GM.** Ferramentas depende só de permissão; Fios dependeria também do Modo GM, então a barra muda de tamanho ao ligar/desligar o modo (especialmente na barra inferior do celular). É coerente com a regra existente da lista, mas é um comportamento novo da barra: vale registrar como decisão e testar o layout nos dois estados.
- **Barra inferior com sete itens.** O design já registra o risco e o plano de contingência (mover para atalho em Sessões). Aceito, desde que a decisão seja tomada na verificação manual com 320 px.
- Sincronização bloco↔lista passa a ser por recarga ao abrir a sessão; aceitável e documentada. Observação: se o bloco da sessão ficar montado durante a navegação (cache de rota), a recarga ao montar precisa ser garantida pelo teste.
- Segurança: dados de fios continuam só via API do dono; a página não coloca dados em tela pública.

## 4. Documentação e decisões (ADRs)
Veredito: OK
- `design.md` traz Context, Goals/Non-Goals, 5 decisões com alternativas rejeitadas (painel em Sessões, dropdown global), riscos, migração e questão aberta. Diagrama desnecessário.

## 5. Ponte entre produto e técnico
Veredito: OK
- «Sessão dedicada em menu suspenso, como a timeline» foi interpretada como página própria com cartões `<details>` (padrão da Cronologia), confirmada pelo usuário. Mesmas ações, sem mudar regras nem API, como pedido.
- Ponto a alinhar com o produto: a proposta de fios por IA continua no editor da sessão (precisa da sessão de origem); a página «Fios» não tem botão de IA. Está no escopo do proposal; vale reconfirmar na verificação manual.

## Bloqueantes antes de implementar
- nenhum

## Ajustes recomendados (não bloqueantes)
1. Trocar `canEdit` por `isDono` na Decisão 3 e nas tarefas 1.1/1.2/4.1, incluindo o estado `ready`.
2. Registrar no design que o item de navegação depende do Modo GM e testar a barra superior e a inferior nos dois estados.
3. Garantir por teste que o bloco da sessão recarrega os fios ao abrir a sessão depois de mudanças na página «Fios».
