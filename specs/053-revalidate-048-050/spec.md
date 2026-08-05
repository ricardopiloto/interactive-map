# Feature Specification: Revalidate 048 and 050 After 052

**Feature Branch**: `053-revalidate-048-050`

**Created**: 2026-08-05

**Status**: Draft

**Input**: User description: "revalide as specs 048 e 050 para garantir que o que fizemos na spec 052 não quebrou ambas."

## Context

A feature **052** restaurou a apresentação do mapa da campanha ao estado **pré-047** (remoção do pacote de alinhamento 047/049/051) e declarou explicitamente que **048** (traços da Rede) e **050** (transporte pago/próprio no Calcular rota) **não** deviam ser revertidas. Esta feature **não** altera o produto por si: **revalida** que 048 e 050 continuam a cumprir os seus critérios de sucesso após 052.

| Spec | O que deve continuar a valer |
|------|------------------------------|
| **048** | Traços de segmento na Rede ~⅔ do peso pré-048; hover utilizável; overlay/lore/digitizer chrome fora do traço inalterados por 048 |
| **050** | Calcular rota com Pago vs Próprio; tabela vs custos 0 + velocidade default 4; recálculo ao mudar modo; sem auto-recálculo só por editar velocidade |
| **052** | Só mapa da campanha / pins; não deve ter removido 048 nem 050 |

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Confirmar Rede de rotas (048) intacta (Priority: P1)

O GM abre a **Rede de rotas** após a reversão 052 e verifica que os segmentos continuam com o traço afinado da 048, tipos distinguíveis, draft e hover usáveis — sem regressão para o peso grosso pré-048 e sem quebra de fluxos de desenho.

**Why this priority**: 052 alterou a apresentação do mapa da campanha; há risco residual de efeito colateral na Rede. Provar 048 primeiro fecha esse risco visual.

**Independent Test**: Executar o quickstart de `048-refine-segment-stroke` (cenários A–F) no estado actual do produto; todos passam.

**Acceptance Scenarios**:

1. **Given** a Rede com segmentos guardados após 052, **When** o GM observa o mapa da Rede, **Then** o traço normal continua claramente mais fino que o peso pré-048 (~⅔), ainda legível e distinguível por tipo.
2. **Given** o GM a traçar um segmento, **When** vê o draft, **Then** a grossura do draft está na mesma ordem afinada que os segmentos guardados.
3. **Given** Rede em idle, **When** o GM faz hover em ≥ 3 segmentos, **Then** o realce continua perceptível face ao traço normal e o hover activa-se sem precisão pixel-a-pixel.
4. **Given** o mapa da campanha (fora da Rede), **When** se observam overlay de rota calculada e linhas de saídas entre locais, **Then** esses traços **não** foram afinados “por engano” nem revertidos de forma estranha por 052 (comportamento esperado pré/pós-048 mantém-se: 048 não os alterava; 052 também não).

---

### User Story 2 - Confirmar Calcular rota (050) intacta (Priority: P1)

O utilizador abre **Calcular rota** e confirma o modelo pago/próprio da 050: modo inicial pago, tabela em pago, custos zero e velocidade default 4 em próprio, recálculo ao mudar modo, sem recálculo só por editar velocidade, validação e ordenação/ritmo intactos.

**Why this priority**: 050 é funcionalidade de negócio recente; 052 prometeu não a reverter — a revalidação fecha esse compromisso.

**Independent Test**: Executar o quickstart de `050-route-transport-mode` (cenários A–H; opcionalmente checks de API do quickstart); todos passam.

**Acceptance Scenarios**:

1. **Given** o painel Calcular rota aberto após 052, **When** o utilizador vê o formulário, **Then** escolhe **Pago** ou **Próprio** (não o antigo controlo principal de velocidade livre sem modo).
2. **Given** De/Para com trechos tarifados e modo **pago**, **When** calcula, **Then** custos Dentro/Fora reflectem a tabela (não zeros forçados).
3. **Given** o mesmo De/Para e modo **próprio** com velocidade default, **When** o modo muda para próprio (ou calcula), **Then** Dentro e Fora são **0** e a velocidade base efectiva é **4** sem o utilizador editar o campo.
4. **Given** De/Para válidos, **When** o utilizador alterna Pago ↔ Próprio, **Then** a lista recalcula automaticamente; **When** em próprio só edita a velocidade sem Calcular/modo/ordenação, **Then** a lista **não** muda só por essa edição.
5. **Given** o painel fechado em próprio, **When** o reabre, **Then** inicia em **pago**; ao voltar a próprio a velocidade inicia em **4**.

---

### User Story 3 - Registo do resultado da revalidação (Priority: P2)

A equipa regista o resultado da revalidação (passar / falhar por cenário) e, se algo falhar, trata a falha como **regressão introduzida ou exposta após 052** — correcção limitada ao que partiu 048/050, **sem** reabrir o pacote de alinhamento 047/049/051.

**Why this priority**: Sem registo, a “revalidação” não é auditável; sem regra de remediação, uma falha pode arrastar de novo o desktop.

**Independent Test**: Existe um resultado explícito (checklist / notas da feature) cobrindo 048 e 050; se PASS, nada a implementar além da documentação do resultado; se FAIL, remediação scoped.

**Acceptance Scenarios**:

1. **Given** a revalidação concluída, **When** se consulta o resultado desta feature, **Then** cada bloco 048 e 050 está marcado como PASS ou FAIL com referência aos cenários do quickstart.
2. **Given** um FAIL atribuível a efeito colateral de 052 (ou estado inconsistente pós-052), **When** se corrige, **Then** a correcção restaura o comportamento de 048/050 **sem** reintroduzir nudge/stage das 047–051 no mapa da campanha.
3. **Given** PASS em ambos, **When** a feature fecha, **Then** não se alteram deliberadamente traços da Rede, Calcular rota, nem o restauro desktop da 052.

---

### Edge Cases

- **048 passa, 050 falha** (ou o inverso): remediação só na área que falhou; não “reverter 052” inteira.
- **Falha por ambiente** (rede sem segmentos, De/Para sem tarifas, servidores down): repetir com pré-requisitos dos quickstarts; não marcar FAIL de produto até o ambiente estar válido.
- **Diferença subjectiva de “⅔”**: usa-se o mesmo critério da 048 (claramente mais fino que pré-048, ~1.0 vs ~1.5 na memória do produto / CHANGELOG 0.6.10); não exigir medição pixel-perfect.
- **Mapa da campanha desalinhado no móvel** (aceitável na 052): **não** conta como falha de 048/050.
- **Specs 047/049/051**: permanecem histórico; esta feature não as reimplementa.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Após 052, o produto MUST continuar a satisfazer os critérios de aceitação da feature **048** (traço afinado na Rede, draft, hover utilizável, tipos distinguíveis), verificáveis via quickstart de `048-refine-segment-stroke`.
- **FR-002**: Após 052, o produto MUST continuar a satisfazer os critérios de aceitação da feature **050** (pago/próprio, tabela vs custos 0 + velocidade default 4, recálculo ao mudar modo, sem auto-recálculo só por editar velocidade, reset ao reabrir, validação, ritmo/ordenação), verificáveis via quickstart de `050-route-transport-mode`.
- **FR-003**: A revalidação MUST cobrir pelo menos os cenários A–E de 048 e A–G de 050 (H de 050 e F de 048 como regressão cruzada recomendados).
- **FR-004**: O resultado da revalidação MUST ser registado nesta feature (PASS/FAIL por bloco 048 e 050).
- **FR-005**: Se a revalidação revelar regressão em 048 ou 050, a remediação MUST restaurar o comportamento dessas specs **sem** reintroduzir as alterações de alinhamento 047/049/051 removidas pela 052.
- **FR-006**: Esta feature MUST NOT alterar deliberadamente o alinhamento desktop restaurado pela 052 quando 048 e 050 passam.
- **FR-007**: Esta feature MUST NOT expandir âmbito para novas afinacões de traço, novos modos de transporte, ou novo alinhamento móvel.

### Key Entities

- **Resultado de revalidação 048**: PASS ou FAIL face ao quickstart / SC da 048.
- **Resultado de revalidação 050**: PASS ou FAIL face ao quickstart / SC da 050.
- **Baseline 052**: Mapa da campanha pré-047 no desktop — deve permanecer se 048/050 passam.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em ≤ 10 minutos com ambiente válido, um revisor completa o quickstart 048 (A–E no mínimo) e regista PASS ou FAIL.
- **SC-002**: Em ≤ 15 minutos com ambiente válido, um revisor completa o quickstart 050 (A–G no mínimo) e regista PASS ou FAIL.
- **SC-003**: Ambos os blocos 048 e 050 estão em **PASS**, **ou** qualquer FAIL tem remediação scoped concluída e re-teste PASS, sem reabrir 047–051.
- **SC-004**: Spot-check pós-revalidação: no desktop, o alinhamento de pins da campanha (objectivo da 052) não foi piorado de propósito por esta feature.
- **SC-005**: 100% dos cenários obrigatórios listados em FR-003 têm resultado explícito (não “não testado”).

## Assumptions

- 052 já foi aplicada (apresentação do mapa da campanha restaurada ao pré-047; entradas de changelog só das afinagens de pin 047/049/051 removidas, mantendo 048 e 050 documentadas).
- Os quickstarts e specs de `048-refine-segment-stroke` e `050-route-transport-mode` são a fonte de verdade dos critérios a revalidar.
- “Não quebrou” = critérios de 048 e 050 ainda se verificam no produto actual; não exige reescrever essas specs.
- Se 048/050 já estavam incompletas **antes** de 052, isso deve ser distinguido de regressão causada por 052; na dúvida, tratar FAIL como bloqueio até clarificar.
- Validação é principalmente manual (como nas specs originais); checks de API do quickstart 050 são opcionais mas úteis.

## Out of Scope

- Reabrir ou “melhorar” alinhamento móvel (047–051).
- Novas features de Rede ou Calcular rota além da remediação de regressão.
- Apagar pastas de specs 047–052.
- Revalidar todas as specs do monorepo — só **048** e **050**.
