# Site público: Home, Catálogo e Produto Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, the walk, check_proofs, the Verifier and the screens sub-agent).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/site-publico/design.md`
**Status**: In Progress
**Approved**: 2026-10-28 - user: "aprovado, pode seguir"
**Mutations**: 3
**Build**: `npm run build:local; npm run typecheck; npm run lint`

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: `AGENTS.md` (ler a documentação do Next antes de escrever código), `.specs/features/painel-catalogo/tasks.md` e `.specs/features/painel-conteudo/tasks.md` (matrizes aprovadas), `vitest.config.mts`, `playwright.config.ts`.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Domínio (`src/lib/domain`) | unit | Todos os ramos; 1:1 com os critérios; os dois lados de cada limite | `src/lib/domain/*.test.ts` | `npx vitest run src/lib/domain` |
| Componentes do site (`src/components/site`) | unit (jsdom) | Cada gesto que um critério nomeia (copiar, trocar foto, embalagem, quantidade, foto quebrada) | `src/components/site/*.test.tsx` | `npx vitest run src/components` |
| Páginas, layout e `/api/revalidar` | e2e | Caminho feliz, vazio e erro; o efeito de uma gravação no painel aparecendo no site | `tests/e2e/site-*.spec.ts` | `npx playwright test` |
| Carregadores de dados (`src/lib/data`) | e2e | Cobertos pelas páginas (só leitura anônima com RLS, já testado em `tests/db`) | `tests/e2e/site-*.spec.ts` | `npx playwright test` |
| Seed, fotos estáticas e configuração | none | - (build gate only) | - | build gate only |

## Gate Check Commands

> Generated from codebase - confirm before Execute.

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Quick | Tarefas com testes unit ou de componente | `npx vitest run` |
| Full | Tarefas com testes e2e | `npx vitest run && npx playwright test` |
| Build | Fim de fase, ou tarefas só de configuração | `npm run lint && npm run typecheck && npm run build:local && npx vitest run && npx playwright test` |

---

## Execution Plan

### Phase 1: Regras do site

```
T1 → T2 → T3 → T4
```

### Phase 2: Dados, revalidação e moldura

```
T4 → T5 → T6 → T7 → T8
```

### Phase 3: Card e Home

```
T8 → T9 → T10 → T11 → T12 → T13
```

### Phase 4: Catálogo

```
T13 → T14
```

### Phase 5: Página do produto

```
T14 → T15 → T16 → T17
```

### Phase 6: Atualização e metatags

```
T17 → T18 → T19
```

---

## Task Breakdown

### T1: Configurações do site com valores padrão ✅

**What**: `INITIAL_SETTINGS` (valores iniciais de painel-conteudo), `withDefaults(row | null)` (linha vazia ou campo vazio obrigatório volta ao inicial; grupo e Instagram ficam vazios), `SITE_MESSAGES` e os links `scheduleLink`, `budgetLink` e `contactLink`.
**Where**: `src/lib/domain/site-settings.ts`
**Depends on**: None
**Reuses**: `whatsappLink`, `DEFAULT_SCHEDULE_MESSAGE` de `settings-input.ts`
**Requirement**: HEAD-01, HOME-01

**Done when**:

- [x] `src/lib/domain/site-settings.test.ts` cobre: `withDefaults(null)` devolve os valores iniciais (Edge Case de `settings` vazia); campo de texto vazio volta ao inicial e grupo vazio continua vazio; `scheduleLink` monta `https://wa.me/55<dígitos>?text=` com a mensagem das configurações; `budgetLink` e `contactLink` usam "Olá! Quero um orçamento." e "Olá! Vim pelo site da FAC LUB."
- [x] Gate check passes: `npx vitest run`
- [x] Test count: 4 tests pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(domain): adiciona configurações do site com valores padrão`

---

### T2: Busca, filtro, ordem e contagem do catálogo ✅

**What**: `CatalogItem`, `toCatalogItem(row)`, `cardPrice(item)` (primeira embalagem; promocional só com oferta ligada), `filterCatalog(items, { category, query })`, `sortCatalog(items, sort)` (`destaques`: destaque, depois oferta, depois A–Z; `menor-preco`; `maior-preco`; `a-z`), `productCountLabel(n)` e `CATALOG_PAGE = 12`.
**Where**: `src/lib/domain/catalog.ts`
**Depends on**: T1
**Reuses**: `matchesSearch`, `productTitle`, `displayVariant`
**Requirement**: CAT-01

**Done when**:

- [x] `src/lib/domain/catalog.test.ts` cobre: "15w40", "15W-40", "15w 40" e "15W40" acham os mesmos itens 15W-40 (C30); "lubrax", "LUBRAX" e "Lubrax" acham os mesmos (C31); "oleo" e "óleo" acham os mesmos (C32); "diesel 15w40" acha só itens com as duas palavras em qualquer campo e "15w40 diesel" dá o mesmo (C33); cada ordem com categoria e busca juntas, incluindo preço promocional usado só com oferta ligada (C34); 0, 1 e 12 dão "0 produtos", "1 produto" e "12 produtos" (C35)
- [x] Gate check passes: `npx vitest run`
- [x] Test count: 10 tests pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(domain): adiciona busca, filtro e ordem do catálogo`

---

### T3: Regras da Home ✅

**What**: `activeBanner(banners)` (ativo de menor ordem ou o topo padrão), `activeCoupon(coupons)` (o ativo mais antigo, já que o `id` é uuid, ou nenhum), `couponBadge`, `couponHeadline` e `couponStoreNote` (textos com o percentual), `featuredProducts(items)` (até 4 com destaque) e `splitAddress` (rua e bairro do endereço).
**Where**: `src/lib/domain/home.ts`
**Depends on**: T2
**Reuses**: `CatalogItem`
**Requirement**: HOME-01

**Done when**:

- [x] `src/lib/domain/home.test.ts` cobre: dois banners ativos dão o de menor ordem e nenhum ativo dá o topo padrão "Troca de óleo e filtros com quem entende do assunto"; cupom inativo some; o selo do FACLUB10; 6 destaques viram 4 e 0 destaques viram lista vazia; o endereço vira rua ("R. Cabo Antônio Alves, 50") e bairro
- [x] Gate check passes: `npx vitest run`
- [x] Test count: 6 tests pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(domain): adiciona regras da home`

---

### T4: Regras da página do produto ✅

**What**: `specRows(product)` (Viscosidade, Tipo, Especificação API, Aplicação, Código e Disponibilidade, sem linha de campo vazio), `availability(stock)`, `packageCaption(label)` ("à vista · balde 20L"), `chipOrder(variants)` (chips do menor ao maior, como na captura) e `relatedProducts(product, items)` (até 4 de outras categorias, destaques primeiro).
**Where**: `src/lib/domain/product-page.ts`
**Depends on**: T3
**Reuses**: `CatalogItem`
**Requirement**: PDP-01

**Done when**:

- [x] `src/lib/domain/product-page.test.ts` cobre: produto completo dá as 6 linhas na ordem e sem API nem SKU dá 4 (C50); estoque 0 dá "Sob consulta" e 1 dá "Pronta entrega" (C51); relacionados excluem a mesma categoria e o próprio produto, põem destaques antes e param em 4, e um catálogo só da mesma categoria dá lista vazia (C54); a legenda da embalagem; a ordem dos chips
- [x] Gate check passes: `npx vitest run`
- [x] Test count: 5 tests pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(domain): adiciona regras da página do produto`

---

### T5: Dados públicos e seed do site ✅

**What**: Cliente Supabase anônimo sem cookies (`src/lib/supabase/public.ts`); `loadSettings`, `loadHomeData`, `loadCatalog` e `loadProductBySlug` lançando erro quando a consulta falha; `seed({ site: true })` com os 12 produtos visíveis da captura do catálogo (os 8 do painel com o Filtro de óleo visível, mais Mobil Delvac 15W-40, Filtro de ar, Graxa multiuso e Fluido de direção), um oculto, 4 destaques, marcas e um banner ativo; as 5 fotos do protótipo em `public/images/home/`.
**Where**: `src/lib/data/public.ts`
**Depends on**: T4
**Reuses**: `withDefaults`, `toCatalogItem`, `publicImageUrl`, `seed.mjs`
**Requirement**: HOME-01, CAT-01, PDP-01

**Done when**:

- [x] `node scripts/local-supabase/seed.mjs --site` deixa 12 produtos visíveis e um oculto; o seed sem a opção continua igual (os testes do painel passam)
- [x] Gate check passes: `npm run lint && npm run typecheck && npm run build:local && npx vitest run && npx playwright test`

**Tests**: none
**Gate**: build

**Commit**: `feat(site): adiciona leitura pública dos dados e seed do site`

---

### T6: Revalidação manual do site ✅

**What**: `POST /api/revalidar` com `Authorization: Bearer <REVALIDATE_SECRET>` chama `revalidatePath('/', 'layout')`; sem o segredo certo responde 401. Helper `refreshSite()` nos testes e2e, chamado depois do seed; `REVALIDATE_SECRET` no stack local (o repositório não versiona `.env*`; a variável entra na configuração da Vercel na feature lancamento).
**Where**: `src/app/api/revalidar/route.ts`
**Depends on**: T5
**Reuses**: `scripts/local-supabase/config.mjs`
**Requirement**: HOME-01, CAT-01

**Done when**:

- [x] `tests/e2e/site-revalidate.spec.ts` prova: sem cabeçalho e com segredo errado dá 401; com o segredo dá 200
- [x] Gate check passes: `npx vitest run && npx playwright test`
- [x] Test count: 2 e2e tests pass

**Tests**: e2e
**Gate**: full

**Commit**: `feat(site): adiciona revalidação manual do site`

---

### T7: Topo do site ✅

**What**: Grupo de rotas `(site)` com o layout público; a Home provisória vai para `(site)/page.tsx`. `SiteHeader` com logo, "Serviços", "Produtos" e "Contato" (atual em negrito com `aria-current`), sacola "Carrinho" para `/carrinho`, "Agendar troca" com `scheduleLink`, fixo no alto; abaixo de 768 px o menu abre pelo botão "Abrir menu". `start.mjs` passa a rodar o `next build` de forma assíncrona: o gateway roda no mesmo processo e precisa responder às consultas da Home que o build pré-gera.
**Where**: `src/components/site/SiteHeader.tsx`
**Depends on**: T6
**Reuses**: `scheduleLink`, `loadSettings`, logo em `public/brand`
**Requirement**: HEAD-01

**Done when**:

- [x] `tests/e2e/site-header.spec.ts` prova: a 360 px "Agendar troca" está dentro da tela sem rolar em `/`, `/produtos` e numa página de produto (C1); depois de rolar 2000 px o topo continua no alto (C2); "Agendar troca" aponta para `https://wa.me/551129545764?text=` com a mensagem de agendamento das configurações (C3); os três links existem e o da página atual tem peso negrito e `aria-current="page"` (C4); a 390 px os links ficam escondidos até "Abrir menu" e "Agendar troca" segue à vista (C5); a sacola "Carrinho" fica entre o menu e "Agendar troca" e leva a `/carrinho` (C6)
- [x] Gate check passes: `npx vitest run && npx playwright test`
- [x] Test count: 6 e2e tests pass

**Tests**: e2e
**Gate**: full

**Commit**: `feat(site): adiciona topo do site`

---

### T8: Rodapé, política de privacidade e /contato ✅

**What**: `SiteFooter` nas duas formas das capturas (completa na Home, curta nas demais), `(site)/politica-de-privacidade/page.tsx` com dados do pedido, finalidade, cookies de GA4 e Meta Pixel e o e-mail das configurações, e `/contato` redirecionando para `/#contato` em `next.config.ts`.
`npm run build:local` (`start.mjs --build`) gera o build com o Supabase local no ar: as páginas públicas são pré-geradas lendo o banco, e o `npm run build` sem Supabase configurado falha.
**Where**: `src/components/site/SiteFooter.tsx`
**Depends on**: T7
**Reuses**: `loadSettings`
**Requirement**: HOME-01, PRIV-01

**Done when**:

- [x] `tests/e2e/site-footer.spec.ts` prova: o rodapé da Home tem "© <ano atual> FAC Lubrificantes", "Produtos", "Política de privacidade" e "Área administrativa", e "Instagram" com o link configurado (C16); `/politica-de-privacidade` fala de nome e veículo, finalidade, GA4, Meta Pixel e mostra `contato@faclubrificantes.com.br` (C57); o link "Política de privacidade" está no rodapé de `/`, `/produtos`, de um produto e da própria política (C58); `/contato` termina em `/#contato`
- [x] Gate check passes: `npm run lint && npm run typecheck && npm run build:local && npx vitest run && npx playwright test`
- [x] Test count: 4 e2e tests pass

**Tests**: e2e
**Gate**: build

**Commit**: `feat(site): adiciona rodapé, política de privacidade e /contato`

---

### T9: Card de produto ✅

**What**: `ProductCard` da captura: foto (ou imagem neutra quando não há foto ou ela não carrega), selo "Oferta", "Marca · Embalagem", nome, preço com o normal riscado em oferta e o botão "+" com o aviso "O carrinho chega em breve. Peça pelo WhatsApp."; o card inteiro leva a `/produtos/<slug>`.
**Where**: `src/components/site/ProductCard.tsx`
**Depends on**: T8
**Reuses**: `cardPrice`, `formatBRL`, `IconBucket`
**Requirement**: CAT-01, HOME-01

**Done when**:

- [x] `src/components/site/ProductCard.test.tsx` cobre: item em oferta mostra "Oferta", o promocional e o normal riscado, e fora de oferta só o preço (C38); mostra marca, embalagem, nome e "R$ 1.234,56" para 1234.56 (C39); `onError` da foto troca pela imagem neutra (Edge Case); o link vai para `/produtos/<slug>`
- [x] Gate check passes: `npx vitest run`
- [x] Test count: 4 tests pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(site): adiciona card de produto`

---

### T10: Topo, faixa e marcas da Home ✅

**What**: Topo com o banner ativo (título, texto, foto e link) ou o padrão com a foto do box de serviço, "Agendar pelo WhatsApp" e "Ver produtos"; faixa com horários, endereço e o selo do cupom; seção de marcas em texto cinza (logo quando houver), em ordem alfabética.
**Where**: `src/app/(site)/page.tsx`
**Depends on**: T9
**Reuses**: `activeBanner`, `couponBadge`, `loadHomeData`, `next/image`
**Requirement**: HOME-01

**Done when**:

- [x] `tests/e2e/site-home.spec.ts` prova: com o banner do seed o topo mostra título, texto, foto e o link dele (C8); a faixa mostra "Seg a Sex 7h às 18h", "Sábado 8h às 13h", o endereço e "10% OFF · FACLUB10" (C9); a seção de marcas lista as marcas do seed e uma nova, em ordem alfabética, já que `brands` não tem campo de ordem (C10); "Ver produtos" abre `/produtos` (C12)
- [x] Gate check passes: `npx vitest run && npx playwright test`
- [x] Test count: 4 e2e tests pass

**Tests**: e2e
**Gate**: full

**Commit**: `feat(site): adiciona topo, faixa e marcas da home`

---

### T11: Serviços, por que a FAC LUB e destaques ✅

**What**: Os 6 cards de "Nossos serviços" no fundo escuro, os 3 de "Por que a FAC LUB" com as fotos do protótipo e "Produtos em destaque" com até 4 `ProductCard` e "Ver todos"; a seção some sem destaques.
**Where**: `src/app/(site)/page.tsx`
**Depends on**: T10
**Reuses**: `featuredProducts`, `ProductCard`
**Requirement**: HOME-01

**Done when**:

- [x] `tests/e2e/site-home.spec.ts` prova: "Produtos em destaque" mostra 4 destaques visíveis, sem o quinto nem o oculto, e, sem destaques no banco, a seção some (C11); "Ver produtos" e "Ver todos" abrem `/produtos` (C12); um card abre a página do produto dele (C13)
- [x] Gate check passes: `npx vitest run && npx playwright test`
- [x] Test count: 3 e2e tests pass

**Tests**: e2e
**Gate**: full

**Commit**: `feat(site): adiciona serviços, diferenciais e destaques da home`

---

### T12: Bloco do cupom ✅

**What**: `CouponBlock` com o código, "Copiar" (rótulo "Copiado" por 2 s; sem permissão, seleciona o código e mostra "Selecione e copie o código."), o texto da spec, o aviso de que vale só para serviços na loja e "Entrar no grupo de ofertas" em nova aba (escondido sem link); a seção some sem cupom ativo.
**Where**: `src/components/site/CouponBlock.tsx`
**Depends on**: T11
**Reuses**: `activeCoupon`, foto do mecânico do protótipo
**Requirement**: CUPOM-01, HOME-01

**Done when**:

- [x] `src/components/site/CouponBlock.test.tsx` cobre: "Copiar" grava FACLUB10 na área de transferência e o rótulo vira "Copiado" e volta depois de 2 s (C22); com `clipboard.writeText` recusado o código fica selecionado e aparece "Selecione e copie o código." (C23); o texto "Mostre o cupom no atendimento e entre no grupo para receber as ofertas da semana." e o aviso de serviços na loja aparecem (C24); "Entrar no grupo de ofertas" tem o link do grupo, `target="_blank"` e `rel="noopener noreferrer"` (C25)
- [x] Gate check passes: `npx vitest run`
- [x] Test count: 5 tests pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(site): adiciona bloco do cupom`

---

### T13: Contato e mapa da Home ✅

**What**: Seção "Passa aqui na FAC LUB" (`#contato`) com endereço, horários, telefone (`tel:`), e-mail (`mailto:`), "Chamar no WhatsApp" e `MapEmbed` (iframe do Google Maps com `loading="lazy"`); botões de Instagram e grupo escondidos quando o link está vazio.
**Where**: `src/components/site/MapEmbed.tsx`
**Depends on**: T12
**Reuses**: `contactLink`, `formatPhone`
**Requirement**: HOME-01

**Done when**:

- [x] A Home a 1440 px confere com `.specs/features/site-publico/captures/home.png` (C7, provado no walk)
- [x] `tests/e2e/site-home.spec.ts` prova: a seção mostra endereço, horários, "(11) 2954-5764", o e-mail e um iframe do Google Maps com o endereço codificado (C14); o telefone tem `href="tel:+551129545764"` e o e-mail `href="mailto:contato@faclubrificantes.com.br"` (C15); com Instagram e grupo vazios os dois botões somem e, preenchidos, aparecem (C17)
- [x] Gate check passes: `npm run lint && npm run typecheck && npm run build:local && npx vitest run && npx playwright test`
- [x] Test count: 3 e2e tests pass

**Tests**: e2e
**Gate**: build

**Commit**: `feat(site): adiciona contato e mapa da home`

---

### T14: Catálogo ✅

**What**: `(site)/produtos/page.tsx` com título, texto, e `CatalogBrowser` (cliente): chips de categoria na ordem do painel, busca, ordem, contador, grade de `ProductCard`, "Carregar mais" e o vazio com "Chamar no WhatsApp"; estado em `?categoria=`, `?q=` e `?ordem=` com `history.replaceState`.
**Where**: `src/components/site/CatalogBrowser.tsx`
**Depends on**: T13
**Reuses**: `filterCatalog`, `sortCatalog`, `productCountLabel`, `CATALOG_PAGE`, `contactLink`, `loadCatalog`
**Requirement**: CAT-01

**Done when**:

- [x] O catálogo a 1440 px confere com `.specs/features/site-publico/captures/catalogo.png`, sem "Carregar mais" com os 12 produtos (C26, provado no walk)
- [x] `tests/e2e/site-catalog.spec.ts` prova: o produto oculto do seed não aparece na lista nem na busca pelo nome (C27); clicar "Linha pesada" filtra sem recarregar (um marcador em `window` sobrevive) e a URL ganha `?categoria=linha-pesada` (C28); abrir `/produtos?categoria=filtros` já mostra só filtros com o chip marcado (C29); com 15 produtos visíveis aparecem 12 e "Carregar mais", e o clique mostra 15 e esconde o botão (C36); busca "xyz" mostra "Nenhum produto encontrado. Tente outra busca ou fale com a gente no WhatsApp." e "Chamar no WhatsApp" com o link do WhatsApp, e o mesmo vale com 0 produtos visíveis (C37)
- [x] Gate check passes: `npm run lint && npm run typecheck && npm run build:local && npx vitest run && npx playwright test`
- [x] Test count: 5 e2e tests pass

**Tests**: e2e
**Gate**: build

**Commit**: `feat(site): adiciona catálogo de produtos`

---

### T15: Galeria do produto ✅

**What**: `ProductGallery` com a foto grande e as miniaturas; a miniatura escolhida troca a foto grande e ganha a borda escura (`aria-pressed`); sem foto, a imagem neutra. O selo "Oferta da semana" fica sobre a foto, como na captura.
**Where**: `src/components/site/ProductGallery.tsx`
**Depends on**: T14
**Reuses**: `publicImageUrl`, `IconBucket`
**Requirement**: PDP-01

**Done when**:

- [x] `src/components/site/ProductGallery.test.tsx` cobre: clicar a segunda miniatura troca o `src` da foto grande e move a borda escura para ela (C45); produto sem fotos mostra a imagem neutra
- [x] Gate check passes: `npx vitest run`
- [x] Test count: 2 tests pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(site): adiciona galeria do produto`

---

### T16: Embalagem, preço e quantidade ✅

**What**: `PurchaseBox` com os chips de embalagem (primeira marcada), o preço da embalagem (promocional com o normal riscado em oferta), "à vista · <embalagem>", quantidade de 1 a 99 com "−" e "+", e "Adicionar ao carrinho" com o aviso temporário.
**Where**: `src/components/site/PurchaseBox.tsx`
**Depends on**: T15
**Reuses**: `cardPrice`, `packageCaption`, `formatBRL`
**Requirement**: PDP-01

**Done when**:

- [x] `src/components/site/PurchaseBox.test.tsx` cobre: escolher Frasco 1L troca o preço para o dele e a legenda para "à vista · frasco 1L" (C46); abre com a primeira embalagem marcada e quantidade 1 (C47); "+" sobe até 99 e para, "−" desce até 1 e para (C48); em oferta mostra o promocional e o normal riscado, e fora de oferta não; o botão ao lado da quantidade se chama "Adicionar ao carrinho" (C56)
- [x] Gate check passes: `npx vitest run`
- [x] Test count: 5 tests pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(site): adiciona escolha de embalagem e quantidade`

---

### T17: Página do produto ✅

**What**: `(site)/produtos/[slug]/page.tsx` com `generateStaticParams`, trilha, galeria, informações, `PurchaseBox`, bloco do cupom curto ("10% de desconto na troca feita na loja."), ficha técnica e "Combine com"; slug inexistente ou oculto dá `notFound()` com "Produto não encontrado." e "Ver todos os produtos".
**Where**: `src/app/(site)/produtos/[slug]/page.tsx`
**Depends on**: T16
**Reuses**: `loadProductBySlug`, `specRows`, `relatedProducts`, `activeCoupon`, `ProductCard`
**Requirement**: PDP-01

**Done when**:

- [x] A página do Top Turbo 15W-40 a 1440 px confere com `.specs/features/site-publico/captures/produto.png` (C43, provado no walk)
- [x] `tests/e2e/site-product.spec.ts` prova: um slug inventado e o slug do produto oculto respondem 404 com "Produto não encontrado." e "Ver todos os produtos" (C44); com o FACLUB10 ativo a página mostra o código e "10% de desconto na troca feita na loja." (C52); o Top Turbo em oferta mostra o selo "Oferta da semana" sobre a foto e o preço promocional ao lado do normal riscado, e o Rimula, fora de oferta, não (C49); a trilha é "Home / Produtos / Lubrax Top Turbo 15W-40" com os dois primeiros como links (C53); a 390 px a galeria fica acima das informações, numa coluna (C55); "Combine com" mostra produtos de outras categorias
- [x] Gate check passes: `npm run lint && npm run typecheck && npm run build:local && npx vitest run && npx playwright test`
- [x] Test count: 6 e2e tests pass

**Tests**: e2e
**Gate**: build

**Commit**: `feat(site): adiciona página do produto`

---

### T18: O site acompanha o painel ✅

**What**: `revalidate = 60` nas páginas do site (cada página já o exporta desde a sua tarefa); teste e2e que grava pelo painel e espera a mudança nas páginas públicas (recarregando até 60 s).
**Where**: `tests/e2e/site-freshness.spec.ts`
**Depends on**: T17
**Reuses**: `login`, `seed`, `refreshSite`
**Requirement**: HOME-01, CAT-01

**Done when**:

- [x] `tests/e2e/site-freshness.spec.ts` prova: trocar o título do banner, o percentual do cupom e o horário de sábado no painel aparece na Home (C18); desligar o único banner ativo mostra o topo padrão (C19); desligar o FACLUB10 tira os blocos de cupom da Home e da página do produto (C20); trocar o WhatsApp muda "Agendar troca", "Agendar pelo WhatsApp" e "Chamar no WhatsApp" para o novo número (C21); um produto novo salvo visível aparece em `/produtos` (C40); ocultar, pôr em oferta e mudar o preço aparece no catálogo, na página do produto e na Home (C41); subir "Filtros" na ordem das categorias muda a ordem dos chips (C42)
- [x] Gate check passes: `npx vitest run && npx playwright test`
- [x] Test count: 7 e2e tests pass

**Tests**: e2e
**Gate**: full

**Commit**: `test(site): prova que o site acompanha o painel em até um minuto`

---

### T19: Metatags ✅

**What**: `metadata`/`generateMetadata` com título, descrição e Open Graph próprios na Home, no catálogo, em cada produto ("<marca> <nome> | FAC LUB" e a foto de capa) e na política; `lang="pt-BR"` conferido.
**Where**: `src/app/(site)/produtos/[slug]/page.tsx`
**Depends on**: T18
**Reuses**: `productTitle`, `publicImageUrl`
**Requirement**: SEO-01

**Done when**:

- [x] `tests/e2e/site-seo.spec.ts` prova: `/`, `/produtos`, um produto e a política têm `<title>`, `meta description`, `og:title`, `og:description` e `og:image` diferentes entre si (C59); o produto tem o título "Lubrax Top Turbo 15W-40 | FAC LUB" e `og:image` com a capa (C60); as quatro têm `<html lang="pt-BR">` (C61)
- [x] Gate check passes: `npm run lint && npm run typecheck && npm run build:local && npx vitest run && npx playwright test`
- [x] Test count: 3 e2e tests pass

**Tests**: e2e
**Gate**: build

**Commit**: `feat(site): adiciona metatags por página`

---

## Checks

**C1** - "Agendar troca" fica à vista a 360 px sem rolar, em todas as páginas públicas (HEAD-01, AC 1)
Proof: `npx playwright test tests/e2e/site-header.spec.ts -g "HEAD-01.1:"`

**C2** - O topo continua fixo no alto ao rolar (HEAD-01, AC 2)
Proof: `npx playwright test tests/e2e/site-header.spec.ts -g "HEAD-01.2:"`

**C3** - "Agendar troca" e "Agendar pelo WhatsApp" abrem `https://wa.me/55<WhatsApp>` com a mensagem de agendamento (HEAD-01, AC 3)
Proof: `npx playwright test tests/e2e/site-header.spec.ts -g "HEAD-01.3:"`

**C4** - Links "Serviços", "Produtos" e "Contato", com o da página atual em negrito (HEAD-01, AC 4)
Proof: `npx playwright test tests/e2e/site-header.spec.ts -g "HEAD-01.4:"`

**C5** - Abaixo de 768 px os links ficam atrás de "Abrir menu" e "Agendar troca" segue à vista (HEAD-01, AC 5)
Proof: `npx playwright test tests/e2e/site-header.spec.ts -g "HEAD-01.5:"`

**C6** - Sacola "Carrinho" entre o menu e "Agendar troca", levando a `/carrinho` (HEAD-01, AC 6)
Proof: `npx playwright test tests/e2e/site-header.spec.ts -g "HEAD-01.6:"`

**C7** - A Home a 1440 px é a da captura (HOME-01, AC 1)
Proof: browser captures/home.running.png

**C8** - O topo da Home mostra o banner ativo (título, texto, foto, link) (HOME-01, AC 2)
Proof: `npx playwright test tests/e2e/site-home.spec.ts -g "HOME-01.2:"`

**C9** - A faixa mostra horários, endereço e "10% OFF · FACLUB10" (HOME-01, AC 3)
Proof: `npx playwright test tests/e2e/site-home.spec.ts -g "HOME-01.3:"`

**C10** - A seção de marcas lista as marcas cadastradas (HOME-01, AC 4)
Proof: `npx playwright test tests/e2e/site-home.spec.ts -g "HOME-01.4:"`

**C11** - "Produtos em destaque" mostra até 4 destaques visíveis e some sem nenhum (HOME-01, AC 5)
Proof: `npx playwright test tests/e2e/site-home.spec.ts -g "HOME-01.5:"`

**C12** - "Ver produtos" e "Ver todos" abrem `/produtos` (HOME-01, AC 6)
Proof: `npx playwright test tests/e2e/site-home.spec.ts -g "HOME-01.6:"`

**C13** - O card de um produto abre a página dele (HOME-01, AC 7)
Proof: `npx playwright test tests/e2e/site-home.spec.ts -g "HOME-01.7:"`

**C14** - "Passa aqui na FAC LUB" mostra endereço, horários, telefone, e-mail e o mapa com o endereço (HOME-01, AC 8)
Proof: `npx playwright test tests/e2e/site-home.spec.ts -g "HOME-01.8:"`

**C15** - Telefone abre `tel:` e e-mail abre `mailto:` (HOME-01, AC 9)
Proof: `npx playwright test tests/e2e/site-home.spec.ts -g "HOME-01.9:"`

**C16** - O rodapé mostra "© <ano atual> FAC Lubrificantes" e os links Instagram, Produtos, Política de privacidade e Área administrativa (HOME-01, AC 10)
Proof: `npx playwright test tests/e2e/site-footer.spec.ts -g "HOME-01.10:"`

**C17** - Instagram ou grupo vazio esconde o botão correspondente (HOME-01, AC 11)
Proof: `npx playwright test tests/e2e/site-home.spec.ts -g "HOME-01.11:"`

**C18** - Banner, cupom e configurações salvos no painel aparecem na Home em até 1 minuto (HOME-01, AC 12)
Proof: `npx playwright test tests/e2e/site-freshness.spec.ts -g "HOME-01.12:"`

**C19** - Desativar o único banner ativo mostra o topo padrão em até 1 minuto (HOME-01, AC 13)
Proof: `npx playwright test tests/e2e/site-freshness.spec.ts -g "HOME-01.13:"`

**C20** - Sem cupom ativo, Home e página do produto escondem os blocos de cupom (HOME-01, AC 14)
Proof: `npx playwright test tests/e2e/site-freshness.spec.ts -g "HOME-01.14:"`

**C21** - Mudar o WhatsApp nas configurações muda todos os botões de WhatsApp em até 1 minuto (HOME-01, AC 15)
Proof: `npx playwright test tests/e2e/site-freshness.spec.ts -g "HOME-01.15:"`

**C22** - "Copiar" copia o código e mostra "Copiado" por 2 segundos (CUPOM-01, AC 1)
Proof: `npx vitest run src/components/site/CouponBlock.test.tsx -t "CUPOM-01.1:"`

**C23** - Sem permissão de copiar, o código fica selecionado com "Selecione e copie o código." (CUPOM-01, AC 2)
Proof: `npx vitest run src/components/site/CouponBlock.test.tsx -t "CUPOM-01.2:"`

**C24** - O bloco mostra o texto da spec e que o desconto vale só para serviços na loja (CUPOM-01, AC 3)
Proof: `npx vitest run src/components/site/CouponBlock.test.tsx -t "CUPOM-01.3:"`

**C25** - "Entrar no grupo de ofertas" abre o link do grupo em nova aba (CUPOM-01, AC 4)
Proof: `npx vitest run src/components/site/CouponBlock.test.tsx -t "CUPOM-01.4:"`

**C26** - O catálogo a 1440 px é o da captura (CAT-01, AC 1)
Proof: browser captures/catalogo.running.png

**C27** - O catálogo lista só produtos visíveis (CAT-01, AC 2)
Proof: `npx playwright test tests/e2e/site-catalog.spec.ts -g "CAT-01.2:"`

**C28** - Escolher categoria filtra sem recarregar e põe `?categoria=<slug>` na URL (CAT-01, AC 3)
Proof: `npx playwright test tests/e2e/site-catalog.spec.ts -g "CAT-01.3:"`

**C29** - `/produtos?categoria=<slug>` abre já filtrado (CAT-01, AC 4)
Proof: `npx playwright test tests/e2e/site-catalog.spec.ts -g "CAT-01.4:"`

**C30** - "15w40", "15W-40", "15w 40" e "15W40" acham os mesmos produtos (CAT-01, AC 5)
Proof: `npx vitest run src/lib/domain/catalog.test.ts -t "CAT-01.5:"`

**C31** - "lubrax", "LUBRAX" e "Lubrax" acham os mesmos produtos (CAT-01, AC 6)
Proof: `npx vitest run src/lib/domain/catalog.test.ts -t "CAT-01.6:"`

**C32** - "oleo" e "óleo" acham os mesmos produtos (CAT-01, AC 7)
Proof: `npx vitest run src/lib/domain/catalog.test.ts -t "CAT-01.7:"`

**C33** - Várias palavras exigem todas, em qualquer ordem e campo (CAT-01, AC 8)
Proof: `npx vitest run src/lib/domain/catalog.test.ts -t "CAT-01.8:"`

**C34** - Menor preço, Maior preço, A–Z e Destaques, combinados com categoria e busca (CAT-01, AC 9)
Proof: `npx vitest run src/lib/domain/catalog.test.ts -t "CAT-01.9:"`

**C35** - O contador mostra "N produtos" e "1 produto" no singular (CAT-01, AC 10)
Proof: `npx vitest run src/lib/domain/catalog.test.ts -t "CAT-01.10:"`

**C36** - "Carregar mais" aparece só com mais produtos e acrescenta os próximos 12 (CAT-01, AC 11)
Proof: `npx playwright test tests/e2e/site-catalog.spec.ts -g "CAT-01.11:"`

**C37** - Sem resultado, a mensagem da spec e "Chamar no WhatsApp" (CAT-01, AC 12)
Proof: `npx playwright test tests/e2e/site-catalog.spec.ts -g "CAT-01.12:"`

**C38** - Card em oferta mostra "Oferta" e o promocional ao lado do normal riscado (CAT-01, AC 13)
Proof: `npx vitest run src/components/site/ProductCard.test.tsx -t "CAT-01.13:"`

**C39** - Card mostra marca, embalagem, nome e preço "R$ 1.234,56" (CAT-01, AC 14)
Proof: `npx vitest run src/components/site/ProductCard.test.tsx -t "CAT-01.14:"`

**C40** - Produto salvo visível no painel aparece no catálogo em até 1 minuto (CAT-01, AC 15)
Proof: `npx playwright test tests/e2e/site-freshness.spec.ts -g "CAT-01.15:"`

**C41** - Visibilidade, oferta e preço mudados no painel aparecem no catálogo, no produto e na Home em até 1 minuto (CAT-01, AC 16)
Proof: `npx playwright test tests/e2e/site-freshness.spec.ts -g "CAT-01.16:"`

**C42** - A ordem das categorias do painel vale no filtro do catálogo (CAT-01, AC 17)
Proof: `npx playwright test tests/e2e/site-freshness.spec.ts -g "CAT-01.17:"`

**C43** - A página do produto a 1440 px é a da captura (PDP-01, AC 1)
Proof: browser captures/produto.running.png

**C44** - Slug inexistente ou produto oculto dá 404 com "Produto não encontrado." e "Ver todos os produtos" (PDP-01, AC 2)
Proof: `npx playwright test tests/e2e/site-product.spec.ts -g "PDP-01.2:"`

**C45** - A miniatura troca a foto grande e ganha a borda escura (PDP-01, AC 3)
Proof: `npx vitest run src/components/site/ProductGallery.test.tsx -t "PDP-01.3:"`

**C46** - Trocar a embalagem troca o preço e a legenda "à vista · <embalagem>" (PDP-01, AC 4)
Proof: `npx vitest run src/components/site/PurchaseBox.test.tsx -t "PDP-01.4:"`

**C47** - Abre com a primeira embalagem e quantidade 1 (PDP-01, AC 5)
Proof: `npx vitest run src/components/site/PurchaseBox.test.tsx -t "PDP-01.5:"`

**C48** - "+" e "−" mudam a quantidade de 1 em 1, entre 1 e 99 (PDP-01, AC 6)
Proof: `npx vitest run src/components/site/PurchaseBox.test.tsx -t "PDP-01.6:"`

**C49** - Em oferta, "Oferta da semana" e o promocional ao lado do normal riscado (PDP-01, AC 7)
Proof: `npx playwright test tests/e2e/site-product.spec.ts -g "PDP-01.7:"`

**C50** - A ficha técnica mostra as 6 linhas e esconde as de campo vazio (PDP-01, AC 8)
Proof: `npx vitest run src/lib/domain/product-page.test.ts -t "PDP-01.8:"`

**C51** - Disponibilidade "Pronta entrega" com estoque e "Sob consulta" com 0 (PDP-01, AC 9)
Proof: `npx vitest run src/lib/domain/product-page.test.ts -t "PDP-01.9:"`

**C52** - Com cupom ativo, o código e "10% de desconto na troca feita na loja." (PDP-01, AC 10)
Proof: `npx playwright test tests/e2e/site-product.spec.ts -g "PDP-01.10:"`

**C53** - Trilha "Home / Produtos / <marca> <nome>" com os dois primeiros como links (PDP-01, AC 11)
Proof: `npx playwright test tests/e2e/site-product.spec.ts -g "PDP-01.11:"`

**C54** - "Combine com" traz até 4 de outras categorias e some sem nenhum (PDP-01, AC 12)
Proof: `npx vitest run src/lib/domain/product-page.test.ts -t "PDP-01.12:"`

**C55** - Abaixo de 768 px a galeria fica acima das informações, numa coluna (PDP-01, AC 13)
Proof: `npx playwright test tests/e2e/site-product.spec.ts -g "PDP-01.13:"`

**C56** - O botão ao lado da quantidade é "Adicionar ao carrinho" (PDP-01, AC 14)
Proof: `npx vitest run src/components/site/PurchaseBox.test.tsx -t "PDP-01.14:"`

**C57** - A política mostra os dados do pedido, a finalidade, os cookies de GA4 e Meta Pixel e o e-mail das configurações (PRIV-01, AC 1)
Proof: `npx playwright test tests/e2e/site-footer.spec.ts -g "PRIV-01.1:"`

**C58** - O rodapé de todas as páginas públicas tem "Política de privacidade" (PRIV-01, AC 2)
Proof: `npx playwright test tests/e2e/site-footer.spec.ts -g "PRIV-01.2:"`

**C59** - Home, catálogo, produto e política têm título, descrição e Open Graph próprios (SEO-01, AC 1)
Proof: `npx playwright test tests/e2e/site-seo.spec.ts -g "SEO-01.1:"`

**C60** - O produto usa "<marca> <nome> | FAC LUB" e a capa como imagem Open Graph (SEO-01, AC 2)
Proof: `npx playwright test tests/e2e/site-seo.spec.ts -g "SEO-01.2:"`

**C61** - `<html lang="pt-BR">` em todas as páginas (SEO-01, AC 3)
Proof: `npx playwright test tests/e2e/site-seo.spec.ts -g "SEO-01.3:"`

---

## Handoff

The feature's live state, written as it happens - a compaction gives no warning.

**Dispatched:** Verifier (validate.md) e screens sub-agent (verify-screens.md, round 1) em paralelo, sobre o HEAD com `proofs.md` de 792e512, 2026-10-28; o Verifier não roda Playwright (as portas do stack local ficam com o screens sub-agent) e o orquestrador roda `check_proofs --mutations` depois; Verifier returned (FAIL, 8 achados, 1 mutação sobreviveu); screens round 1 returned (home diverges em 5 linhas, catalogo em 1, produto em 1); screens sub-agent round 2 (só as linhas differs) no HEAD d989a78, 2026-10-28; screens round 2 returned (catalogo e produto matches; home diverges só nos cards de serviço sem foto, Q12)
**Settled mid-build:** execução nesta sessão, sem sub-agentes de lote (oferta com recomendação inline) - user: "aprovado, pode seguir"; Q12 (cards de serviço no fundo escuro até virem as fotos) e Q13 (marcas em ordem alfabética), recomendações aceitas - user: "ok para as duas recomendações, pode seguir" (AD-016)
**Walked:** 2026-10-28, app de `E2E_SKIP_BUILD=1 node scripts/local-supabase/start.mjs --app` (depois de `npm run build:local` ou de um `npx playwright test`) em http://localhost:3100, com `node scripts/local-supabase/seed.mjs --site` e `curl -X POST -H "authorization: Bearer revalidar-local" localhost:3100/api/revalidar` (as páginas são pré-geradas antes do seed). Fotos tiradas numa janela do tamanho de cada captura, depois de rolar a página até o fim para as fotos com `loading="lazy"` carregarem: `/` a 1440×5237 (`captures/home.running.png`; a página tem 5405 px, então o rodapé fica abaixo da janela), `/produtos` a 1440×2029 (`captures/catalogo.running.png`; 12 produtos, sem "Carregar mais", ver design.md) e `/produtos/top-turbo-15w-40` a 1440×1666 (`captures/produto.running.png`). HEAD-01: a 360 px "Agendar troca" fica no topo, à vista, em `/`, `/produtos` e no Top Turbo, com `https://wa.me/551129545764?text=` e a mensagem de agendamento. HOME-01: a Home mostra banner do seed, faixa com horários, endereço e "10% OFF · FACLUB10", marcas em ordem alfabética, serviços, diferenciais, 4 destaques, cupom e contato; no painel (`contato@onbind.com.br` / `faclub-admin-123`), "Configurações" com sábado "8h às 12h" salvo aparece na faixa da Home na visita seguinte (411 ms); o valor voltou a "8h às 13h". CUPOM-01: "Copiar" põe FACLUB10 na área de transferência e o rótulo vira "Copiado". CAT-01: "Linha pesada" + busca "15w40" + "Menor preço" dá Brutus R$ 299,90, Top Turbo R$ 349,90, Urania R$ 399,90, Delvac R$ 419,90 e Rimula R$ 459,90, com a URL `?categoria=linha-pesada&q=15w40&ordem=menor-preco`. PDP-01: no Top Turbo, Balde 20L mostra R$ 349,90 "à vista · balde 20L" e Frasco 1L troca para R$ 39,90 "à vista · frasco 1L"; `/produtos/oleo-inventado` responde 404 com "Produto não encontrado.". PRIV-01: "Política de privacidade" no rodapé de `/produtos` abre a política. SEO-01: o Top Turbo tem o título "Lubrax Top Turbo 15W-40 | FAC LUB" e `og:image` com a capa do Storage. O banco local ficou com o seed do site.

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6

Phase 1:  T1 → T2 → T3 → T4
Phase 2:  T5 → T6 → T7 → T8
Phase 3:  T9 → T10 → T11 → T12 → T13
Phase 4:  T14
Phase 5:  T15 → T16 → T17
Phase 6:  T18 → T19
```

19 tarefas em sequência (cada fase depende das regras e do seed das anteriores); recomendado executar nesta sessão, sem sub-agentes de lote.
