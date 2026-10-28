# Review — Desenvolvedor Fullstack

**Change:** registo-autonomo
**Data:** 2026-10-28 (segunda revisão, após incorporar o parecer anterior)
**Veredito geral:** Aprovado com ressalvas

Contexto lido: os quatro artefatos relidos do disco; `backend/app/{config.py, cli.py, services/auth_lockout.py, middleware/csrf.py}`, `frontend-v2/playwright.config.ts`, e o que já tinha sido lido na primeira revisão. Só `frontend-v2` é servido pelo compose; não há CI no repositório (verificação local: `pytest`, `vitest`, `playwright`).

## Situação das ressalvas da primeira revisão
Incorporadas: formato do 429 (`LIMITE_REGISTO`/`LIMITE_PEDIDOS`), fixture `limiter._storage.reset()`, `invite_url` para `verificar`, reaproveitamento de `delete_user`, regra de pendente, `EMAIL_LOG_FILE` para o e2e, códigos de erro nos locales, honeypot, rotas nos dois blocos de `main.tsx`, só `frontend-v2`, log sem e-mail/token, `.env.example`. A leitura do código para a segunda rodada achou três pontos novos que a implementação revelaria.

## 1. Desenvolvimento do backend
Veredito: Atenção
- **Concordo com H1 do arquiteto, e é um defeito real de lógica.** A decisão 2 invalida o convite anterior com `consumido_em`; a decisão 3 só limpa contas cujos convites estão "não consumidos". Ao reemitir o link, a conta nunca mais é limpa. Corrigir como o arquiteto sugere: invalidar com `expira_em = agora` e limpar quando todos os convites forem `verificar` e o mais recente estiver expirado. Isso também dá a mensagem certa ("expirado" com atalho para novo registo) em vez de "já usado".
- **Concordo com H2 e H3.** `auth_lockout.py` é "5 falhas → bloqueio de 15 min → zera", com `MAX_FAILURES` e `LOCKOUT_MINUTES` fixos no módulo e `clear_failures` zerando contagem. Não há janela de 24 h. A tarefa 4.1 precisa decidir: parametrizar (limite e janela por chamada) ou criar um contador por janela. Apagar o contador na limpeza de contas pendentes anula o teto, por isso a limpeza só apaga o bloqueio de login.
- **Validação de arranque deve ir no `lifespan`, não num validador de `Settings`.** `settings = Settings()` é instanciado na importação; um `model_validator` que levante erro quebraria também o CLI (`usuario criar`, `limpar-pendentes`) e a coleta do `pytest`. O `lifespan` de `main.py` só corre ao subir a API (e o `TestClient(app)` sem `with` não o executa). Acrescentar à tarefa 3.3: função `validate_registo_startup()` chamada no `lifespan`, testada diretamente.
- **`DEFAULT_COTA_BYTES` é importado por nome** em `legacy_import.py` e `campaign_import.py` (`from … import DEFAULT_COTA_BYTES`), o que congela o valor na importação. "Derivado da configuração" não basta: tem de ser uma função (`default_cota_bytes()`) lida na hora do uso, e os dois módulos passam a chamá-la; senão `monkeypatch` da configuração nos testes não surte efeito.
- **TTL do registo.** Com `REGISTO_TTL_HORAS` como constante, o cenário "link expirado" não é testável em e2e. Ver 4.
- **CLI**: o subparser `usuario` já tem `criar/reset/desactivar/promover-admin/rebaixar-admin`; `limpar-pendentes` é mais uma ação com `init_control()`, como as outras. Sem problema.
- **Convite do admin para e-mail que já se auto-registou**: `create_usuario_with_invite` levanta `EMAIL_DUPLICADO` enquanto existir a conta pendente (até 5 h). Aceitável; o admin vê "duplicado" e a conta some ao fim do prazo. Registrar no runbook para não parecer defeito.
- **Console do admin**: contas pendentes de auto-registo aparecem na lista como "pendente" por até 5 h, incluindo as de bots. Aceitável, mencionar no runbook.
- **Turnstile na parte síncrona**: concordo com H4. `httpx.post` com timeout curto (≈3 s) e resposta distinta quando a Cloudflare não responde.

## 2. Desenvolvimento do frontend
Veredito: OK
- Plano coerente com a stack real (`@/auth/Login`, `routes/convite.tsx`, `useApiErrorMessage`, `errors.*`). Nenhum item novo; mensagem de confirmação deve incluir a orientação de spam/tentar mais tarde (H do arquiteto sobre o limite silencioso). Os testes de componente simulam o script do Turnstile.

## 3. Deploy e operação
Veredito: Atenção
- **A `playwright.config.ts` precisa mudar e a tarefa 8.1 não a menciona.** O backend do e2e sobe com `uvicorn` e as variáveis `DATA_DIR`, `COOKIE_SECURE`, `PUBLIC_BASE_URL`, `CORS_ORIGINS`; **sem `DEBUG`** (padrão `false`). Para o `LogSender` e o `EMAIL_LOG_FILE` funcionarem, o `command` precisa de `DEBUG=true`, `REGISTO_MODO=aberto` e `EMAIL_LOG_FILE=<dataDir>/emails.jsonl`, e o teste lê o mesmo caminho. Acrescentar essa edição à 8.1 (`frontend-v2/playwright.config.ts`).
- **`CORS_ORIGINS` vs origin público**: o `CsrfOriginMiddleware` recusa POST cujo `Origin` não esteja em `CORS_ORIGINS`; o padrão do compose é `https://mapa.1nodado.com.br`, enquanto a produção citada no README é `campaign-codex.1nodado.com.br`. Concordo com H5: validar no arranque (ou no runbook) que o origin de `PUBLIC_BASE_URL` conste em `CORS_ORIGINS`, e conferir o `.env` de produção antes de abrir.
- Variáveis, migração automática no arranque, túnel e 1 worker: já cobertos. Runbook deve ganhar uma linha de multi-instância (cada instância liga o registo por conta própria).
- Observabilidade: logar quantas contas a limpeza apagou por ciclo (só a contagem, sem e-mails) para que o time veja que a tarefa roda.

## 4. Qualidade de código
Veredito: Atenção
- **O cenário "link expirado" no e2e (8.1) não é executável**: não se espera 5 horas. Fixar o expirado em testes de backend (manipulando `expira_em`) e de componente, e limitar o e2e ao caminho feliz; ou tornar o TTL configurável por variável de ambiente (`REGISTO_TTL_HORAS`, padrão 5). Preferência: manter o TTL fixo e tirar o "caso de link expirado" do e2e, como pede a preferência do projeto de e2e só para o fluxo todo.
- **A tarefa 4.1 está grande** (máquina de estados, invalidação, termos, corrida, contador). Dividir em duas: 4.1a contador por janela (depende de H3) e 4.1b serviço de registo. Cada uma com seus testes.
- Testes de rota continuam a precisar da fixture local do limiter; `BackgroundTasks` correm dentro do `TestClient` antes de devolver controle, o que simplifica as asserções do envio.
- Concorrência: `IntegrityError` já tratado. Acrescentar teste da limpeza concorrente com a ativação (conta ativada entre a seleção e o `DELETE` não pode ser apagada).

## 5. Execução das decisões arquiteturais
Veredito: OK
- `tasks.md` segue o `design.md` sem reabrir decisões, e o túnel substitui corretamente a exigência de firewall. Os pontos H1, H2, H3, H4 e H5 do arquiteto são os que precisam voltar ao `design.md` antes do apply.

## Bloqueantes antes de implementar
- nenhum

## Limitações técnicas a reportar ao Arquiteto
- H1 (convite invalidado impede a limpeza) é uma contradição interna entre as decisões 2 e 3.
- H2/H3: o mecanismo `LoginBloqueio` não serve para 3/24 h sem alteração, e a limpeza não deve zerar o contador do registo.
- Validação de arranque deve viver no `lifespan`; `DEFAULT_COTA_BYTES` deve virar função lida em tempo de uso.
- O e2e exige `DEBUG=true`, `REGISTO_MODO=aberto` e `EMAIL_LOG_FILE` na `playwright.config.ts`, e não pode testar link expirado de 5 h.
