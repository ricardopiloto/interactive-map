# Review — Arquiteto de Soluções

**Change:** slider-distancia-grafo-relacoes
**Data:** 2026-10-28
**Veredito geral:** Aprovado com ressalvas

Contexto lido: os quatro artefatos do disco; `openspec/specs/rede-relacoes/spec.md`; `frontend-v2/src/lib/graphLayout.ts`, `components/codex/RelationsGraph.tsx`, `components/ui/slider.tsx`, `routes/relacoes.tsx` (legenda). Stack: React 19 + react-zoom-pan-pinch, layout radial determinístico no cliente; sem backend envolvido.

## 1. Definição da arquitetura técnica
Veredito: OK
- Mudança puramente de cliente, com um parâmetro opcional `spacing` num módulo de layout puro: simples, testável, sem dependência nova (`@radix-ui/react-slider` já está no `package.json`).
- Escala logarítmica `2^(v/50)` com meio = 1× exato é a escolha certa; a igualdade bit a bit em `spacing = 1` está especificada e vira teste.
- Carga: layout O(n) memoizado; elencos de dezenas de nós; sem preocupação de escala.

## 2. Integração com a infraestrutura existente
Veredito: N/A
- Sem API, banco, deploy ou variável de ambiente. Entra no CHANGELOG do próximo release.

## 3. Qualidade de arquitetura e trade-offs
Veredito: Atenção
- **A1 (Atenção): a spec modifica só um dos requisitos que prometem não sobreposição.** O requisito "Seleção reorganiza o grafo por vínculo direto" também diz que os anéis devem "preservar a separação das caixas dos nós". Com `spacing < 1` isso fica contraditório com a spec principal. Incluir esse requisito no MODIFIED (ou reescrever a frase como "no espaçamento padrão ou maior").
- **A2 (Atenção): reenquadramento a cada passo do slider.** O efeito existente chama `fitToView` (sem seleção) e `setTransform` (com seleção) sempre que o `frame` muda; arrastar o slider zera o zoom/pan da pessoa a cada passo. Aceitável se for a decisão, mas deve ser explícita: ou reenquadrar só ao soltar (`onValueCommit`, já citado como plano B), ou preservar o zoom atual e só recentralizar. Recomendo decidir no design: aplicar o fator ao vivo (feedback imediato) e reenquadrar apenas no commit, mantendo o zoom durante o arrasto do slider.
- **A3 (menor): o `box` do layout depende dos nomes** (largura máxima) — o fator escala só os raios; confirmar que `origin`/largura do quadro usam `pad` não escalado (o design diz isso; vira caso de teste).
- Segurança/privacidade: nada a preservar além de não vazar nada; o estado nunca sai do navegador.
- Manutenibilidade: três funções de layout ganham o mesmo parâmetro; manter a ordem (box, gap, spacing) coerente e testada.

## 4. Documentação e decisões (ADRs)
Veredito: OK
- O design registra alternativas rejeitadas (escalar `gap`/`box`, escala linear, limitar o lado esquerdo, localStorage). Sem necessidade de diagrama.

## 5. Ponte entre produto e técnico
Veredito: OK
- O pedido (padrão no meio, mais longe/menos longe) está traduzido fielmente. A sobreposição ao aproximar é consequência aceita e explicitada. Questão de produto a registrar: o nome da aproximação extrema (0,5×) pode esconder nomes; o "Padrão" mitiga.

## Bloqueantes antes de implementar
- nenhum (A1 e A2 convém decidir antes do apply)
