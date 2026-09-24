# Data Model: Rede de Relações

Esta feature não acrescenta entidades, campos persistidos, rotas ou estados de negócio. Usa `NPC`/`Personagem`, `Vinculo` e as projeções administrativas/públicas existentes.

## Personagem no grafo (existente)

| Campo | Tipo | Uso no grafo |
|---|---|---|
| `id` | inteiro | Identidade estável do nó e seleção |
| `tipo` | `pj` / `npc` | Define o grupo visual/anel na visão geral |
| `nome`, `papel` | texto | Rótulos visíveis do nó |
| `visivel_para_todos` | booleano | Se falso, só o GM recebe o personagem e seus vínculos |

PJs formam o anel interno e NPCs o externo no overview. Com foco, o personagem selecionado fica no centro, conexões diretas no anel interno e restantes no anel externo atenuado. Os cálculos são transitórios e não são persistidos.

## Vínculo (existente)

| Campo | Tipo | Semântica |
|---|---|---|
| `id` | inteiro | Identidade do par único de personagens |
| `personagem_a_id`, `personagem_b_id` | inteiros | Extremos canônicos do par |
| `tipo_ab`, `tipo_ba` | tipo ou nulo | Natureza de A para B e de B para A; `tipo_ba=null` representa o caso recíproco atual |
| `publico` | booleano | Visibilidade do par inteiro para jogadores; privado significa que não veem a linha nem as entradas |
| `conhecido_ab`, `conhecido_ba` | booleanos | Quais sentidos de uma relação de duas vias podem ser vistos quando o par é público |
| `qualificador_ab`, `qualificador_ba` | texto | Qualificador de cada perspectiva; não altera a cor do tipo |
| `nota_ab`, `nota_ba` | texto | Nota privada do GM ou permitida pela projeção pública conforme sentido |
| `direcao` | enum ou nulo | Direção A→B ou B→A para um vínculo com direção explícita |

O modelo permite no máximo um vínculo por par. Os oito valores de tipo permanecem inalterados.

## Perspectiva e privacidade

- **GM** usa os dados administrativos completos. Pode ver que o par é privado e qual sentido não é conhecido pelos jogadores.
- **Jogador** usa somente a resposta pública do servidor. Vínculos privados e ligações a personagens ocultos não são enviados. Em par público de duas vias, tipos, qualificadores e notas de sentido desconhecido são redigidos pelo servidor.
- Indicadores GM-only são derivados de `publico` e `conhecido_ab/ba`; não devem ser enviados como atributos de apresentação à API pública nem incluídos no DOM acessível da vista de jogador.
- Direção, rótulo, cor e gradiente visíveis ao jogador são calculados apenas a partir do sentido aprovado pela projeção pública. Não desenhar estilo de duas vias incompletas quando somente um sentido é conhecido.

## Estado visual transitório

| Estado | Derivado de | Representação |
|---|---|---|
| Vínculo público | `publico=true` | Traço de tipo normal |
| Vínculo privado | `publico=false` (GM) | Marcador/rótulo acessível exclusivo ao GM |
| Sentido desconhecido | `conhecido_ab/ba=false` (GM) | Marcador junto ao extremo correto exclusivo ao GM |
| Tipo de vínculo | `tipo_ab/tipo_ba` | Uma cor individual, padrão de linha e rótulo textual |
| Direção | `direcao` e perspectiva A/B | Seta orientada corretamente quando aplicável |
| Layout overview/foco | filtros e seleção atuais | Posições radiais temporárias, sem salvar posições |

Essas distinções são apresentação derivada. Nenhuma transição altera dados narrativos ou regras de autorização.
