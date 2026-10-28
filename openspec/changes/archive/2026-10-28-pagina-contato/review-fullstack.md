# Review — Desenvolvedor Fullstack

**Change:** pagina-contato
**Data:** 2026-10-28 (terceira revisão)
**Veredito geral:** Aprovado com ressalvas

Contexto lido: os quatro artefatos relidos do disco e `review-architect.md`; `backend/app/services/{email_sender.py, auth_lockout.py, registo.py, registo_config.py}`, `backend/app/routers/auth.py`, `backend/uv.lock`, `frontend-v2/{package-lock.json, src/auth/Login.tsx, src/routes/registo.tsx, src/lib/apiError.ts, src/api/client.ts}`, `playwright.config.ts`. Sem CI no repositório; verificação local com `pytest`, `vitest`, `playwright`.

## Situação das ressalvas anteriores
Incorporadas: handler `def`, extração de `valid_email_format`, `validate_public_forms_startup`, limite de URLs, categoria `privacidade`, limpeza `contato:`, `vite-env.d.ts`, `package-lock.json`, Login em duas variantes, Turnstile com a declaração global, e o rodapé fora de campanha com teste de ausência na campanha. Dois pontos novos surgiram ao ler o código que a implementação vai tocar.

## 1. Desenvolvimento do backend
Veredito: Atenção
- **`EmailSender.send` "nunca propaga" não é verdade para o `LogSender`.** Ele pode levantar `ValueError` (caminho fora do `DATA_DIR`) e `OSError` (disco). No contacto o envio é síncrono: uma exceção viraria `500` em vez de `502 CONTATO_ENVIO_FALHOU`, e em produção o `LogSender` nem é usado, mas em depuração/e2e sim. A tarefa 2.1 deve fazer `send` capturar exceções, registá-las (sem dados pessoais) e devolver `False`, com teste.
- **Consumo dos contadores (B3 do arquiteto) exige uma API em dois passos.** Hoje `allow_registo_email` verifica e incrementa na mesma chamada. Para "consumir o global só depois do sucesso" e "devolver o contador por e-mail em falha do provedor", a 2.2 deve expor `counter_allows(...)` e `counter_consume(...)` (e `counter_refund(...)` para o por e-mail), mantendo `allow_registo_email` como composição dos dois, com testes. A corrida entre verificar e consumir é aceitável (um pedido a mais num teto suave).
- **Contador próprio da categoria `privacidade` (B2).** Implementar como chave `contato:privacidade` com `CONTATO_LIMITE_PRIVACIDADE`; trivial depois da generalização da 2.2.
- **A validação de e-mail extraída (2.3) não rejeita caracteres de controlo.** A condição atual só verifica `' ' in email`, contagem de `@` e ponto no domínio; `\r`, `\n`, vírgula ou `<>` passariam, e o e-mail vai agora para o campo `reply_to` do Resend. Ao extrair `valid_email_format`, rejeitar caracteres de controlo e `<>,;` (restrição segura também para o registo) e testar os dois usos; ajustar a frase "preservam o comportamento do registo" para "preservam o comportamento para endereços válidos".
- **`uv.lock` e versão (B1 do arquiteto):** a 1.1 inclui `uv lock` (a versão do projeto está na linha 435, `source = { virtual = "." }`) e o teste de alinhamento passa a ler o `uv.lock`; no `package-lock.json` há duas ocorrências (raiz e `packages[""]`).
- `GET /api/contato/config` é `GET`, logo não passa pelo CSRF de `Origin`; o `POST` precisa do `Origin` nos testes (padrão `TEST_ORIGIN`).
- `validate_public_forms_startup()` chamada no `lifespan` ao lado da do registo; nos testes de rota com `with TestClient(app)` o `settings.contato_email` fica `None`, então não dispara. Testes que o definam devem usar `DEBUG=true` ou `trusted_proxy=True`.

## 2. Desenvolvimento do frontend
Veredito: OK
- Viável com a stack: `contato.tsx` espelha `registo.tsx`; o e-mail pré-preenchido vem de `useAuth().user?.email`; o `select` e o contador de caracteres usam componentes já existentes; erros por `useApiErrorMessage` e `errors.*`.
- `ApiError` só extrai `detail.erro` e `detalhes`; os novos códigos (`LIMITE_CONTATO_DIARIO`, `CONTATO_ENVIO_FALHOU`, `MENSAGEM_INVALIDA`…) chegam no formato esperado, e o tratamento global de 429 já devolve `{detail:{erro}}`.
- Rodapé: os wrappers das páginas são `div`/`main` independentes (não há layout comum); o `SiteFooter` entra no fim de cada um, sem exigir `flex` (o rodapé fica logo após o conteúdo; ficar colado ao fundo em páginas curtas é aceitável e não bloqueia). A tarefa 1.4 toca mais de uma dúzia de arquivos: se o codex a executar, convém dividi-la em duas execuções (páginas públicas; login e testes de ausência na campanha).
- Mobile: formulário de uma coluna; o rodapé é uma linha que quebra em telas estreitas (usar `flex-wrap`).

## 3. Deploy e operação
Veredito: Atenção
- **Plano de migração:** definir `CONTATO_EMAIL` sem `TRUSTED_PROXY=true` faz a API recusar-se a subir (decisão 5). Colocar no plano e no runbook: primeiro `TRUSTED_PROXY=true` e só depois `CONTATO_EMAIL`, e conferir o `.env` de produção antes do deploy.
- Variáveis novas (`CONTATO_EMAIL`, `CONTATO_LIMITE_DIARIO`, e `CONTATO_LIMITE_PRIVACIDADE` se B2 for adotado) em `.env.example` e runbook (2.7). Sem migração, script ou porta novos; imagem do `web` não muda de contexto.
- Observabilidade: logs só com contagens e códigos e o `request_id` do Resend; suficiente para depurar "não chegou" sem dados pessoais.

## 4. Qualidade de código
Veredito: Atenção
- Tarefas com verificação concreta e testes dentro de cada grupo, no padrão do projeto. A 2.5 concentra muitas responsabilidades (router, settings, validação do e-mail de contacto, logs, testes de cada limite): dividir em duas (2.5a router e fluxo de envio; 2.5b settings, validação de `CONTATO_EMAIL` e logs) para execuções menores e revisáveis.
- Testes a acrescentar: `send` que não propaga (LogSender com caminho inválido), `reply_to` sem caracteres de controlo, contador global só após sucesso e devolução do contador por e-mail em falha do provedor, categoria `privacidade` com teto próprio, e que `uv.lock` entra no teste de alinhamento.
- E2E (4.1): `DEBUG=true` já existe na `playwright.config.ts`, então `validate_public_forms_startup` não impede o arranque; o e2e do contacto precisa de `CONTATO_EMAIL` e continua a usar `EMAIL_LOG_FILE`.

## 5. Execução das decisões arquiteturais
Veredito: OK
- `tasks.md` segue o design sem reabrir decisões; as ressalvas acima são ajustes de tarefa, não mudanças de rumo.

## Bloqueantes antes de implementar
- nenhum

## Limitações técnicas a reportar ao Arquiteto
- Exceção do `LogSender` e `send` que não propaga (corrigir na 2.1).
- API de contadores em dois passos para B3 (2.2).
- `valid_email_format` sem caracteres de controlo antes de usar o e-mail como `reply_to`.
- `uv.lock` e as duas versões do `package-lock.json` entram no alinhamento (1.1).
