# Auditoria dos consumidores de espaçamento

Auditoria realizada antes da alteração da escala. As capturas Home já mantidas em `frontend/e2e/quality.spec.ts-snapshots/` são o baseline visual disponível. Capturas Playwright novas para Explorar/Sessões e a revisão navegável ainda dependem da instalação do Chromium compatível com a versão atual do Playwright.

## Escala observada e alvo

| Token | Antes | Depois | Consumidores afetados |
|---|---:|---:|---|
| `--space-1` | 4px | 4px | Sem alteração |
| `--space-2` | 8px | 8px | Sem alteração |
| `--space-3` | 12px | 12px | Sem alteração |
| `--space-4` | 16px | 16px | Sem alteração |
| `--space-5` | 20px | 24px | 12 referências: `global.css` (padding de card); `NovoCodexPage.css` (padding superior, cartões e distância das ações); `ExplorarPage.css` (margem inferior da toolbar); `SessoesPage.css` (título e separação dos itens); `HomePage.css` (gap dos passos, que já tinha fallback de 24px). Quatro gutters horizontais da Home e um de Explorar preservam 20px como exceção deliberada, descrita abaixo. |
| `--space-6` | 24px | 32px | 7 referências: Home (padding inferior do hero e gap do hero), Explorar (padding superior), Sessões (padding superior e gap da lista), Style Guide (padding externo e margem do preview) e UI kit (EmptyState). Fallbacks existentes de 2rem já indicavam 32px nos casos Home/Explorar. |
| `--space-7` | 48px | 48px | Sem alteração |
| `--space-8` | 32px | removido | A margem inferior do conteúdo de Sessões foi remapeada para `--space-6`, agora 32px. |

O estado desta branch contém 20 usos CSS dos níveis 5–8: 12 de `space-5`, 7 de `space-6` e 1 de `space-8`. Os totais do plano inicial (207 referências e 21 fallbacks) foram atualizados durante a execução: a busca atual encontrou 22 declarações `var(--space-N, fallback)` em CSS, incluindo declarações repetidas na mesma regra.

## Decisões por consumidor afetado

| Arquivo / consumidor | Antes / intenção | Destino | Motivo |
|---|---|---|---|
| `frontend/src/styles/global.css` — `.card` | `space-5`, padding interno médio | `space-5` = 24px | A escala torna esse nível o incremento médio; mantém semântica de padding de cartão. |
| `frontend/src/pages/NovoCodexPage.css` — container, cartões/sucesso e ações | `space-5` | `space-5` = 24px | Padding e respiro de ações seguem o nível médio canônico. |
| `frontend/src/pages/ExplorarPage.css` — toolbar | margem inferior `space-5` | `space-5` = 24px | Mantém separação clara entre filtros e resultados. |
| `frontend/src/pages/SessoesPage.css` — título e itens | `space-5` | `space-5` = 24px | Mantém o mesmo ritmo entre título, borda e conteúdo da sessão. |
| `frontend/src/pages/HomePage.css` — gap dos passos | `space-5` com fallback de 1.5rem | `space-5` = 24px | O fallback existente já confirmava o tamanho canônico pretendido. |
| `frontend/src/pages/HomePage.css` — hero, passos, gêneros e showcase | gutter horizontal `space-5` com fallback de 1.25rem | 1.25rem (20px), exceção documentada | O gutter de página usa 20px no baseline e o fallback confirma essa intenção; mantê-lo evita deslocar o alinhamento dos conteúdos. |
| `frontend/src/pages/ExplorarPage.css` — gutter horizontal | `space-5` com fallback de 1.25rem | 1.25rem (20px), exceção documentada | Mesmo gutter de página da Home; mantém alinhamento do catálogo em larguras menores. |
| `frontend/src/pages/HomePage.css` — hero | `space-6` para padding inferior e gap, ambos com fallback 2rem | `space-6` = 32px | O fallback existente é 32px e coincide com o nível canônico. |
| `frontend/src/pages/ExplorarPage.css` — padding superior | `space-6` com fallback 2rem | `space-6` = 32px | O fallback existente já indicava 32px. |
| `frontend/src/pages/SessoesPage.css` — topo e gap da lista | `space-6` | `space-6` = 32px | Usa o nível grande para separar a página e as sessões. |
| `frontend/src/pages/SessoesPage.css` — padding inferior | `space-8` (32px) | `space-6` (32px) | Remapeamento sem mudança visual, elimina a referência indefinida após remoção do nível 8. |
| `frontend/src/pages/StyleGuidePage.css` — página e preview | `space-6` | `space-6` = 32px | Espaçamento de seção amplo, consistente com o protótipo. |
| `frontend/src/components/ui/ui.css` — EmptyState | `space-6` | `space-6` = 32px | Mantém respiro de estado vazio como componente compartilhado. |

As referências de nível 1–4 não mudam de valor. A inspeção das páginas e componentes representativos deve confirmar as decisões acima depois que a execução de navegador estiver disponível.

## Fallbacks verificados

| Consumidor | Fallback observado | Resultado da auditoria |
|---|---:|---|
| Home: `space-7` | 3rem / 48px | Mantido, corresponde ao token. |
| Home: `space-6` | 2rem / 32px (2 declarações) | Mantido, corresponde ao token após alinhamento. |
| Home: `space-5` | 1.5rem / 24px | Mantido, corresponde ao token após alinhamento. |
| Home: gutter horizontal `space-5` | 1.25rem / 20px (4 declarações) | Token substituído por valor explícito 1.25rem para registrar a exceção sem fallback contraditório. |
| Explorar: `space-6` / `space-7` | 2rem / 32px e 3rem / 48px | Mantidos, correspondem aos tokens após alinhamento. |
| Explorar: gutter horizontal `space-5` | 1.25rem / 20px | Token substituído por valor explícito 1.25rem para registrar a exceção sem fallback contraditório. |
| Route Digitizer: `space-4` | 0.75rem / 12px (4 declarações) | Corrigido para 1rem / 16px, o valor canônico de `space-4`. |
| Route Planner: `space-4` / `space-3` | 1rem / 16px e 0.75rem / 12px | Mantidos; ambos coincidem com os tokens. |

As exceções de gutter são as únicas medidas CSS de 20px mantidas para preservar o alinhamento horizontal de página. As 22 declarações de fallback originais foram verificadas por busca; os valores canônicos e exceções acima não deixam fallback contraditório.

## Baseline e revisão visual

- Há snapshots atuais da Home para pt-BR/en, tema claro/escuro em desktop e tema claro em mobile.
- A matriz Playwright foi ampliada para incluir Explorar e Sessões nos mesmos modos e viewports.
- A tentativa de executar o baseline não abriu o navegador: o executável Chromium headless esperado pelo Playwright 1.63 (build 1243) não está instalado; somente o build 1228 está no cache local. A revisão final das capturas e atualização intencional dos snapshots fica pendente até disponibilizar o navegador compatível.
