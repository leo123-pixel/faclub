# Lançamento: medição, SEO técnico e backup Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, the walk, check_proofs, the Verifier and the screens sub-agent).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/lancamento/design.md`
**Status**: In Progress
**Approved**: 2026-10-28 - user: "aprovado, pode seguir"
**Mutations**: 3
**Build**: `npm run build:local; npm run typecheck; npm run lint`

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: `AGENTS.md`, `.specs/features/carrinho-pedidos/tasks.md` (matriz aprovada da feature anterior), `vitest.config.mts`, `playwright.config.ts`.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Domínio (`src/lib/domain`) | unit | Todos os ramos; 1:1 com os critérios; os dois lados de cada limite (180 dias, horários, produto oculto) | `src/lib/domain/*.test.ts` | `npx vitest run src/lib/domain` |
| Componentes do site (`src/components/site`) | unit (jsdom) | ID vazio e armazenamento bloqueado | `src/components/site/*.test.tsx` | `npx vitest run src/components` |
| Configuração versionada (workflow, lista de URLs) | unit | Cada valor que um critério fixa | `tests/config/*.test.ts` | `npx vitest run tests/config` |
| Páginas, metadados, redirecionamentos e script de backup | e2e | A rede (o que carrega e o que não), os eventos enviados, o XML, o JSON-LD, os 301 e o backup restaurado | `tests/e2e/{consent,events,seo-tech,redirects,backup}.spec.ts` | `npx playwright test` |

## Gate Check Commands

> Generated from codebase - confirm before Execute.

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Quick | Tarefas com testes unit ou de componente | `npm run typecheck && npx vitest run` |
| Full | Tarefas com testes e2e | `npm run typecheck && npx vitest run && npx playwright test` |
| Build | Fim de fase, ou tarefas só de configuração | `npm run lint && npm run typecheck && npm run build:local && npx vitest run && npx playwright test` |

---

## Execution Plan

### Phase 1: Regras

```
T1 → T2 → T3 → T4
```

### Phase 2: Aviso de cookies e medição

```
T4 → T5 → T6 → T7 → T8
```

### Phase 3: SEO técnico e URLs antigas

```
T8 → T9 → T10 → T11
```

### Phase 4: Backup

```
T11 → T12 → T13
```

---

## Task Breakdown

### T1: Escolha de cookies ✅

**What**: `ConsentChoice`, `CONSENT_DAYS = 180`, `readConsent(raw, now)` (vencida, inválida ou ausente dá "sem escolha"), `writeConsent(choice, now)` e `canTrack(consent)`.
**Where**: `src/lib/domain/consent.ts`
**Depends on**: None
**Reuses**: padrão de `cart.ts`
**Requirement**: CONS-01

**Done when**:

- [x] `src/lib/domain/consent.test.ts` cobre: aceite e recusa valem até 180 dias e somem 1 min depois; texto inválido dá "sem escolha"; `canTrack` só é verdadeiro com aceite válido
- [x] Gate check passes: `npm run typecheck && npx vitest run`
- [x] Test count: 3 tests pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(domain): adiciona a escolha de cookies`

---

### T2: Conteúdo dos eventos ✅

**What**: `viewItemEvent`, `addToCartEvent`, `sendOrderEvent`, `clickWhatsappEvent`, `copyCouponEvent` e `joinGroupEvent`, cada um com `{ name, params }` em reais e `currency: "BRL"`, e `WHATSAPP_LOCATIONS`.
**Where**: `src/lib/domain/analytics-events.ts`
**Depends on**: T1
**Reuses**: `productTitle`, `variantPrice`
**Requirement**: CONS-01

**Done when**:

- [x] `src/lib/domain/analytics-events.test.ts` cobre cada evento com os campos da spec: `view_item` com id, nome, marca e preço da primeira embalagem (promocional só em oferta); `add_to_cart` com id, embalagem, quantidade e preço; `send_order_whatsapp` com número de itens (soma das quantidades) e total; `click_whatsapp` com o local; `copy_coupon` com o código; `join_group`
- [x] Gate check passes: `npm run typecheck && npx vitest run`
- [x] Test count: 6 tests pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(domain): adiciona o conteúdo dos eventos de medição`

---

### T3: Dados estruturados ✅

**What**: `parseHours`, `localBusinessJsonLd(settings, siteUrl)` (`AutoRepair` com nome, endereço, telefone e horários) e `productJsonLd(product, siteUrl)` (`Product` com marca, imagem, SKU e `Offer` em BRL e disponibilidade).
**Where**: `src/lib/domain/structured-data.ts`
**Depends on**: T2
**Reuses**: `splitAddress`, `variantPrice`, `publicImageUrl`
**Requirement**: SITEMAP-01

**Done when**:

- [x] `src/lib/domain/structured-data.test.ts` cobre: "7h às 18h" dá 07:00 a 18:00 e "8h30 às 12h" dá 08:30 a 12:00, texto livre não vira horário; `LocalBusiness` com os dados das configurações; `Product` com promocional só em oferta, `InStock` com estoque e `OutOfStock` sem, e sem SKU nem imagem quando faltam
- [x] Gate check passes: `npm run typecheck && npx vitest run`
- [x] Test count: 4 tests pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(domain): adiciona dados estruturados da loja e do produto`

---

### T4: Sitemap e URLs antigas ✅

**What**: `sitemapEntries(siteUrl, products, now)` e `buildRedirects(list)` (301 com e sem barra final, mais `/wp-content/*`, `/wp-admin/*` e `/feed/*` para a Home); `redirects/legacy-urls.json` com as 12 URLs do `wp-sitemap.xml` do WordPress (a Home não precisa de redirecionamento).
**Where**: `src/lib/domain/legacy-redirects.ts`
**Depends on**: T3
**Reuses**: -
**Requirement**: SITEMAP-01, REDIR-01

**Done when**:

- [x] `src/lib/domain/legacy-redirects.test.ts` prova: cada par do arquivo é um caminho antigo começando com `/` e um destino interno do site novo, sem caminho repetido, e `buildRedirects` gera para ele uma entrada 301 com e sem a barra final (C19); as regras gerais existem
- [x] `src/lib/domain/sitemap.test.ts` cobre: Home, `/produtos`, política e cada produto com a data de alteração; URLs absolutas
- [x] Gate check passes: `npm run typecheck && npx vitest run`
- [x] Test count: 5 tests pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(domain): adiciona o sitemap e a lista de URLs antigas`

---

### T5: Aviso de cookies ✅

**What**: `ConsentProvider` (store da escolha com armazenamento bloqueado tratado), `CookieBanner` no layout `(site)` com "Aceitar", "Recusar" e "Política de privacidade", e "Preferências de cookies" no rodapé.
**Where**: `src/components/site/CookieBanner.tsx`
**Depends on**: T4
**Reuses**: `readConsent`, `writeConsent`, padrão de `CartProvider`
**Requirement**: CONS-01

**Done when**:

- [x] `tests/e2e/consent.spec.ts` prova: na primeira visita o aviso aparece com "Aceitar", "Recusar" e o link da política (C1); "Recusar" esconde o aviso, que não volta ao recarregar nem 179 dias depois e volta 181 dias depois (C4); "Preferências de cookies" no rodapé mostra o aviso de novo (C11)
- [x] `src/components/site/ConsentProvider.test.tsx` cobre: com o armazenamento bloqueado o aviso volta numa montagem nova e a escolha vale só na visita (Edge Case)
- [x] Gate check passes: `npm run typecheck && npx vitest run && npx playwright test`
- [x] Test count: 3 e2e e 1 de componente passam

**Tests**: e2e
**Gate**: full

**Commit**: `feat(site): adiciona o aviso de cookies`

---

### T6: GA4 e Pixel só com aceite ✅

**What**: `Analytics` no layout `(site)`: com aceite e ID, cria as filas `gtag` e `fbq` e carrega `gtag.js` e `fbevents.js`; `track(event)` envia para os dois e não faz nada sem aceite; IDs de teste em `NEXT_PUBLIC_GA4_ID` e `NEXT_PUBLIC_META_PIXEL_ID` no stack local.
**Where**: `src/components/site/Analytics.tsx`
**Depends on**: T5
**Reuses**: `canTrack`, `useConsent`
**Requirement**: CONS-01

**Done when**:

- [x] `tests/e2e/consent.spec.ts` prova: sem escolha e depois de "Recusar", nenhum pedido vai a `googletagmanager.com` nem a `connect.facebook.net` ao navegar por Home, catálogo e produto (C2); "Aceitar" carrega os dois scripts com os IDs, esconde o aviso, e a escolha vale até 180 dias (C3)
- [x] `src/components/site/Analytics.test.tsx` cobre: com o ID do GA4 vazio só o Pixel carrega, e vice-versa, sem erro (Edge Case)
- [x] Gate check passes: `npm run typecheck && npx vitest run && npx playwright test`
- [x] Test count: 2 e2e e 3 de componente passam

**Tests**: e2e
**Gate**: full

**Commit**: `feat(site): carrega GA4 e Pixel só com o aceite`

---

### T7: Eventos de produto, carrinho e pedido ✅

**What**: `view_item` na página do produto, `add_to_cart` no "Adicionar ao carrinho" e no "+" do card, `send_order_whatsapp` no envio do pedido.
**Where**: `src/components/site/TrackViewItem.tsx`
**Depends on**: T6
**Reuses**: `track`, `viewItemEvent`, `addToCartEvent`, `sendOrderEvent`
**Requirement**: CONS-01

**Done when**:

- [x] `tests/e2e/events.spec.ts` prova, com cookies aceitos: o Top Turbo envia `view_item` com id, nome, marca e preço ao GA4 e ao Pixel (C5); adicionar Frasco 1L × 2 envia `add_to_cart` com id, embalagem, quantidade e preço (C6); enviar o pedido envia `send_order_whatsapp` com o número de itens e o total (C7); com cookies recusados nenhum dos três chega às filas
- [x] Gate check passes: `npm run typecheck && npx vitest run && npx playwright test`
- [x] Test count: 4 e2e tests pass

**Tests**: e2e
**Gate**: full

**Commit**: `feat(site): mede produto, carrinho e pedido`

---

### T8: Eventos de WhatsApp, cupom e grupo ✅

**What**: `TrackedLink` nos botões que abrem o WhatsApp fora do envio do pedido (topo, banner, serviços, contato, catálogo vazio) com `click_whatsapp`; `copy_coupon` no "Copiar"; `join_group` em "Entrar no grupo de ofertas".
**Where**: `src/components/site/TrackedLink.tsx`
**Depends on**: T7
**Reuses**: `track`, `clickWhatsappEvent`, `copyCouponEvent`, `joinGroupEvent`
**Requirement**: CONS-01

**Done when**:

- [x] `tests/e2e/events.spec.ts` prova, com cookies aceitos: cada um dos 5 botões de WhatsApp envia `click_whatsapp` com o seu local (C8); "Copiar" envia `copy_coupon` (C9); "Entrar no grupo de ofertas" envia `join_group` (C10)
- [x] Gate check passes: `npm run lint && npm run typecheck && npm run build:local && npx vitest run && npx playwright test`
- [x] Test count: 3 e2e tests pass

**Tests**: e2e
**Gate**: build

**Commit**: `feat(site): mede WhatsApp, cupom e grupo`

---

### T9: Sitemap e robots ✅

**What**: `src/app/sitemap.ts` (Home, catálogo, política e produtos visíveis com `updated_at`) e `src/app/robots.ts` (permite tudo, bloqueia `/admin` e `/carrinho`, aponta o sitemap).
**Where**: `src/app/sitemap.ts`
**Depends on**: T8
**Reuses**: `sitemapEntries`, `NEXT_PUBLIC_SITE_URL`
**Requirement**: SITEMAP-01

**Done when**:

- [x] `tests/e2e/seo-tech.spec.ts` prova: `/sitemap.xml` lista a Home, `/produtos`, a política e os 12 produtos visíveis, cada um com `lastmod` igual ao `updated_at` do banco (C12); o produto oculto e qualquer `/admin` ficam de fora (C13); `/robots.txt` tem `Allow: /`, `Disallow: /admin` e `Disallow: /carrinho` e a linha `Sitemap:` (C14)
- [x] Gate check passes: `npm run typecheck && npx vitest run && npx playwright test`
- [x] Test count: 3 e2e tests pass

**Tests**: e2e
**Gate**: full

**Commit**: `feat(site): adiciona sitemap e robots`

---

### T10: JSON-LD na Home e no produto ✅

**What**: `<script type="application/ld+json">` com `localBusinessJsonLd` na Home e `productJsonLd` na página do produto.
**Where**: `src/components/site/JsonLd.tsx`
**Depends on**: T9
**Reuses**: `localBusinessJsonLd`, `productJsonLd`
**Requirement**: SITEMAP-01

**Done when**:

- [x] `tests/e2e/seo-tech.spec.ts` prova: a Home tem `AutoRepair` com nome, endereço, telefone e horários das configurações, e mudar o telefone no banco muda o JSON-LD (C15); o Top Turbo tem `Product` com nome, marca, imagem, SKU e `Offer` com 349.90 BRL e `InStock` (C16)
- [x] Gate check passes: `npm run typecheck && npx vitest run && npx playwright test`
- [x] Test count: 2 e2e tests pass

**Tests**: e2e
**Gate**: full

**Commit**: `feat(site): adiciona dados estruturados às páginas`

---

### T11: Redirecionamentos 301 ✅

**What**: `next.config.ts` lê `redirects/legacy-urls.json` com `buildRedirects`; `/contato` passa a 301.
**Where**: `next.config.ts`
**Depends on**: T10
**Reuses**: `buildRedirects`
**Requirement**: REDIR-01

**Done when**:

- [x] `tests/e2e/redirects.spec.ts` prova: cada URL do arquivo, com e sem a barra final, responde 301 com o destino mapeado (C17); `/wp-content/uploads/2019/logo.png`, `/wp-admin/` e `/feed/` respondem 301 para a Home (C18); as outras páginas com barra final seguem em 308 para a forma sem barra
- [x] Gate check passes: `npm run lint && npm run typecheck && npm run build:local && npx vitest run && npx playwright test`
- [x] Test count: 3 e2e tests pass

**Tests**: e2e
**Gate**: build

**Commit**: `feat(site): redireciona as URLs do site antigo`

---

### T12: Script de backup

**What**: `scripts/backup.mjs` (`pg_dump` do schema `public`, dados de `auth.users` e `auth.identities`, cópia do bucket `product-images` pela API do Storage, numa pasta com data); o gateway local ganha a listagem do bucket.
**Where**: `scripts/backup.mjs`
**Depends on**: T11
**Reuses**: `config.mjs`, gateway
**Requirement**: BKP-01

**Done when**:

- [ ] `tests/e2e/backup.spec.ts` prova: com o seed do site e um pedido, o script gera o dump e copia todas as fotos do bucket byte a byte; o dump restaurado num banco novo tem os mesmos produtos, embalagens, pedidos e usuários; o workflow agenda o script para segunda às 3h de Brasília (C20)
- [ ] Gate check passes: `npm run typecheck && npx vitest run && npx playwright test`
- [ ] Test count: 1 e2e test passes

**Tests**: e2e
**Gate**: full

**Commit**: `feat(ops): adiciona o script de backup`

---

### T13: Backup semanal no GitHub Actions

**What**: `.github/workflows/backup.yml` (segunda 06:00 UTC, `workflow_dispatch`, `pg_dump` 17, artefato por 90 dias, falha deixa o job vermelho) e a seção "Lançamento" do README (variáveis da Vercel, segredos do backup, conferir o Search Console antes do DNS, notificações de falha do Actions).
**Where**: `.github/workflows/backup.yml`
**Depends on**: T12
**Reuses**: `scripts/backup.mjs`
**Requirement**: BKP-01

**Done when**:

- [ ] `tests/config/backup-workflow.test.ts` prova: nenhum passo nem o job têm `continue-on-error`, o passo do script roda com `set -euo pipefail` e o script sai com erro quando o `pg_dump` falha (C21); o artefato tem `retention-days: 90` (C22)
- [ ] Gate check passes: `npm run lint && npm run typecheck && npm run build:local && npx vitest run && npx playwright test`
- [ ] Test count: 2 tests pass

**Tests**: unit
**Gate**: build

**Commit**: `feat(ops): agenda o backup semanal`

---

## Checks

**C1** - Na primeira visita aparece o aviso com "Aceitar", "Recusar" e "Política de privacidade" (CONS-01, AC 1)
Proof: `npx playwright test tests/e2e/consent.spec.ts -g "CONS-01.1:"`

**C2** - Sem aceite, GA4 e Pixel não carregam (CONS-01, AC 2)
Proof: `npx playwright test tests/e2e/consent.spec.ts -g "CONS-01.2:"`

**C3** - "Aceitar" carrega GA4 e Pixel e esconde o aviso por 180 dias (CONS-01, AC 3)
Proof: `npx playwright test tests/e2e/consent.spec.ts -g "CONS-01.3:"`

**C4** - "Recusar" esconde o aviso por 180 dias sem carregar nada (CONS-01, AC 4)
Proof: `npx playwright test tests/e2e/consent.spec.ts -g "CONS-01.4:"`

**C5** - Página de produto envia `view_item` com id, nome, marca e preço (CONS-01, AC 5)
Proof: `npx playwright test tests/e2e/events.spec.ts -g "CONS-01.5:"`

**C6** - Adicionar ao carrinho envia `add_to_cart` com id, embalagem, quantidade e preço (CONS-01, AC 6)
Proof: `npx playwright test tests/e2e/events.spec.ts -g "CONS-01.6:"`

**C7** - Enviar o pedido envia `send_order_whatsapp` com número de itens e total (CONS-01, AC 7)
Proof: `npx playwright test tests/e2e/events.spec.ts -g "CONS-01.7:"`

**C8** - Botões de WhatsApp fora do pedido enviam `click_whatsapp` com o local (CONS-01, AC 8)
Proof: `npx playwright test tests/e2e/events.spec.ts -g "CONS-01.8:"`

**C9** - Copiar o cupom envia `copy_coupon` (CONS-01, AC 9)
Proof: `npx playwright test tests/e2e/events.spec.ts -g "CONS-01.9:"`

**C10** - "Entrar no grupo de ofertas" envia `join_group` (CONS-01, AC 10)
Proof: `npx playwright test tests/e2e/events.spec.ts -g "CONS-01.10:"`

**C11** - "Preferências de cookies" no rodapé mostra o aviso de novo (CONS-01, AC 11)
Proof: `npx playwright test tests/e2e/consent.spec.ts -g "CONS-01.11:"`

**C12** - `/sitemap.xml` lista Home, catálogo, política e produtos visíveis com a data de alteração (SITEMAP-01, AC 1)
Proof: `npx playwright test tests/e2e/seo-tech.spec.ts -g "SITEMAP-01.1:"`

**C13** - O sitemap deixa de fora produtos ocultos e `/admin` (SITEMAP-01, AC 2)
Proof: `npx playwright test tests/e2e/seo-tech.spec.ts -g "SITEMAP-01.2:"`

**C14** - `/robots.txt` permite tudo, bloqueia `/admin` e `/carrinho` e aponta o sitemap (SITEMAP-01, AC 3)
Proof: `npx playwright test tests/e2e/seo-tech.spec.ts -g "SITEMAP-01.3:"`

**C15** - A Home tem JSON-LD `LocalBusiness` com os dados das configurações (SITEMAP-01, AC 4)
Proof: `npx playwright test tests/e2e/seo-tech.spec.ts -g "SITEMAP-01.4:"`

**C16** - O produto tem JSON-LD `Product` com `Offer` em BRL e disponibilidade (SITEMAP-01, AC 5)
Proof: `npx playwright test tests/e2e/seo-tech.spec.ts -g "SITEMAP-01.5:"`

**C17** - Cada URL antiga da lista responde 301 para a página nova mapeada (REDIR-01, AC 1)
Proof: `npx playwright test tests/e2e/redirects.spec.ts -g "REDIR-01.1:"`

**C18** - URLs antigas sob `/wp-content/`, `/wp-admin/` e `/feed/` respondem 301 para a Home (REDIR-01, AC 2)
Proof: `npx playwright test tests/e2e/redirects.spec.ts -g "REDIR-01.2:"`

**C19** - A lista fica num arquivo versionado com um teste que confere cada par (REDIR-01, AC 3)
Proof: `npx vitest run src/lib/domain/legacy-redirects.test.ts -t "REDIR-01.3:"`

**C20** - O backup exporta o banco com `pg_dump` e copia o bucket, agendado para segunda 3h (BKP-01, AC 1)
Proof: `npx playwright test tests/e2e/backup.spec.ts -g "BKP-01.1:"`

**C21** - Uma falha do backup deixa o job vermelho, o que faz o GitHub avisar por e-mail (BKP-01, AC 2)
Proof: `npx vitest run tests/config/backup-workflow.test.ts -t "BKP-01.2:"`

**C22** - O backup fica guardado por 90 dias (BKP-01, AC 3)
Proof: `npx vitest run tests/config/backup-workflow.test.ts -t "BKP-01.3:"`

---

## Handoff

The feature's live state, written as it happens - a compaction gives no warning.

**Settled mid-build:** execução nesta sessão, sem sub-agentes de lote (oferta com recomendação inline) - user: "aprovado, pode seguir"
**Dispatched:** none
**Walked:** not yet

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4

Phase 1:  T1 → T2 → T3 → T4
Phase 2:  T5 → T6 → T7 → T8
Phase 3:  T9 → T10 → T11
Phase 4:  T12 → T13
```

13 tarefas em sequência; recomendado executar nesta sessão, sem sub-agentes de lote. Sem captura: o protótipo não desenha o aviso de cookies, então não há fotos nem sub-agente de telas; o Verifier roda como sempre.
