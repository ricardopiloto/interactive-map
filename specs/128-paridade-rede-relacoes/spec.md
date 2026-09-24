# Feature Specification: Auditoria de paridade da Rede de Relações

**Feature Branch**: `128-paridade-rede-relacoes`

**Created**: 2026-09-23

**Status**: Draft

**Input**: User description: "Analisar tecnicamente o item BKLG-018 e garantir que a reconstrução da Rede de Relações não perdeu critérios técnicos nem identificações visuais do PRD/main. Manter o frontend e a interação desta branch. Verificar, entre outros pontos, identificação de vínculos privados para o GM, linhas retas, posicionamento relativo de PJs e NPCs, e cores dos tipos de vínculo claras e nitidamente diferentes."

## Constitution *(constraints; not implementation)*

- Isolamento: MUST preservar a separação entre dados e sentidos de vínculo visíveis ao GM e aos jogadores; nenhuma informação privada pode ser inferida a partir da visão pública.
- Legado: esta spec não altera instâncias de produção legadas.
- Simplicidade: preservar os dados e regras existentes; não introduzir armazenamento ou serviço novo para representar o significado visual.
- Interface: qualquer texto novo MUST estar em pt-BR e en; nomes, notas e conteúdo de campanha continuam no idioma escrito pelo GM.

## User Scenarios & Testing

### User Story 1 - GM distingue vínculos privados e sentidos secretos (Priority: P1)

Como GM, quero reconhecer no grafo quais vínculos são privados e quais sentidos de uma relação não são conhecidos pelos jogadores, para revisar a rede completa sem confundir informações secretas com relações públicas.

**Why this priority**: A distinção sustenta o uso da rede durante a preparação e a sessão e reduz o risco de revelar acidentalmente informação narrativa.

**Independent Test**: Criar ou usar vínculos públicos, privados e de duas vias com um ou ambos os sentidos desconhecidos. Conferir o grafo e o detalhe no modo GM e repetir como jogador para confirmar que apenas a informação autorizada fica visível.

**Acceptance Scenarios**:

1. **Given** dois vínculos do mesmo tipo, um público e outro privado, **When** o GM observa o grafo, **Then** consegue identificar sem abrir o formulário qual deles está oculto aos jogadores.
2. **Given** um vínculo de duas vias com apenas um sentido conhecido pelos jogadores, **When** o GM observa o grafo e o detalhe, **Then** os sentidos conhecidos e secretos ficam distinguidos e identificados pela direção.
3. **Given** um jogador observa a mesma campanha, **When** existem vínculos privados ou sentidos desconhecidos, **Then** os estados secretos, tipos, qualificadores e notas não são revelados por linhas, rótulos, legenda, detalhes ou outros indicadores.
4. **Given** o GM altera a visibilidade ou o conhecimento de um sentido, **When** a rede é atualizada, **Then** os indicadores passam a representar o estado salvo sem alterar os dados narrativos do vínculo.

### User Story 2 - Usuário interpreta o grafo com linhas e cores legíveis (Priority: P1)

Como jogador ou GM, quero distinguir relações pelo traçado, pela cor e pelos rótulos, para entender rapidamente os vínculos sem depender de uma única pista visual.

**Why this priority**: A rede só é útil quando a semântica dos vínculos pode ser lida com clareza, inclusive em grafos densos, nos dois temas e por pessoas com diferentes percepções de cor.

**Independent Test**: Abrir grafos de baixa e alta densidade nos temas claro e escuro; identificar os oito tipos e as relações de duas vias pela linha, cor, padrão e rótulos, inclusive com zoom reduzido e sem depender exclusivamente da cor.

**Acceptance Scenarios**:

1. **Given** vínculos entre personagens, **When** o grafo é exibido, **Then** cada relação usa segmentos retos; relações de duas vias podem usar segmentos paralelos retos, sem curvatura.
2. **Given** os oito tipos de vínculo, **When** o usuário consulta o grafo e os controles que explicam os tipos, **Then** as cores são claras e nitidamente distintas entre os tipos, com padrão e/ou rótulo complementar para que nenhum tipo dependa apenas da cor.
3. **Given** os temas claro e escuro, **When** uma linha, amostra ou rótulo é apresentado, **Then** permanece legível sobre o fundo e distinguível das demais categorias.
4. **Given** vínculos sobrepostos, bidirecionais ou filtrados, **When** o usuário foca uma relação, **Then** suas direções, tipos e qualificadores continuam associados às linhas corretas.

### User Story 3 - PJ e NPC mantêm posicionamento compreensível no palco (Priority: P1)

Como usuário da rede, quero que os grupos de PJ e NPC permaneçam organizados em relação ao centro visível do grafo, para localizar personagens e compreender foco e vizinhança em diferentes tamanhos de tela.

**Why this priority**: A disposição dos nós dá contexto imediato à rede e precisa continuar utilizável depois da troca de casca da página.

**Independent Test**: Abrir uma campanha com PJs e NPCs em desktop e móvel, com o painel em seus estados recolhido e expandido; conferir visão geral, seleção de personagem, vizinhos diretos e ajuste de zoom.

**Acceptance Scenarios**:

1. **Given** uma campanha com PJs e NPCs, **When** a visão geral abre, **Then** os grupos permanecem visualmente distinguíveis e organizados em relação à área útil visível, sem ficarem encobertos pelo painel flutuante.
2. **Given** um personagem selecionado, **When** o grafo organiza o foco, **Then** o personagem selecionado e seus vínculos diretos ocupam posições compreensíveis, e os demais personagens continuam localizáveis.
3. **Given** uma tela estreita ou painel recolhido/expandido, **When** a área disponível muda, **Then** o grafo continua legível e os controles de zoom permitem reenquadrar a rede sem perder seleção ou semântica.
4. **Given** uma campanha sem PJs, sem NPCs ou sem vínculos, **When** a rede abre, **Then** a disposição restante não causa erro nem apresenta um estado enganoso.

### User Story 4 - Usuário conserva os fluxos atuais da rede (Priority: P2)

Como jogador ou GM, quero manter os filtros, busca, seleção, detalhe e edição da Rede de Relações, para continuar usando os mesmos fluxos na interface atual enquanto os critérios visuais são reconciliados.

**Why this priority**: A auditoria deve corrigir perdas confirmadas sem desfazer a reconstrução de interface já desenvolvida.

**Why this priority**: Mantém o valor da reconstrução e permite corrigir a paridade funcional sem uma reversão de design.

**Independent Test**: Percorrer os fluxos correntes de lista, grafo, detalhe e edição sem mudar a estrutura de painel estabelecida nesta branch.

**Acceptance Scenarios**:

1. **Given** a interface atual, **When** o usuário busca, filtra ou seleciona na lista ou no grafo, **Then** a seleção, os vínculos exibidos e o detalhe continuam sincronizados.
2. **Given** um GM em modo de edição, **When** cria, edita ou remove personagem ou vínculo, **Then** permissões, validação, persistência e atualização do grafo permanecem corretas.
3. **Given** a experiência móvel, **When** o usuário alterna entre lista, detalhe e palco, **Then** o painel flutuante atual permanece a estrutura da página; a coluna fixa e o painel de detalhe separados de `main` não são restaurados.

### Edge Cases

- Um vínculo é privado, ou um dos sentidos é secreto, enquanto o outro sentido é público.
- Os dois sentidos de uma relação usam tipos diferentes ou direções opostas.
- Vários vínculos entre nós próximos se sobrepõem visualmente.
- O grafo tem muitos nós, somente um tipo de personagem, busca ativa, filtros combinados ou seleção fora da área inicialmente visível.
- Tema claro/escuro, zoom mínimo/máximo, viewport móvel e painel recolhido/expandido.
- Dados legados sem campos de visibilidade ou conhecimento explícitos devem continuar respeitando os valores padrão existentes.

## Requirements

### Functional Requirements

- **FR-001**: A página MUST manter o painel flutuante atual e o fluxo de lista/detalhe da branch; MUST NOT restaurar a coluna fixa e o painel de detalhe independente de `main`.
- **FR-002**: A auditoria MUST mapear todos os critérios funcionais e visuais aplicáveis do manual de Relações, das specs anteriores e da implementação de `main` como preservados, alterados intencionalmente ou regressões confirmadas.
- **FR-003**: O GM MUST conseguir distinguir visualmente um vínculo privado de um vínculo visível aos jogadores no grafo e no detalhe, sem precisar abrir o formulário de edição.
- **FR-004**: No modo de jogador, vínculos privados e os detalhes de sentidos desconhecidos MUST permanecer ocultos; os indicadores visuais MUST NOT revelar a existência, o tipo, o qualificador ou a nota de conteúdo secreto.
- **FR-005**: Relações MUST ser desenhadas como linhas retas. Vínculos de duas vias MUST manter direção e identidade de cada sentido legíveis; linhas paralelas retas são permitidas para separar dois sentidos.
- **FR-006**: Os oito tipos de vínculo MUST possuir cores claras e nitidamente distinguíveis entre si nos dois temas. Cor MUST ser complementada por padrão, espessura, rótulo ou outra pista visual, para que o tipo não dependa somente da cor.
- **FR-007**: A amostra visual dos tipos nos controles de filtro/legenda MUST refletir o estilo usado no grafo, e os nomes dos tipos MUST permanecer disponíveis em texto.
- **FR-008**: O posicionamento inicial MUST organizar PJs e NPCs de forma distinguível em relação ao centro da área útil do grafo, sem encobrir nós essenciais pelo painel; o posicionamento com foco MUST preservar personagem central, vínculos diretos e personagens restantes de modo compreensível.
- **FR-009**: Busca, filtros de tipo e estado, isolamento, seleção pelo grafo e pela lista, detalhe, zoom, pan e fluxos de edição do GM MUST continuar funcionais segundo os critérios aprovados da Rede de Relações.
- **FR-010**: A revisão de privacidade MUST confirmar que a vista de jogador recebe apenas relações permitidas e que indicadores de segredo são exclusivos ao GM; a interface MUST reutilizar os estados de privacidade já existentes.
- **FR-011**: Strings novas de estado visual, ajuda ou acessibilidade MUST existir em pt-BR e en; nomes, notas e qualificadores escritos pelo GM MUST permanecer inalterados.
- **FR-012**: O manual de Relações e a spec de referência MUST ser atualizados para documentar a interface e os critérios aprovados, incluindo diferenças intencionais em relação a `main`.

### Key Entities

- **Vínculo**: Relação entre dois personagens, com tipo, direção, eventual segundo sentido, visibilidade para jogadores e conhecimento por sentido.
- **Perspectiva do vínculo**: Informação que cada sentido comunica ao GM e aos jogadores; sentidos secretos não devem ser inferíveis pela apresentação pública.
- **Tipo de vínculo**: Uma das oito categorias reconhecidas, identificada por cor, amostra de traço e texto.
- **Personagem no grafo**: PJ ou NPC posicionado na visão geral ou em relação a um personagem focado.

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% dos critérios técnicos e visuais aplicáveis identificados no manual, nas specs de Relações e em `main` aparecem na matriz final de paridade com um estado e justificativa.
- **SC-002**: Em 100% dos cenários de aceitação com vínculos públicos, privados e de duas vias com sentidos secretos, revisores GM identificam o estado de cada relação corretamente sem abrir o editor; jogadores não conseguem inferir qualquer conteúdo secreto pela interface.
- **SC-003**: Revisores identificam corretamente 8 de 8 tipos nos temas claro e escuro por meio da combinação de cor, traço e texto, inclusive em grafo denso; nenhum tipo depende exclusivamente da cor.
- **SC-004**: 100% das relações desenhadas no grafo usam segmentos retos e preservam a leitura de direções e rótulos nos cenários de aceitação.
- **SC-005**: PJs e NPCs permanecem localizáveis sem sobreposição com o painel em 100% dos cenários desktop e móvel da matriz de revisão.
- **SC-006**: Nenhum fluxo funcional aprovado de busca, filtragem, isolamento, seleção, detalhe ou edição do GM é perdido após as correções de paridade.

## Assumptions

- A interface e o modelo de interação em desenvolvimento nesta branch são a base aprovada; critérios conflitantes sobre estrutura da página não implicam restauração do layout antigo.
- As orientações explícitas atuais — linhas retas e cores claramente distintas por tipo — são a referência para esta auditoria se divergirem de decisões visuais anteriores, incluindo a curvatura e as quatro famílias de cor descritas na spec 105.
- As regras de visibilidade pública e conhecimento por sentido já existem nos dados; a spec trata de preservar o comportamento de privacidade e tornar os estados compreensíveis ao GM.
- O recorte técnico deve incluir [`docs/manual-relacoes.md`](../../docs/manual-relacoes.md), specs 068, 071, 073, 081, 086–089, 105 e 116, além da implementação atual e da versão em `main`.
- Não se presume a criação de novos estados de negócio ou serviços; se a análise encontrar uma lacuna que exija isso, a etapa de planejamento deve explicar a necessidade e a alternativa mais simples.
