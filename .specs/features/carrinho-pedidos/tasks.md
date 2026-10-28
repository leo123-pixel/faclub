# Carrinho e pedido pelo WhatsApp Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, the walk, check_proofs, the Verifier and the screens sub-agent).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/carrinho-pedidos/design.md`
**Status**: In Progress
**Approved**: 2026-10-28 - user: "aprovado, pode seguir"
**Mutations**: 3
**Build**: `npm run build:local; npm run typecheck; npm run lint`

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: `AGENTS.md`, `.specs/features/site-publico/tasks.md` (matriz aprovada da feature anterior), `vitest.config.mts`, `playwright.config.ts`.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Domínio (`src/lib/domain`) | unit | Todos os ramos; 1:1 com os critérios; os dois lados de cada limite (99, 7 dias, 30 itens, 80 e 40 caracteres) | `src/lib/domain/*.test.ts` | `npx vitest run src/lib/domain` |
| Componentes do site (`src/components/site`) | unit (jsdom) | Armazenamento bloqueado e persistência do carrinho | `src/components/site/*.test.tsx` | `npx vitest run src/components` |
| Banco (`supabase/migrations`) | integration | Limite por chave aceito e recusado; leitura de pedidos só por admin | `tests/db/*.test.ts` | `npx vitest run tests/db` |
| Rotas `/api`, páginas e painel | e2e | Caminho feliz, erros (400, 429, falha e demora) e o pedido gravado no banco | `tests/e2e/cart-*.spec.ts`, `tests/e2e/orders.spec.ts` | `npx playwright test` |
| Seed e configuração | none | - (build gate only) | - | build gate only |

## Gate Check Commands

> Generated from codebase - confirm before Execute.

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Quick | Tarefas com testes unit, de componente ou de banco | `npm run typecheck && npx vitest run` |
| Full | Tarefas com testes e2e | `npm run typecheck && npx vitest run && npx playwright test` |
| Build | Fim de fase, ou tarefas só de configuração | `npm run lint && npm run typecheck && npm run build:local && npx vitest run && npx playwright test` |

---

## Execution Plan

### Phase 1: Regras do carrinho e do pedido

```
T1 → T2 → T3 → T4
```

### Phase 2: Banco e rotas

```
T4 → T5 → T6 → T7
```

### Phase 3: Carrinho no site

```
T7 → T8 → T9 → T10 → T11 → T12 → T13
```

### Phase 4: Pedidos no painel

```
T13 → T14 → T15
```

---

## Task Breakdown

### T1: Regras do carrinho ✅

**What**: `CartLine`, `addToCart` (soma no mesmo produto e embalagem, até 99), `setQty`, `removeLine`, `cartCount`, `readCart(raw, now)` (JSON inválido ou mais de 7 dias desde a última alteração dá carrinho vazio) e `writeCart(cart, now)`.
**Where**: `src/lib/domain/cart.ts`
**Depends on**: None
**Reuses**: -
**Requirement**: CART-01

**Done when**:

- [x] `src/lib/domain/cart.test.ts` cobre: o mesmo produto e embalagem somam (2 + 3 = 5), embalagem diferente vira outra linha e a soma para em 99 (C3); 6 dias e 23 h depois o carrinho continua e 7 dias e 1 min depois abre vazio, contando da última alteração (C8); JSON inválido e versão desconhecida dão carrinho vazio; `cartCount` soma as quantidades; `setQty` fora de 1 a 99 fica no limite; `removeLine` tira só a linha
- [x] Gate check passes: `npm run typecheck && npx vitest run`
- [x] Test count: 6 tests pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(domain): adiciona regras do carrinho`

---

### T2: Preço do carrinho ✅

**What**: `priceCart(lines, rows)`: preço atual de cada linha com `variantPrice` (promocional só com oferta ativa), subtotal, total e a lista de indisponíveis (produto oculto ou removido, embalagem que saiu do cadastro); `unavailableNotice(n)`.
**Where**: `src/lib/domain/order.ts`
**Depends on**: T1
**Reuses**: `variantPrice`, `productTitle`
**Requirement**: CART-01, CART-04

**Done when**:

- [x] `src/lib/domain/order.test.ts` cobre: produto em oferta usa o promocional e sem oferta usa o normal mesmo com promocional cadastrado, subtotal = preço × quantidade e total com centavos exatos (C16); produto ausente e embalagem removida ficam indisponíveis e fora do total; `unavailableNotice` dá "1 item indisponível ficou de fora." e "2 itens indisponíveis ficaram de fora."; o preço mudou desde a adição e vale o novo (Edge Case)
- [x] Gate check passes: `npm run typecheck && npx vitest run`
- [x] Test count: 4 tests pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(domain): adiciona o cálculo de preço do carrinho`

---

### T3: Validação e mensagem do pedido ✅

**What**: `validateOrderInput(body)` (1 a 30 linhas, quantidade inteira de 1 a 99, nome até 80 e veículo até 40, com "Use até 80 caracteres no nome e 40 no veículo.") e `orderMessage({ number, items, total, name, vehicle, coupon })` com o "Modelo da mensagem" da spec.
**Where**: `src/lib/domain/order.ts`
**Depends on**: T2
**Reuses**: `formatBRL`, `whatsappLink`
**Requirement**: CART-04

**Done when**:

- [x] `src/lib/domain/order.test.ts` cobre: a mensagem com número, duas linhas "- <marca> <nome> · <embalagem> · <qtd> x R$ <preço> = R$ <subtotal>", total, nome, veículo e cupom, idêntica ao modelo, e o link `https://wa.me/55<número>?text=` com ela codificada (C13); sem nome, sem veículo e sem cupom as linhas somem, e sem número o trecho "(Pedido nº ...)" some (C14); nome de 80 e veículo de 40 passam, 81 e 41 recusam com a mensagem; 31 linhas, quantidade 0, 100 e 1,5 recusam
- [x] Gate check passes: `npm run typecheck && npx vitest run`
- [x] Test count: 4 tests pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(domain): adiciona validação e mensagem do pedido`

---

### T4: Regras da lista de pedidos ✅

**What**: `ORDER_STATUSES` ("Novo", "Atendido", "Cancelado"), `filterOrders(orders, status)` e `orderItemsSummary(items)` ("2× Lubrax Top Turbo 15W-40 · Balde 20L").
**Where**: `src/lib/domain/admin-orders.ts`
**Depends on**: T3
**Reuses**: -
**Requirement**: ORD-01

**Done when**:

- [x] `src/lib/domain/admin-orders.test.ts` cobre: filtro por cada status e "Todos"; o resumo dos itens
- [x] Gate check passes: `npm run typecheck && npx vitest run`
- [x] Test count: 2 tests pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(domain): adiciona regras da lista de pedidos`

---

### T5: Limite de envios por IP no banco ✅

**What**: Migração com `order_throttle` (RLS sem políticas) e `take_order_slot(p_key)` (`security definer`, só `service_role` executa): apaga o que passou de 10 minutos, conta a chave e aceita até 5. O seed esvazia `order_throttle` e `orders`. O teste de leitura de pedidos ganha o nome de ORD-01 AC 4.
**Where**: `supabase/migrations/20261029000100_order_throttle.sql`
**Depends on**: T4
**Reuses**: harness de `tests/db`
**Requirement**: CART-04, ORD-01

**Done when**:

- [x] `tests/db/functions.test.ts` prova: 5 chamadas com a mesma chave dão `true` e a 6ª `false`; outra chave passa; uma linha de 11 minutos atrás não conta e é apagada; `anon` e `authenticated` não executam a função nem leem a tabela
- [x] `tests/db/rls.test.ts` tem o teste "ORD-01.4: só admin lê pedidos" (C29)
- [x] Gate check passes: `npm run typecheck && npx vitest run`
- [x] Test count: 3 testes de banco novos ou renomeados passam

**Tests**: integration
**Gate**: quick

**Commit**: `feat(db): limita os envios de pedido por IP`

---

### T6: Cotação do carrinho ✅

**What**: `src/lib/supabase/service.ts` (`server-only`, chave de serviço) e `POST /api/carrinho`, que lê os produtos visíveis das linhas com o cliente anônimo e devolve `priceCart`; `SUPABASE_SERVICE_ROLE_KEY` já está no stack local.
**Where**: `src/app/api/carrinho/route.ts`
**Depends on**: T5
**Reuses**: `createPublicSupabase`, `CATALOG_SELECT`, `priceCart`
**Requirement**: CART-01

**Done when**:

- [x] `tests/e2e/cart-api.spec.ts` prova: duas linhas do seed voltam com o preço do banco, subtotais e total; a linha de um produto oculto volta como indisponível; corpo inválido dá 400
- [x] Gate check passes: `npm run typecheck && npx vitest run && npx playwright test`
- [x] Test count: 2 e2e tests pass

**Tests**: e2e
**Gate**: full

**Commit**: `feat(site): adiciona a cotação do carrinho`

---

### T7: Envio do pedido ✅

**What**: `POST /api/pedidos`: `validateOrderInput` (400), `take_order_slot` com o HMAC do IP (429), `priceCart` sem indisponíveis (só indisponíveis dá 400), cupom gravado só se marcado e ativo, insert em `orders` com a chave de serviço e resposta com número, itens e total.
**Where**: `src/app/api/pedidos/route.ts`
**Depends on**: T6
**Reuses**: `createServiceSupabase`, `priceCart`, `validateOrderInput`
**Requirement**: CART-04

**Done when**:

- [x] `tests/e2e/cart-api.spec.ts` prova: 31 linhas, quantidade 0 e quantidade 100 respondem 400 e nada é gravado (C20); um envio válido grava o pedido com o preço do banco e devolve o número; o 6º envio em 10 minutos responde 429
- [x] Gate check passes: `npm run lint && npm run typecheck && npm run build:local && npx vitest run && npx playwright test`
- [x] Test count: 3 e2e tests pass

**Tests**: e2e
**Gate**: build

**Commit**: `feat(site): adiciona o envio do pedido`

---

### T8: Carrinho no navegador ✅

**What**: `useCart` em `CartProvider.tsx` (um store com `useSyncExternalStore`, sem provider: estado, `localStorage` com `try/catch`, memória quando o armazenamento falha e sincronia entre abas) e o contador na sacola do `SiteHeader`.
**Where**: `src/components/site/CartProvider.tsx`
**Depends on**: T7
**Reuses**: `readCart`, `writeCart`, `addToCart`, `cartCount`
**Requirement**: CART-01

**Done when**:

- [x] `src/components/site/CartProvider.test.tsx` cobre: com `localStorage` que lança erro, adicionar e ler funcionam na mesma visita e nada quebra (C10); o carrinho gravado é lido ao montar e cada alteração regrava com a data
- [x] Gate check passes: `npm run typecheck && npx vitest run`
- [x] Test count: 2 tests pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(site): guarda o carrinho no navegador`

---

### T9: Adicionar ao carrinho ✅

**What**: "Adicionar ao carrinho" da página do produto (embalagem e quantidade escolhidas) e "+" do card (1 unidade da primeira embalagem) passam a adicionar e mostram "Adicionado ao carrinho" com "Ver carrinho"; `CART_SOON` sai.
**Where**: `src/components/site/PurchaseBox.tsx`
**Depends on**: T8
**Reuses**: `CartProvider`
**Requirement**: CART-01

**Done when**:

- [x] `tests/e2e/cart.spec.ts` prova: no Top Turbo, Frasco 1L com quantidade 3 e "Adicionar ao carrinho" mostram "Adicionado ao carrinho" e "Ver carrinho", e `/carrinho` tem a linha Frasco 1L × 3 (C1); o "+" do card do Super adiciona 1 Frasco 1L (C2); o contador da sacola mostra 4, some com o carrinho vazio e não aparece na primeira visita (C4)
- [x] Gate check passes: `npm run typecheck && npx vitest run && npx playwright test`
- [x] Test count: 3 e2e tests pass

**Tests**: e2e
**Gate**: full

**Commit**: `feat(site): liga os botões de adicionar ao carrinho`

---

### T10: Página do carrinho ✅

**What**: `(site)/carrinho/page.tsx` com `CartView`: linhas com marca, nome, embalagem, quantidade de 1 a 99, preço atual, subtotal, "Remover", total estimado, "Indisponível", aviso de preço, caixa do cupom desmarcada (só com cupom ativo) e o vazio com "Ver produtos".
**Where**: `src/components/site/CartView.tsx`
**Depends on**: T9
**Reuses**: `CartProvider`, `/api/carrinho`, `loadSettings`, `loadCoupon`, `applyQuote` (nova em `order.ts`: reaplica a última cotação às quantidades, com teste unit)
**Requirement**: CART-01, CART-04

**Done when**:

- [x] `tests/e2e/cart.spec.ts` prova: mudar a quantidade muda o subtotal e o total na hora (C5); "Remover" tira o item (C6); com o relógio 6 dias à frente, uma aba nova do mesmo navegador mostra os mesmos itens e contador (C7); o carrinho vazio mostra "Seu carrinho está vazio." e "Ver produtos" (C9); um produto ocultado depois da adição aparece como "Indisponível" e um preço mudado aparece novo (C11); o aviso "Preço e disponibilidade são confirmados no atendimento pelo WhatsApp." (C12); com o FACLUB10 ativo a caixa "Quero fazer a troca na loja com o cupom FACLUB10" aparece desmarcada e, sem cupom ativo, some (C24)
- [x] Gate check passes: `npm run typecheck && npx vitest run && npx playwright test`
- [x] Test count: 7 e2e tests pass

**Tests**: e2e
**Gate**: full

**Commit**: `feat(site): adiciona a página do carrinho`

---

### T11: Enviar o pedido pelo WhatsApp ✅

**What**: Nome, veículo e "Enviar pedido pelo WhatsApp" no `CartView`: o clique abre uma aba, chama `/api/pedidos`, monta a mensagem com o número e manda a aba para o WhatsApp; esvazia o carrinho e mostra "Pedido enviado! Termine a conversa no WhatsApp." com "Abrir o WhatsApp de novo"; botão desativado durante o envio.
**Where**: `src/components/site/CartView.tsx`
**Depends on**: T10
**Reuses**: `orderMessage`, `whatsappLink`
**Requirement**: CART-04

**Done when**:

- [x] `tests/e2e/cart-send.spec.ts` prova: com 2 itens e nome, o envio grava em `orders` itens com nome, embalagem, quantidade e preço, total, nome, veículo, status "Novo" e a página de origem, e a aba do WhatsApp abre com o número do pedido (C15); o carrinho fica vazio e aparece "Pedido enviado! Termine a conversa no WhatsApp." com "Abrir o WhatsApp de novo" (C21); a linha gravada não tem telefone, e-mail nem IP (C22); com a caixa do cupom marcada a mensagem tem "Cupom: FACLUB10 (troca na loja)" e o pedido grava `coupon_code` (C25); nome de 81 caracteres mostra "Use até 80 caracteres no nome e 40 no veículo." e nada é gravado (C19); dois cliques seguidos gravam um pedido só (Edge Case)
- [x] Gate check passes: `npm run typecheck && npx vitest run && npx playwright test`
- [x] Test count: 6 e2e tests pass

**Tests**: e2e
**Gate**: full

**Commit**: `feat(site): envia o pedido pelo WhatsApp`

---

### T12: Falhas no envio ✅

**What**: Item indisponível fica de fora com o aviso; 429 mostra a mensagem da spec; falha ou mais de 5 s abrem o WhatsApp com a mesma mensagem sem o número.
**Where**: `src/components/site/CartView.tsx`
**Depends on**: T11
**Reuses**: `unavailableNotice`, `orderMessage`
**Requirement**: CART-04

**Done when**:

- [x] `tests/e2e/cart-send.spec.ts` prova: com um item ocultado o pedido sai sem ele e aparece "1 item indisponível ficou de fora." (C17); depois de 5 envios, o 6º mostra "Muitos pedidos seguidos. Espere alguns minutos ou fale direto no WhatsApp." (C18); com `/api/pedidos` falhando e com ele demorando 6 s, a aba do WhatsApp abre com a mensagem sem "(Pedido nº" (C23)
- [x] Gate check passes: `npm run typecheck && npx vitest run && npx playwright test`
- [x] Test count: 3 e2e tests pass

**Tests**: e2e
**Gate**: full

**Commit**: `feat(site): trata falhas no envio do pedido`

---

### T13: Política de privacidade com o limite de envios ✅

**What**: A política ganha a frase sobre o limite de envios: o site guarda por 10 minutos uma versão cifrada do endereço de internet, só para barrar envios em série, e o pedido não guarda IP.
**Where**: `src/app/(site)/politica-de-privacidade/page.tsx`
**Depends on**: T12
**Reuses**: -
**Requirement**: CART-04

**Done when**:

- [x] `tests/e2e/site-footer.spec.ts` (PRIV-01.1) confere a frase nova
- [x] Gate check passes: `npm run lint && npm run typecheck && npm run build:local && npx vitest run && npx playwright test`

**Tests**: e2e
**Gate**: build

**Commit**: `docs(site): explica o limite de envios na política de privacidade`

---

### T14: Lista de pedidos no painel ✅

**What**: `/admin/pedidos` com os pedidos do mais novo ao mais antigo: número, data e hora, itens, total estimado, nome, veículo, cupom e status; "Nenhum pedido ainda." sem pedidos.
**Where**: `src/app/admin/(painel)/pedidos/page.tsx`
**Depends on**: T13
**Reuses**: `PageHeader`, `orderItemsSummary`, `formatBRL`
**Requirement**: ORD-01

**Done when**:

- [x] `tests/e2e/orders.spec.ts` prova: com três pedidos gravados no teste, a lista mostra o mais novo primeiro com número, data e hora, itens, total, nome, veículo, cupom e status (C26); sem pedidos aparece "Nenhum pedido ainda." (C30)
- [x] Gate check passes: `npm run typecheck && npx vitest run && npx playwright test`
- [x] Test count: 2 e2e tests pass

**Tests**: e2e
**Gate**: full

**Commit**: `feat(painel): adiciona a lista de pedidos`

---

### T15: Status e filtro dos pedidos ✅

**What**: Seletor de status por pedido com gravação sem recarregar (Server Action com `requireAdmin` e `revalidatePath`) e abas "Todos", "Novo", "Atendido" e "Cancelado" na URL (`?status=`).
**Where**: `src/app/admin/(painel)/pedidos/OrderStatus.tsx`
**Depends on**: T14
**Reuses**: padrão de `RowToggle`, `filterOrders`
**Requirement**: ORD-01

**Done when**:

- [x] `tests/e2e/orders.spec.ts` prova: trocar "Novo" por "Atendido" grava sem recarregar e continua depois de recarregar (C27); a aba "Atendido" mostra só os atendidos e "Novo" só os novos (C28)
- [x] Gate check passes: `npm run lint && npm run typecheck && npm run build:local && npx vitest run && npx playwright test`
- [x] Test count: 2 e2e tests pass

**Tests**: e2e
**Gate**: build

**Commit**: `feat(painel): muda o status e filtra os pedidos`

---

## Checks

**C1** - Adicionar na página do produto põe a embalagem e a quantidade escolhidas no carrinho e mostra "Adicionado ao carrinho" com "Ver carrinho" (CART-01, AC 1)
Proof: `npx playwright test tests/e2e/cart.spec.ts -g "CART-01.1:"`

**C2** - O "+" do card adiciona 1 unidade da primeira embalagem (CART-01, AC 2)
Proof: `npx playwright test tests/e2e/cart.spec.ts -g "CART-01.2:"`

**C3** - O mesmo produto e embalagem somam na quantidade, até 99 (CART-01, AC 3)
Proof: `npx vitest run src/lib/domain/cart.test.ts -t "CART-01.3:"`

**C4** - O contador do topo soma as quantidades e some com o carrinho vazio (CART-01, AC 4)
Proof: `npx playwright test tests/e2e/cart.spec.ts -g "CART-01.4:"`

**C5** - Mudar a quantidade muda o subtotal e o total na hora (CART-01, AC 5)
Proof: `npx playwright test tests/e2e/cart.spec.ts -g "CART-01.5:"`

**C6** - "Remover" tira o item do carrinho (CART-01, AC 6)
Proof: `npx playwright test tests/e2e/cart.spec.ts -g "CART-01.6:"`

**C7** - Fechar o navegador e voltar em até 7 dias mantém os itens (CART-01, AC 7)
Proof: `npx playwright test tests/e2e/cart.spec.ts -g "CART-01.7:"`

**C8** - Depois de 7 dias sem alteração o carrinho abre vazio (CART-01, AC 8)
Proof: `npx vitest run src/lib/domain/cart.test.ts -t "CART-01.8:"`

**C9** - Carrinho vazio mostra "Seu carrinho está vazio." e "Ver produtos" (CART-01, AC 9)
Proof: `npx playwright test tests/e2e/cart.spec.ts -g "CART-01.9:"`

**C10** - Com o armazenamento bloqueado o carrinho funciona durante a visita (CART-01, AC 10)
Proof: `npx vitest run src/components/site/CartProvider.test.tsx -t "CART-01.10:"`

**C11** - `/carrinho` busca o preço atual e marca "Indisponível" o que está oculto ou não existe (CART-01, AC 11)
Proof: `npx playwright test tests/e2e/cart.spec.ts -g "CART-01.11:"`

**C12** - `/carrinho` mostra "Preço e disponibilidade são confirmados no atendimento pelo WhatsApp." (CART-04, AC 1)
Proof: `npx playwright test tests/e2e/cart.spec.ts -g "CART-04.1:"`

**C13** - O envio abre `https://wa.me/55<WhatsApp>` com o texto do modelo, uma linha por item (CART-04, AC 2)
Proof: `npx vitest run src/lib/domain/order.test.ts -t "CART-04.2:"`

**C14** - Sem nome ou veículo a mensagem sai sem a linha (CART-04, AC 3)
Proof: `npx vitest run src/lib/domain/order.test.ts -t "CART-04.3:"`

**C15** - O servidor grava itens, total, nome, veículo, status "Novo" e a página de origem antes de abrir o WhatsApp (CART-04, AC 4)
Proof: `npx playwright test tests/e2e/cart-send.spec.ts -g "CART-04.4:"`

**C16** - Preços e total vêm do banco, com o promocional só em oferta ativa (CART-04, AC 5)
Proof: `npx playwright test tests/e2e/cart-api.spec.ts -g "CART-04.5:"`

**C17** - Itens indisponíveis ficam de fora e o carrinho avisa quantos (CART-04, AC 6)
Proof: `npx playwright test tests/e2e/cart-send.spec.ts -g "CART-04.6:"`

**C18** - Mais de 5 pedidos do mesmo IP em 10 minutos dão 429 e a mensagem da spec (CART-04, AC 7)
Proof: `npx playwright test tests/e2e/cart-send.spec.ts -g "CART-04.7:"`

**C19** - Nome acima de 80 ou veículo acima de 40 não envia e mostra a mensagem (CART-04, AC 8)
Proof: `npx playwright test tests/e2e/cart-send.spec.ts -g "CART-04.8:"`

**C20** - Mais de 30 itens ou quantidade fora de 1 a 99 dá 400 (CART-04, AC 9)
Proof: `npx playwright test tests/e2e/cart-api.spec.ts -g "CART-04.9:"`

**C21** - Depois do envio o carrinho fica vazio e aparece "Pedido enviado! Termine a conversa no WhatsApp." (CART-04, AC 10)
Proof: `npx playwright test tests/e2e/cart-send.spec.ts -g "CART-04.10:"`

**C22** - O pedido guarda só nome e veículo, sem telefone, e-mail ou IP (CART-04, AC 11)
Proof: `npx playwright test tests/e2e/cart-send.spec.ts -g "CART-04.11:"`

**C23** - Falha ou demora acima de 5 s abrem o WhatsApp com a mensagem sem o número (CART-04, AC 12)
Proof: `npx playwright test tests/e2e/cart-send.spec.ts -g "CART-04.12:"`

**C24** - Com cupom ativo aparece a caixa do cupom, desmarcada (CART-04, AC 13)
Proof: `npx playwright test tests/e2e/cart.spec.ts -g "CART-04.13:"`

**C25** - Caixa marcada põe "Cupom: <código> (troca na loja)" na mensagem e grava `coupon_code` (CART-04, AC 14)
Proof: `npx playwright test tests/e2e/cart-send.spec.ts -g "CART-04.14:"`

**C26** - "Pedidos" lista do mais novo ao mais antigo com número, data e hora, itens, total, nome, veículo, cupom e status (ORD-01, AC 1)
Proof: `npx playwright test tests/e2e/orders.spec.ts -g "ORD-01.1:"`

**C27** - Mudar o status grava sem recarregar a página (ORD-01, AC 2)
Proof: `npx playwright test tests/e2e/orders.spec.ts -g "ORD-01.2:"`

**C28** - O filtro por status mostra só os pedidos daquele status (ORD-01, AC 3)
Proof: `npx playwright test tests/e2e/orders.spec.ts -g "ORD-01.3:"`

**C29** - O banco recusa a leitura de `orders` sem sessão de admin (ORD-01, AC 4)
Proof: `npx vitest run tests/db/rls.test.ts -t "ORD-01.4:"`

**C30** - Sem pedidos a lista mostra "Nenhum pedido ainda." (ORD-01, AC 5)
Proof: `npx playwright test tests/e2e/orders.spec.ts -g "ORD-01.5:"`

**C31** - Sem cotação e sem gravação, o plano B lista os itens com "preço a confirmar" e o total "a confirmar" (CART-05, AC 1)
Proof: `npx playwright test tests/e2e/cart-send.spec.ts -g "CART-05.1:"`

---

## Handoff

The feature's live state, written as it happens - a compaction gives no warning.

**Settled mid-build:** CART-05 (plano B sem cotação) e a prova de C16 na rota entram como achados do Verifier, 2026-10-28; execução nesta sessão, sem sub-agentes de lote (oferta com recomendação inline) - user: "aprovado, pode seguir"
**Dispatched:** Verifier (validate.md) sobre o HEAD com `proofs.md` de 5ba17a5, 2026-10-28; sem screens sub-agent (nenhum critério cita captura); o Verifier roda só Vitest e o orquestrador roda `check_proofs --mutations` depois; Verifier returned (FAIL, 7 achados, 2 mutações Vitest mortas, a de C18 fica para o check_proofs)
**Walked:** 2026-10-28, app de `E2E_SKIP_BUILD=1 node scripts/local-supabase/start.mjs --app` (depois de `npm run build:local`) em http://localhost:3100, com `node scripts/local-supabase/seed.mjs --site` e `POST /api/revalidar` com `Authorization: Bearer revalidar-local`; o endereço `wa.me` foi interceptado para a aba abrir sem sair para a internet. Sem capturas: o protótipo não desenha o carrinho nem os pedidos, então não há fotos. CART-01: no Top Turbo, Frasco 1L com quantidade 2 e "Adicionar ao carrinho" mostram "Adicionado ao carrinho" e "Ver carrinho"; o "+" do Filtro de ar no catálogo adiciona 1 Unidade; o contador mostra 3; fechado o navegador (estado salvo e reaberto), `/carrinho` mostra as duas linhas, o contador 3 e o total R$ 139,70. CART-04: com o nome "João da Oficina", "Enviar pedido pelo WhatsApp" abre `https://wa.me/551129545764` com "Olá! Quero fazer este pedido pelo site (Pedido nº 1):", as duas linhas, "Total estimado: R$ 139,70" e "Nome: João da Oficina", e a página mostra "Pedido enviado! Termine a conversa no WhatsApp." com "Abrir o WhatsApp de novo". ORD-01: no painel (`contato@onbind.com.br` / `faclub-admin-123`), "Pedidos" mostra o Pedido nº 1 como "Novo" com os itens, o total e o nome; mudar para "Atendido" e filtrar por "Atendido" lista só o Pedido nº 1. Também conferidos a 1440 e a 390 px: carrinho em duas colunas no computador e numa coluna no celular, sem rolagem lateral.

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4

Phase 1:  T1 → T2 → T3 → T4
Phase 2:  T5 → T6 → T7
Phase 3:  T8 → T9 → T10 → T11 → T12 → T13
Phase 4:  T14 → T15
```

15 tarefas em sequência (cada fase usa as regras e as rotas das anteriores); recomendado executar nesta sessão, sem sub-agentes de lote. Sem captura: o protótipo não desenha o carrinho nem a lista de pedidos, então não há fotos nem sub-agente de telas; o Verifier roda como sempre.
