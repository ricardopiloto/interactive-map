# Tasks

## 1. Decisões do mestre (respondidas em 2026-10-20)

- [x] 1.1 Versão alvo do FoundryVTT registrada pelo mestre: **v14** (a versão do sistema `wfrp4e` fica para uma fase futura com atores)
- [x] 1.2 Sistema do WoD registrado pelo mestre: **`wod20`**; confirmar o id exato do sistema só numa fase futura com atores (D4)
- [x] 1.3 Decidido pelo mestre: nenhum `Actor` (PJ nem NPC), tudo exportado como `JournalEntry`; NPCs visíveis por padrão, PJs desligados por padrão (opt-in); `notas_mecanicas`/`notas_preparo` em página restrita, só por opção

## 2. Verificações na documentação oficial do Foundry

- [x] 2.1 Confirmado na documentação da v14: páginas de `JournalEntry` referenciam entidades por `@UUID[DocumentType.ID]{rótulo}` e imagens por `src` de página de imagem ou `<img>` no texto; `JournalEntry` não tem campo `img` (ver «Verificações» em `design.md`)
- [x] 2.2 Formato decidido: **JSON próprio (estilo do pacote 097) mais imagens, lido por um módulo mínimo no Foundry**, que cria os documentos no mundo; padrão confirmado no módulo de referência `FVTT-DD-Import` (compatível com a v14). A importação de JSON solto sem módulo não é documentada, então a primeira entrega inclui manter esse módulo (custo registrado em D1)
- [ ] 2.3 **Teste único em mundo v14 (parte 1):** (já sabido: documento criado pelo GM nasce visível só para o GM) numa `JournalEntry` criada por script com `ownership: { default: 2 }` (elevada), com uma página de texto comum e outra com `ownership: { default: 0 }`, confirmar como um usuário jogador vê cada uma (entrada visível, página restrita oculta) e se o bloco `secret` funciona como alternativa. Define a escolha de D5
- [ ] 2.4 **Teste único em mundo v14 (parte 2):** numa cena de teste com `padding` 0 e outra com `padding` 0,25, criar uma `Note` em `x = 0,5 × width + sceneX` e `y = 0,5 × height + sceneY` e confirmar visualmente que o alfinete cai no centro da imagem em ambas; ler `scene.dimensions` para registrar `sceneX/sceneY`. Fecha a conversão de `Local` e decide se `Scene`/`Note` entram numa fase seguinte
- [x] 2.5 Seção «Verificações» de `design.md` atualizada com o que foi confirmado, o que não é coberto pela documentação, e a tabela D3 e a D5 ajustadas

## 3. ADR e documentação

- [ ] 3.0 Refletir na spec `ponte-foundryvtt` que o módulo eleva `ownership` só de entradas visíveis (padrão do Foundry é oculto) e mantém páginas `notas_*` em NONE explícito
- [ ] 3.1 Criar `docs/adr/0001-ponte-foundryvtt.md` a partir de `design.md` (contexto, decisão, alternativas descartadas, consequências, verificações resolvidas), com status «Aceito» só depois das seções 1 e 2
- [ ] 3.2 Atualizar `docs/backlog/backlog.md`: BKLG-041 passa a «Decidido» com link para o ADR; BKLG-043 ganha a referência ao ADR e a nota de que o escopo restante deve ser revisto à luz do BKLG-045 (loot e PNGs genéricos já cobertos); BKLG-046 ganha a nota de que não pode introduzir schema de ficha
- [ ] 3.3 Rodar `openspec validate ponte-foundryvtt-adr` e confirmar que a change é válida

## 4. Verificação final

- [ ] 4.1 Reler a spec `ponte-foundryvtt` contra o ADR final e confirmar que cada requisito tem correspondência na decisão (nenhum requisito órfão, nenhuma decisão contrária à spec)
- [ ] 4.2 Confirmar que nenhum arquivo de código foi alterado por esta change (`git status` só mostra `docs/` e `openspec/`)

## Workflow follow-up

- Arquivar esta change (`openspec archive ponte-foundryvtt-adr`) depois do ADR aceito; a spec principal `ponte-foundryvtt` passa a ser critério de revisão.
- A implementação da exportação (formato, endpoint, UI) é uma change **separada**, a propor depois que as seções 1 e 2 estiverem fechadas.
