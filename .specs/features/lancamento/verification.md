# Lançamento: medição, SEO técnico e backup verification

**Verdict**: FAIL
**Mutations**: 3 - probed C4, C16, C17
**Proofs**: `proofs.md` at 842484a
**Verifier**: independent sub-agent (author != verifier)

As três mutações têm prova Playwright e ficam para `check_proofs.py --mutations` (`mutations.json`). Previsão: C17 (`skipTrailingSlashRedirect: false`) morre, porque `/contato/` passa a responder 308 antes do 301. C4 (`CONSENT_DAYS = 179`) e C16 (`availability` sempre `InStock`) devem sobreviver às provas nomeadas. Aplicadas à mão e depois restauradas, as duas são mortas pelos testes unit `consent.test.ts` e `structured-data.test.ts`, mas nenhum dos dois é a prova de um check.

Exemplos próprios que seguraram:
- endereço sem cidade ("Rua Cabo Antônio Alves, 50") tira `addressLocality` sem erro;
- a lista de URLs antigas recusa `/?p=123` e `/loja/óleo/`, e `/a//` vira `/a` e `/a/`;
- o `<` do JSON-LD é escapado;
- o produto sem embalagem não existe, porque o formulário exige ao menos uma (`product-input.ts:99`);
- o backup sai com 1 sem mostrar a senha quando o `pg_dump` falha;
- as regras de redirecionamento não formam laço.

## Findings

| Finding | Evidence | Fix | Closed |
| --- | --- | --- | --- |
| O artefato do backup pode ser baixado por qualquer conta do GitHub. O repositório é público e o artefato leva o banco inteiro: nomes e veículos dos pedidos, e-mails e hashes de senha do painel (`auth.users`). O README promete o contrário | `gh api repos/leo123-pixel/faclub` → `"visibility":"public"`; `.github/workflows/backup.yml:53` sobe `backup/` sem cifrar; `scripts/backup.mjs:59` exporta `auth.users` e `auth.identities`; `README.md:36` diz "só quem tem acesso ao repositório consegue baixá-lo" | cifrar antes do upload (por exemplo `tar` + `age`/`gpg --symmetric` com um segredo `BACKUP_PASSPHRASE`) e subir só o arquivo cifrado, ou tornar o repositório privado. Teste em `tests/config/backup-workflow.test.ts` que o `path` do upload é só o arquivo cifrado | |
| Num repositório público, o GitHub desliga o `schedule` depois de 60 dias sem atividade. O backup para em silêncio: não há execução vermelha nem e-mail, e o objetivo "backup com no máximo 7 dias" cai sem aviso | `.github/workflows/backup.yml:7-9`, só `schedule` + `workflow_dispatch`, num repositório público (ver acima) | tornar o repositório privado (também fecha o achado anterior), ou registrar no README o risco e o passo de reativar, com um alerta externo de idade do último artefato | |
| Recusar depois de aceitar ("Preferências de cookies" → "Recusar") não para o GA4 nem o Pixel já carregados na página. O gtag.js (page_view por mudança de histórico) e o fbevents.js (PageView no `pushState`) seguem enviando a cada navegação por `Link` até recarregar, e os cookies `_ga`/`_fbp` ficam | `src/components/site/ConsentProvider.tsx:33-40`: `choose` só grava o estado; `src/components/site/Analytics.tsx:57-62` só liga, nunca desliga; a trava de `src/components/site/track.ts:28` cobre só os 6 eventos próprios | na recusa com scripts carregados: `gtag("consent","update",{analytics_storage:"denied",ad_storage:"denied"})`, `fbq("consent","revoke")` e `location.reload()` (e apagar `_ga*`/`_fbp`). E2e: aceitar, Preferências → Recusar, navegar por `Link` e esperar zero pedidos a `google-analytics.com`/`facebook.com` | |
| Uma escolha gravada com data no futuro nunca expira, e o aceite vale além dos 180 dias | exemplo próprio: `readConsent('{"version":1,"choice":"aceito","at":"9999-01-01T00:00:00Z"}', 2026-10-28)` → `{ choice: "aceito" }`; um aceite feito com o relógio 1 ano adiantado ainda vale 300 dias depois. `src/lib/domain/consent.ts:15` só testa `now - at > 180 dias` | tratar `at > now` (com folga pequena, por exemplo 1 dia) como sem escolha, com teste unit | |
| Horários em formato comum somem do JSON-LD sem aviso, e horários impossíveis entram. O campo de horário é texto livre no painel | exemplo próprio: `parseHours("7:00 às 18:00")`, `"das 7h às 18h"` e `"7 às 18h"` → `null` (o `openingHoursSpecification` fica vazio); `"25h às 99h"` → `opens: "25:00"`. `src/lib/domain/structured-data.ts:12`; `settings-input.ts` não valida horários | aceitar `H:MM` e `HhMM` e checar 0-23/0-59, ou validar o formato no formulário de configurações com mensagem. Testes unit dos dois lados | |
| Telefone e cidade do `LocalBusiness` saem errados de textos plausíveis das configurações | exemplo próprio: telefone `"+55 (11) 2954-5764"` → `telephone: "+55551129545764"` (`structured-data.ts:32`); endereço `"…, Parque Novo Mundo, São Paulo - SP, 02180-000"` → `addressLocality: "02180-000"` (`structured-data.ts:21`) | tirar o 55 inicial quando os dígitos têm 12 ou 13 posições; ao escolher a cidade, pular CEP (`\d{5}-?\d{3}`, que pode ir para `postalCode`) e UF. Testes unit | |
| C3 e C4 não fixam os 180 dias: o e2e testa 179 e 181 dias, e `CONSENT_DAYS = 179` passa | `tests/e2e/consent.spec.ts:55-61` e `:104-116`; o aceite é gravado alguns ms depois de `start`, então em `start + 179d` a diferença fica abaixo de 179 dias. Mutação C4 em `mutations.json` | no e2e, conferir o aviso escondido em `start + 180d - 1min` e visível em `start + 180d + 1min`, ou nomear `src/lib/domain/consent.test.ts` na prova de C3/C4 | |
| C16 prova a disponibilidade só com estoque: o ramo `OutOfStock` nunca roda na prova, e "sempre InStock" passa | `tests/e2e/seo-tech.spec.ts:99-114`: só o Top Turbo (estoque 12) e só `InStock`. Mutação C16 em `mutations.json` | no e2e, zerar o estoque de um produto (`serviceClient` + `refreshSite`) e asserir `https://schema.org/OutOfStock` | |
