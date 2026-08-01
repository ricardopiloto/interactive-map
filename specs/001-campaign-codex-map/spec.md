# Feature Specification: Codex da Campanha — Mapa Interativo

**Feature Branch**: `001-campaign-codex-map`

**Created**: 2026-08-01

**Status**: Draft

**Input**: User description: "Leia toda a proposta criada em docs/prd-mapa-campanha-rpg(2).md e crie as features com base no que foi feito no protótipo que está em prototype"

## Clarifications

### Session 2026-08-01

- Q: Quando jogadores com a página aberta veem edições do GM? → A: Sob demanda — só ao recarregar ou reabrir a página (sem sync ao vivo nem polling).
- Q: Formato da “data da sessão” nos locais? → A: Texto livre (sem validação de calendário); ordenação na História usa ordem do arco e, dentro do arco, ordem de cadastro quando o rótulo não for interpretável como data.
- Q: Como reposicionar pin de local já existente? → A: Na edição, opção de reposicionar com clique no mapa (mesmo padrão de mover o grupo).
- Q: Como o GM autentica na experiência de uso? → A: Só na borda (credencial exigida pelo proxy/navegador antes de carregar a área de edição); a app não tem formulário próprio de senha.
- Q: Conteúdo inicial no primeiro deploy? → A: Produção inicia vazia; seed de exemplo só para dev/teste.
- Q: *(Amendment)* Paleta visual? → A: Tokens Nocturne do protótipo (`prototype/nocturne.css`: bg `#161826`, surface `#232532`, text `#e9e9ed`, accent `#9184d9`).
- Q: *(Amendment)* Admin pode ficar aberto em localhost sem Caddy? → A: Não. Senha obrigatória sempre: Basic Auth na API `/api/admin/*` (fail closed) + gate de credencial na UI `/admin`; Caddy permanece como camada extra em produção.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Explorar o mapa e os locais visitados (Priority: P1)

Um jogador abre o link público da campanha e vê o mapa de fundo com pins dos locais já visitados e o ícone do grupo na posição atual. Ele pode aproximar, afastar e arrastar o mapa. Ao tocar ou clicar num pin, abre um painel com nome, descrição do que aconteceu, rótulo de sessão (se houver), arco relacionado e NPCs encontrados — com atalhos para ir até esses conteúdos.

**Why this priority**: É o valor central do produto — visão espacial da jornada. Sem isso, o Codex não existe.

**Independent Test**: Com um conjunto de dados de teste carregado (seed só em ambiente de dev/teste), um visitante sem login consegue ver o mapa, interagir com zoom/pan, abrir um pin e ler os detalhes. Em produção vazia, o mesmo fluxo valida placeholder do mapa e listas vazias.

**Acceptance Scenarios**:

1. **Given** a campanha tem locais e posição de grupo cadastrados, **When** o jogador abre a página principal, **Then** o mapa aparece com todos os pins e o ícone do grupo nas posições corretas.
2. **Given** o mapa está visível, **When** o jogador usa zoom (+/−/rodinha/pinça) ou arrasta, **Then** a vista se move/escala sem perder a referência dos pins.
3. **Given** há um pin no mapa, **When** o jogador clica/toca nele, **Then** um painel mostra nome, descrição, rótulo de sessão (se existir), arco e NPCs ligados.
4. **Given** o painel de um local está aberto, **When** o jogador clica no nome de um NPC ou arco, **Then** a navegação leva à seção correspondente desse conteúdo.
5. **Given** o mapa está em tela, **When** o jogador consulta a legenda, **Then** consegue distinguir visualmente pin de local e ícone do grupo.

---

### User Story 2 - Consultar locais, NPCs e história pelo menu (Priority: P2)

O jogador usa o menu lateral (desktop) ou a barra inferior + painel (mobile) com três abas: Locais, NPCs e História. Em Locais, busca por nome e, ao escolher um item, o mapa centra no pin e abre os detalhes. Em NPCs, vê lista com retrato/status, expande para ler descrição, facção e locais onde apareceu. Em História, vê arcos ordenados; ao expandir um arco, vê a lista cronológica de eventos/locais daquele arco e pode saltar para o pin.

**Why this priority**: Cumpre a meta de achar lore de um NPC/local em poucos segundos entre sessões, complementar ao mapa.

**Independent Test**: Sem abrir o mapa primeiro, o jogador navega só pelo menu, encontra um NPC e um arco, e a partir deles chega ao local no mapa.

**Acceptance Scenarios**:

1. **Given** vários locais cadastrados, **When** o jogador digita parte do nome na busca de Locais, **Then** a lista mostra apenas os que batem com o filtro.
2. **Given** um local na lista, **When** o jogador o seleciona, **Then** o mapa centra nesse pin e o painel de detalhes abre.
3. **Given** a aba NPCs, **When** o jogador seleciona um NPC, **Then** vê descrição, status, facção (se houver) e chips dos locais onde apareceu.
4. **Given** um chip de local no perfil do NPC, **When** o jogador clica, **Then** o mapa centra no pin correspondente.
5. **Given** a aba História, **When** o jogador expande um arco, **Then** vê o resumo e a lista de eventos/locais daquele arco com o rótulo de sessão (texto livre) quando disponível, na ordem de cadastro dentro do arco.
6. **Given** uso em tela estreita (mobile), **When** o jogador troca de aba na barra inferior, **Then** o painel de conteúdo abre sobre o mapa e pode voltar ao mapa com um controle claro.

---

### User Story 3 - GM gerencia locais no mapa (Priority: P3)

O mestre entra na área restrita de edição (após autenticação). Na aba Locais, cria um novo local entrando em modo “clique no mapa para posicionar”, preenche nome, descrição, rótulo de sessão (texto livre), arco e NPCs presentes, e salva. Também edita e exclui locais existentes (com confirmação na exclusão) e, na edição, pode reposicionar o pin com um novo clique no mapa. Após salvar, o próprio GM vê o resultado na mesma sessão; jogadores veem o conteúdo atualizado na próxima carga ou reabertura da página (sem atualização ao vivo).

**Why this priority**: Sem edição pelo GM, o Codex não evolui com a campanha; o PRD exige adicionar conteúdo em menos de ~2 minutos após a sessão.

**Independent Test**: Autenticado como GM, criar um pin novo pelo clique no mapa, editá-lo e excluí-lo; em outra sessão anônima, ver o resultado (exceto após exclusão).

**Acceptance Scenarios**:

1. **Given** o GM autenticado na aba Locais, **When** inicia “Novo local” e clica no mapa, **Then** abre o formulário com a posição relativa capturada.
2. **Given** o formulário de local preenchido com nome obrigatório, **When** salva, **Then** o pin aparece no mapa na posição escolhida e na lista.
3. **Given** um local existente, **When** o GM edita e salva e um jogador recarrega ou reabre a página, **Then** o jogador vê o conteúdo atualizado.
4. **Given** um local existente em edição, **When** o GM ativa reposicionar e clica no mapa, **Then** a nova posição relativa é aplicada ao pin ao salvar (ou conforme o fluxo de confirmação da edição).
5. **Given** um local existente, **When** o GM confirma exclusão, **Then** o pin e a entrada somem da lista e do mapa.
6. **Given** modo de posicionamento ativo (novo local ou reposicionar), **When** o GM cancela, **Then** nenhuma posição nova é persistida e o mapa volta ao uso normal.

---

### User Story 4 - GM gerencia NPCs, arcos e posição do grupo (Priority: P4)

No modo GM (área `/admin` acessível só após autenticação com senha — validada no servidor e reforçada na borda em produção), o mestre cria/edita/exclui NPCs (nome, descrição, facção, status) e arcos (título, resumo, ordem). Há uma aba Grupo só nessa área para reposicionar o ícone do grupo clicando no mapa. Quem não autentica não entra no shell de edição e permanece na visão pública só leitura.

**Why this priority**: Completa o ciclo pós-sessão do GM; depende do mapa e das entidades já existirem (P1–P3).

**Independent Test**: Como GM autenticado na borda, criar um NPC e um arco, ligar um local a eles, mover o grupo; como jogador na visão pública, ver NPC, arco e nova posição do grupo após recarregar.

**Acceptance Scenarios**:

1. **Given** GM autenticado na área de edição, **When** cria um NPC com nome e status, **Then** o NPC aparece na lista pública de NPCs após o jogador recarregar.
2. **Given** GM autenticado, **When** cria/edita um arco com título, resumo e ordem, **Then** a aba História pública reflete a ordem e o conteúdo na próxima carga.
3. **Given** GM autenticado na aba Grupo, **When** ativa mover e clica no mapa, **Then** o ícone do grupo vai para a nova posição e jogadores a veem ao recarregar.
4. **Given** um visitante sem credenciais de GM, **When** tenta abrir a área de edição ou alterar dados, **Then** é barrado pela autenticação de borda e/ou permanece só na visão de leitura.
5. **Given** credenciais inválidas no desafio de borda, **When** o GM tenta acessar a área de edição, **Then** o acesso é negado pelo navegador/proxy e a UI de edição não carrega.

---

### Edge Cases

- Mapa sem imagem de fundo ainda: a área do mapa permanece usável com placeholder claro, sem quebrar pins/lista.
- Campanha sem locais/NPCs/arcos: listas vazias com estado compreensível; mapa e ícone de grupo ainda aparecem.
- Local sem arco ou sem NPCs: painel omite ou indica ausência sem erro.
- Exclusão de arco/NPC ainda referenciado por locais: o sistema remove o vínculo ou impede a exclusão de forma previsível e comunicada (ver Assumptions).
- Coordenadas fora do intervalo válido: rejeitadas na edição; pins existentes sempre em posição relativa válida (0–1).
- Imagem ilustrativa/retrato ausente: UI usa placeholder; conteúdo textual continua acessível.
- Clique no mapa durante arraste (pan): não dispara criação de pin nem abertura acidental de modal.
- Dois modos de posicionamento (novo pin, reposicionar pin existente ou mover grupo) não ativos ao mesmo tempo.
- Jogador com a página aberta enquanto o GM edita: a vista do jogador permanece até ele recarregar ou reabrir; não há notificação automática de mudança.
- Credenciais inválidas no desafio de borda: a área de edição não carrega; não há segunda tela de senha dentro da app.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Visitantes MUST acessar a visão da campanha sem login.
- **FR-002**: O sistema MUST exibir um único mapa de campanha como fundo, com suporte a zoom e pan em desktop e mobile.
- **FR-003**: O sistema MUST renderizar pins de locais em coordenadas relativas à imagem (independentes de resolução de tela).
- **FR-004**: O sistema MUST renderizar um ícone de grupo distinto dos pins, na posição atual cadastrada.
- **FR-005**: Ao selecionar um pin (mapa ou lista), o sistema MUST abrir detalhes: nome, descrição, rótulo de sessão opcional (texto livre), arco (se houver), NPCs ligados e imagem (opcional).
- **FR-006**: O sistema MUST oferecer navegação em três seções para jogadores: Locais visitados, NPCs conhecidos e História por arcos.
- **FR-007**: Na seção Locais, usuários MUST poder filtrar por nome e centralizar o mapa no local escolhido.
- **FR-008**: Na seção NPCs, usuários MUST ver nome, descrição, status, facção (opcional), retrato (opcional) e locais onde o NPC apareceu, com navegação para esses locais.
- **FR-009**: Na seção História, usuários MUST ver arcos ordenados com resumo e, ao expandir, a lista de locais daquele arco na ordem de cadastro (com rótulo de sessão em texto livre quando houver) e salto para o pin no mapa.
- **FR-010**: Apenas o GM autenticado MUST poder criar, editar e excluir locais, NPCs e arcos, e atualizar a posição do grupo.
- **FR-011**: No fluxo de novo local, o GM MUST poder posicionar o pin clicando no mapa antes de preencher o formulário.
- **FR-012**: O formulário de local MUST permitir nome, descrição, rótulo de sessão opcional em texto livre (ex.: “Sessão 3”), vínculo a um arco e seleção de NPCs presentes.
- **FR-022**: Na edição de um local existente, o GM MUST poder reposicionar o pin entrando em modo “clique no mapa”, no mesmo padrão usado para mover o ícone do grupo; cancelar o modo MUST descartar a nova posição não salva.
- **FR-013**: O formulário de NPC MUST permitir nome, descrição, facção (opcional) e status (vivo, morto, desaparecido — e equivalente “desconhecido” se não informado).
- **FR-014**: O formulário de arco MUST permitir título, resumo e ordem de exibição.
- **FR-015**: Exclusões de conteúdo MUST exigir confirmação explícita do GM.
- **FR-016**: A interface MUST ser usável em desktop e mobile, com mapa em tela cheia e menu adaptado (lateral no desktop; barra/painel no mobile), alinhado ao protótipo.
- **FR-017**: O sistema MUST persistir todos os dados da campanha entre visitas (não apenas em memória da sessão do navegador).
- **FR-021**: O sistema MUST NOT exigir sincronização ao vivo nem polling para jogadores; o conteúdo público refletido é o persistido no momento em que a página é carregada ou recarregada.
- **FR-018**: O GM MUST poder anexar ou substituir imagem do mapa, imagens de locais e retratos de NPCs quando disponíveis; ausência de imagem não bloqueia o restante do conteúdo.
- **FR-019**: Controles de zoom (+/−/reset) e legenda Local vs Grupo MUST estar disponíveis na área do mapa.
- **FR-020**: Área de edição e operações de alteração MUST permanecer inacessíveis a visitantes não autenticados em **todos** os ambientes (incluindo desenvolvimento local sem proxy).
- **FR-023**: A autenticação do GM MUST ser validada no servidor nas rotas admin (HTTP Basic Auth); credencial inválida ou ausente MUST negar o acesso. A UI `/admin` MUST exigir credencial antes de expor o shell de edição. Em produção, a borda (proxy) MUST continuar protegendo `/admin` (defense in depth).
- **FR-024**: O deploy de produção MUST iniciar sem locais, NPCs ou arcos de demonstração (campanha vazia, com placeholder de mapa e posição padrão do grupo); dados de exemplo MUST existir apenas como seed opcional de desenvolvimento/teste.
- **FR-025**: A interface MUST usar a paleta Nocturne do protótipo (fundo escuro azulado, accent blurple), não o tema âmbar/marrom provisório.

### Key Entities

- **Local (Pin)**: Lugar visitado no mundo da campanha; nome, descrição narrativa, posição relativa (x/y) alterável na criação e na edição via clique no mapa, rótulo de sessão opcional (texto livre), imagem opcional; pertence a no máximo um arco; associado a zero ou mais NPCs.
- **NPC**: Personagem conhecido pelo grupo; nome, descrição, facção opcional, status, retrato opcional; aparece em zero ou mais locais.
- **Arco**: Bloco narrativo da campanha; título, resumo, ordem; agrega os locais/eventos relacionados.
- **Posição do Grupo**: Par de coordenadas relativas atuais do ícone do grupo e momento da última atualização.
- **Campanha (implícita)**: Conjunto único de mapa + entidades acima (v1 = um mapa / uma campanha).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Jogador encontra informação de um local ou NPC conhecido em menos de 30 segundos a partir da abertura do link (meta do PRD).
- **SC-002**: GM adiciona um novo local completo (posição + texto + vínculos, incluindo rótulo de sessão opcional em texto livre) em menos de 2 minutos após a sessão.
- **SC-003**: 100% dos locais cadastrados aparecem no mapa nas posições relativas definidas pelo GM (verificável por amostragem visual/coordenada).
- **SC-004**: Em viewport mobile típica (≥320px de largura), as três abas e o mapa são operáveis sem rolagem horizontal da página.
- **SC-005**: Visitante sem credenciais não consegue criar, alterar ou apagar nenhum conteúdo em testes manuais de acesso.
- **SC-006**: Após recarregar a página, o estado publicado (locais, NPCs, arcos, posição do grupo) permanece igual ao último salvamento do GM; jogadores não recebem atualização automática enquanto a página permanece aberta.
- **SC-007**: Zoom e pan do mapa respondem de forma contínua o bastante para o usuário completar um gesto sem “travar” perceptível em mapa de alta resolução (uso confortável em sessão compartilhada na tela).

## Assumptions

- Uma única campanha e um único mapa na v1 (sem mapas de cidade separados).
- Jogadores não têm contas; autenticação do GM é HTTP Basic Auth validada na API (e reforçada na borda em produção). A UI `/admin` exige credencial; a rota **não** pode ficar aberta sem senha em nenhum ambiente.
- O visual e os fluxos de UI do protótipo em `prototype/` são a referência; a paleta canônica é Nocturne (`nocturne.css`). Gate de credencial na UI admin é permitido/necessário (emenda à Q4 original “só borda”).
- O texto de locais/NPCs/arcos é inserido manualmente pelo GM nesta versão (sem integração automática com pipeline de transcrição).
- O estado mostrado é sempre o mais atual; não há histórico “o que o grupo sabia até a sessão X”.
- Status de NPC no protótipo (vivo / morto / desaparecido) é o conjunto canônico da UI; valor “desconhecido” cobre ausência de status.
- “Data da sessão” é rótulo em texto livre (não calendário validado); a lista dentro de um arco ordena locais pela ordem de cadastro.
- Ao excluir um NPC ou arco, vínculos em locais são removidos (local permanece; campo de arco/NPC fica vazio), em vez de bloquear a exclusão — padrão simples alinhado a ferramenta de bastidor.
- Imagem do mapa é fornecida/enviada pelo GM; até lá, placeholder é aceitável.
- Produção inicia sem seed narrativo; seed do protótipo (ou equivalente) é restrito a dev/teste.
- Fora de escopo v1 (conforme PRD): múltiplos mapas, fog of war, contas de jogador, edição colaborativa, notificações em tempo real, sync ao vivo / polling de atualizações para jogadores, timeline visual avançada além da lista por arco.
