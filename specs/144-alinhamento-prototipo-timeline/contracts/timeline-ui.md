# Contract: Linha do Tempo — apresentação por papel

**Surface**: página existente `/c/:slug/linha-do-tempo` e chamadas às APIs atuais de Eventos e Sessões.

## Mestre

- Cabeçalho apresenta título e subtítulo contextual de cadastro/acompanhamento, com ação de novo Evento.
- Cada card apresenta ano, era opcional, título e indicador `Oculto` quando aplicável.
- Título/controle acessível alterna expansão do detalhe; o detalhe contém descrição, referências de Local/Personagem e sessão vinculada quando disponível.
- Ações atuais de editar e excluir permanecem disponíveis e continuam respeitando modo/autorizações existentes.
- Criar e editar continuam no `FormDrawer` com os controles compartilhados do produto. Campos de domínio: título, ano, era opcional, descrição, Locais, Personagens, Sessão opcional e visibilidade. Mês não é exposto; o valor legado é preservado em edições.

## Jogador

- Cabeçalho apresenta subtítulo de recordação da história já vivida.
- Todos os detalhes preenchidos de eventos visíveis são mostrados sem controle de expansão.
- Local e Personagem somente aparecem se retornados pela API pública de Eventos.
- O metadado de sessão é resolvido pelo `sessao_id` usando a lista da API pública de Sessões; como essa lista contém apenas sessões visíveis, não encontrado significa omitir o metadado.
- Nenhum controle de criação, edição ou exclusão é apresentado.
- Quando houver eventos na lista, ao final há uma nota explicando que acontecimentos ainda ausentes podem não ter sido revelados.

## Chamadas existentes

| Papel | Eventos | Sessões |
|---|---|---|
| Jogador | `GET /api/c/{slug}/eventos` | `GET /api/c/{slug}/sessoes` |
| Mestre | `GET /api/c/{slug}/admin/eventos` | `GET /api/c/{slug}/admin/sessoes` |

Não são introduzidos endpoints, campos persistidos ou mudanças no payload. As respostas públicas seguem seus filtros existentes de visibilidade.

## Identidade visual e acessibilidade

- Reutilizar o cabeçalho, painel de formulário, botões, ícones, diálogos e tokens CSS atuais.
- Controles interativos mantêm foco visível, nomes acessíveis e estado expandido anunciado para leitor de tela.
- Cards, texto e chips devem se adaptar a temas e larguras suportados, sem rolagem horizontal.
- Os textos novos existem em pt-BR e en; dados narrativos do mestre permanecem no idioma original.
