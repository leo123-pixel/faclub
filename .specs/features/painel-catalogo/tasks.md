# Painel: login e catálogo Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, the walk, check_proofs, the Verifier and the screens sub-agent).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/painel-catalogo/design.md`
**Status**: Approved
**Approved**: 2026-10-28 - user: "aprovado, pode seguir nesta sessão"
**Mutations**: 3
**Build**: `npm run build; npm run typecheck; npm run lint`

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: none - strong defaults applied (o repositório não tinha código nem testes; a pilha de testes é a proposta de design.md e AD-010).

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Domínio (`src/lib/domain`) | unit | Todos os ramos; 1:1 com os critérios da spec; cada edge case listado | `src/lib/domain/*.test.ts` | `npx vitest run src/lib/domain` |
| Componentes (`src/components`) | unit (jsdom) | Cada gesto que um critério nomeia, com o que a tela mostra depois | `src/components/**/*.test.tsx` | `npx vitest run src/components` |
| Banco (`supabase/migrations`) | integration | Cada restrição, política RLS, função e gatilho: caso aceito e caso recusado | `tests/db/*.test.ts` | `npx vitest run tests/db` |
| Páginas, Server Actions e `proxy.ts` | e2e | Cada rota da feature: caminho feliz, edge cases e erros | `tests/e2e/*.spec.ts` | `npx playwright test` |
| Configuração, scripts e seed | none | - (build gate only) | - | build gate only |

## Gate Check Commands

> Generated from codebase - confirm before Execute.

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Quick | Tarefas com testes unit ou integration de banco | `npx vitest run` |
| Full | Tarefas com testes e2e | `npx vitest run && npx playwright test` |
| Build | Fim de fase, ou tarefas só de configuração | `npm run lint && npm run typecheck && npm run build && npx vitest run && npx playwright test` |

---

## Execution Plan

Phases are ordered and run sequentially - each phase completes before the next begins, and tasks within a phase execute in order.

### Phase 1: Fundação e banco

```
T1 → T2 → T3 → T4 → T5 → T6
```

### Phase 2: Supabase local para o e2e

```
T6 → T7 → T8
```

### Phase 3: Regras de domínio

```
T8 → T9 → T10 → T11 → T12 → T13
```

### Phase 4: Acesso ao painel

```
T13 → T14 → T15 → T16 → T17
```

### Phase 5: Lista de produtos

```
T17 → T18 → T19 → T20
```

### Phase 6: Formulário de produto

```
T20 → T21 → T22 → T23 → T24 → T25 → T26
```

### Phase 7: Categorias e marcas

```
T26 → T27 → T28
```

---

## Task Breakdown

### T1: Criar o projeto Next.js com Tailwind, TypeScript, ESLint e Vitest ✅

**What**: Projeto Next 16 (App Router, `src/`), Tailwind 4 com os tokens do protótipo em `globals.css`, fontes Inter e Inter Tight, scripts `typecheck`, `lint`, `test`, e Vitest com os projetos unit (node e jsdom) e db.
**Where**: `package.json`
**Depends on**: None
**Reuses**: tokens de cor e fonte extraídos de `docs/referencias/prototipo.html`
**Requirement**: base de todos

**Done when**:

- [x] `npm run lint`, `npm run typecheck` e `npm run build` passam
- [x] `npx vitest run --passWithNoTests` termina com sucesso
- [x] `globals.css` define `--color-ink #0B1020`, `--color-navy #0A1530`, `--color-gold #E2B33C`, `--color-ok #1F7A4D`, `--color-muted #5B6683`, `--color-line #D5D9E3`, `--color-bg #F2F4F8`

**Tests**: none
**Gate**: build

**Commit**: `chore: cria projeto next.js com tailwind, eslint e vitest`

---

### T2: Montar o Postgres local de teste com o esquema mínimo do Supabase

**What**: `globalSetup` do Vitest que cria um cluster Postgres 16 temporário, aplica `supabase/tests/supabase-shim.sql` (papéis anon, authenticated, service_role e authenticator; esquema `auth` com `users`, `uid()` e `jwt()`; esquema `storage` com `buckets` e `objects`) e todas as migrações, mais o helper `asUser(claims)` que troca de papel e de claims numa transação.
**Where**: `tests/db/setup/global-setup.ts`
**Depends on**: T1
**Reuses**: binários de `/usr/lib/postgresql/16/bin`
**Requirement**: AD-010

**Done when**:

- [ ] `tests/db/harness.test.ts` prova que `auth.uid()` devolve o `sub` das claims e que `anon` não é superusuário
- [ ] Gate check passes: `npx vitest run`
- [ ] Test count: 2 tests pass

**Tests**: integration
**Gate**: quick

**Commit**: `test(db): adiciona postgres local de teste com esquema mínimo do supabase`

---

### T3: Criar o esquema do MVP com dados iniciais

**What**: Migração com as tabelas do design (categories, brands, products, product_variants, product_images, orders, coupons, banners, settings), restrições e seeds: 4 categorias, 6 marcas, cupom FACLUB10 e a linha de settings com os valores iniciais.
**Where**: `supabase/migrations/20261028000100_schema.sql`
**Depends on**: T2
**Reuses**: PRD seção 7, AD-003, AD-009
**Requirement**: PFORM-01, TAX-01

**Done when**:

- [ ] `tests/db/schema.test.ts` cobre: promo maior ou igual ao preço recusado; preço 0 recusado; estoque negativo recusado; segunda capa no mesmo produto recusada; nome de categoria repetido com outra caixa recusado; nome de marca repetido recusado; settings com `id <> 1` recusado; seeds presentes
- [ ] Gate check passes: `npx vitest run`
- [ ] Test count: 10 tests pass

**Tests**: integration
**Gate**: quick

**Commit**: `feat(db): cria esquema do mvp com dados iniciais`

---

### T4: Criar `is_admin()` e as políticas RLS

**What**: Migração com `public.is_admin()` e RLS em todas as tabelas: leitura pública só de produtos visíveis (e suas embalagens e fotos), categorias, marcas, banners ativos, cupons ativos e settings; escrita e leitura total só para admin; `orders` fechada para `anon`.
**Where**: `supabase/migrations/20261028000200_rls.sql`
**Depends on**: T3
**Reuses**: PRD seção 7 (RLS)
**Requirement**: AUTH-01

**Done when**:

- [ ] `tests/db/rls.test.ts` prova para `anon`, autenticado sem papel e admin: leitura de produto visível e oculto; insert, update e delete em products, product_variants, product_images, categories e brands; leitura de orders (settles C8)
- [ ] Gate check passes: `npx vitest run`
- [ ] Test count: 18 tests pass

**Tests**: integration
**Gate**: quick

**Commit**: `feat(db): adiciona is_admin e políticas rls`

---

### T5: Criar o bucket `product-images` e suas políticas

**What**: Migração que cria o bucket público `product-images` e as políticas de `storage.objects`: leitura pública, escrita e remoção só para admin.
**Where**: `supabase/migrations/20261028000300_storage.sql`
**Depends on**: T4
**Reuses**: esquema `storage` do shim de T2
**Requirement**: PFORM-01

**Done when**:

- [ ] `tests/db/storage.test.ts` prova: admin insere e remove objeto no bucket; `anon` e autenticado sem papel não inserem; qualquer um lê
- [ ] Gate check passes: `npx vitest run`
- [ ] Test count: 4 tests pass

**Tests**: integration
**Gate**: quick

**Commit**: `feat(db): cria bucket product-images com políticas de admin`

---

### T6: Criar `make_slug`, `save_product` e os gatilhos de integridade

**What**: Migração com `make_slug(text)`, `save_product(jsonb)` (security invoker, transação única, slug com sufixo), gatilho `products_promo_guard` e gatilhos que recusam excluir categoria ou marca em uso, com a contagem na mensagem.
**Where**: `supabase/migrations/20261028000400_functions.sql`
**Depends on**: T5
**Reuses**: extensão `unaccent`
**Requirement**: PFORM-01, PTOG-01, TAX-01

**Done when**:

- [ ] `tests/db/functions.test.ts` cobre: slug "Óleo Câmbio 75W-90" vira `oleo-cambio-75w-90`; segundo produto com o mesmo nome recebe `-2` e o terceiro `-3` (settles C45); `save_product` grava produto, 2 embalagens e 2 fotos e, na edição, troca as embalagens; `save_product` como `anon` falha; oferta sem preço promocional falha com `promo_requires_price`; excluir categoria com 3 produtos falha com `category_in_use:3`; excluir marca em uso falha com `brand_in_use:N`; excluir categoria vazia funciona
- [ ] Gate check passes: `npx vitest run`
- [ ] Test count: 9 tests pass

**Tests**: integration
**Gate**: build

**Commit**: `feat(db): adiciona save_product, make_slug e gatilhos de integridade`

---

### T7: Subir o Supabase local para o e2e e configurar o Playwright

**What**: `scripts/local-supabase/start.mjs` baixa PostgREST e Supabase Auth para `.local/bin`, cria o cluster em `.local/pg`, aplica as migrações, sobe GoTrue, PostgREST, um SMTP de captura e o gateway Node (rotas `/auth/v1`, `/rest/v1` e um Storage simulado em disco); `playwright.config.ts` sobe esse stack e o `next start`.
**Where**: `scripts/local-supabase/start.mjs`
**Depends on**: T6
**Reuses**: migrações de T3 a T6
**Requirement**: AD-010

**Done when**:

- [ ] `tests/e2e/stack.spec.ts` prova: `supabase-js` lê as 4 categorias pelo gateway; cria usuário pelo admin API e faz login; envia e lê de volta um arquivo no Storage simulado
- [ ] `.local/` está no `.gitignore`
- [ ] Gate check passes: `npx vitest run && npx playwright test`
- [ ] Test count: 3 e2e tests pass

**Tests**: e2e
**Gate**: full

**Commit**: `test(e2e): sobe supabase local com postgrest, auth e storage simulado`

---

### T8: Popular o Supabase local com os dados das capturas

**What**: `scripts/local-supabase/seed.mjs` cria o admin `contato@onbind.com.br` (papel admin), um usuário sem papel e os 8 produtos da captura da lista, com estoques 48, 32, 4, 12, 9, 3, 15 e 60, três em oferta e um oculto; mais `scripts/create-admin.mjs` para a Onbind criar admins no Supabase real.
**Where**: `scripts/local-supabase/seed.mjs`
**Depends on**: T7
**Reuses**: `save_product` de T6
**Requirement**: PLIST-01

**Done when**:

- [ ] `node scripts/local-supabase/seed.mjs` roda duas vezes seguidas sem erro e sem duplicar dados
- [ ] Gate check passes: build gate

**Tests**: none
**Gate**: build

**Commit**: `chore: adiciona seed local e script de criação de admin`

---

### T9: Normalizar a busca

**What**: `normalizeSearch` e `matchesSearch` ignorando maiúsculas, acentos, hífens e espaços internos de cada palavra; todas as palavras da busca precisam aparecer.
**Where**: `src/lib/domain/search.ts`
**Depends on**: T8
**Reuses**: -
**Requirement**: PLIST-01

**Done when**:

- [ ] `src/lib/domain/search.test.ts` cobre "15w40", "15W-40" e "15W40" contra "Top Turbo 15W-40"; "lubrax" contra "Lubrax"; "oleo" contra "Óleo"; "lubrax 15w40" exige as duas; busca vazia aceita tudo; SKU "LBX-1540-20" achado por "lbx154020"
- [ ] Gate check passes: `npx vitest run`
- [ ] Test count: 6 tests pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(domain): adiciona busca tolerante a caixa, acento e hífen`

---

### T10: Ler e formatar reais

**What**: `parseBRL` aceita "39,90", "1.234,56", "39.9" e "R$ 39,90"; devolve `null` para texto, vazio e negativo; `formatBRL` devolve "R$ 1.234,56".
**Where**: `src/lib/domain/money.ts`
**Depends on**: T9
**Reuses**: `Intl.NumberFormat('pt-BR')`
**Requirement**: PFORM-01

**Done when**:

- [ ] `src/lib/domain/money.test.ts` cobre cada formato aceito, os recusados e a formatação com milhar
- [ ] Gate check passes: `npx vitest run`
- [ ] Test count: 4 tests pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(domain): adiciona leitura e formatação de valores em reais`

---

### T11: Validar o produto

**What**: `productInputSchema` (zod) com nome, marca, categoria, ao menos uma embalagem com preço, ao menos uma foto, preço promocional menor que o preço por embalagem, números não negativos e Tipo em Mineral, Semissintético ou Sintético, com as mensagens exatas da spec.
**Where**: `src/lib/domain/product-input.ts`
**Depends on**: T10
**Reuses**: `parseBRL`
**Requirement**: PFORM-01

**Done when**:

- [ ] `src/lib/domain/product-input.test.ts` cobre cada campo obrigatório ausente com "Campo obrigatório"; promo igual e maior que o preço com "O preço promocional precisa ser menor que o preço."; preço "abc" e estoque -1 com "Informe um número válido."; produto completo aceito
- [ ] Gate check passes: `npx vitest run`
- [ ] Test count: 8 tests pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(domain): adiciona validação do cadastro de produto`

---

### T12: Filtrar, paginar e contar a lista do painel

**What**: `filterAdminProducts`, `adminKpis`, `stockLabel` e `displayVariant`.
**Where**: `src/lib/domain/admin-products.ts`
**Depends on**: T11
**Reuses**: `matchesSearch`
**Requirement**: PLIST-01

**Done when**:

- [ ] `src/lib/domain/admin-products.test.ts` cobre: aba Visíveis (settles C11); aba Ocultos (C12); busca por nome, marca e SKU sem caixa, acento ou hífen (C13); categoria combinada com aba e busca (C14); estoque 5 vira "Baixo · 5" e 6 vira "6 un." (C15); 45 produtos dão "20 de 45 produtos" e "Página 1 de 3", e a página 3 tem 5 (C16); cartões com visíveis, em oferta visíveis, estoque baixo e pedidos de 30 dias (C20); produto com 3 embalagens mostra o preço da primeira e "3 embalagens" (C23)
- [ ] Gate check passes: `npx vitest run`
- [ ] Test count: 8 tests pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(domain): adiciona filtros, paginação e indicadores da lista do painel`

---

### T13: Regras das fotos

**What**: `acceptPhoto` (tipo, 15 MB, máximo 6), `resizeTarget` (lado maior 1600 px, sem ampliar), `withNewPhoto` (primeira vira capa) e `withoutPhoto` (capa passa para a primeira restante).
**Where**: `src/lib/domain/photos.ts`
**Depends on**: T12
**Reuses**: -
**Requirement**: PFORM-01

**Done when**:

- [ ] `src/lib/domain/photos.test.ts` cobre: 7ª foto recusada com "Máximo de 6 fotos por produto."; GIF e arquivo de 16 MB recusados com "Envie uma foto JPG, PNG, WebP ou HEIC de até 15 MB."; HEIC aceito; 4032×3024 vira 1600×1200; 800×600 fica igual; primeira foto vira capa; remover a capa passa a capa para a primeira restante
- [ ] Gate check passes: `npx vitest run`
- [ ] Test count: 7 tests pass

**Tests**: unit
**Gate**: build

**Commit**: `feat(domain): adiciona regras de aceite, redução e capa das fotos`

---

### T14: Proteger `/admin` com `proxy.ts` e `requireAdmin`

**What**: Clientes Supabase de servidor e navegador, `requireAdmin()` e `src/proxy.ts` que renova a sessão e redireciona `/admin/*` sem sessão para `/admin/login`.
**Where**: `src/proxy.ts`
**Depends on**: T13
**Reuses**: `@supabase/ssr`
**Requirement**: AUTH-01

**Done when**:

- [ ] `tests/e2e/auth.spec.ts` prova que `/admin/produtos`, `/admin/categorias` e `/admin` sem sessão terminam em `/admin/login` (settles C1)
- [ ] Gate check passes: `npx vitest run && npx playwright test`
- [ ] Test count: 1 e2e test passes

**Tests**: e2e
**Gate**: full

**Commit**: `feat(auth): protege rotas do painel com proxy e requireAdmin`

---

### T15: Tela de login

**What**: `/admin/login` com e-mail, senha, "Entrar" e "Esqueci minha senha"; action `signIn` com as mensagens da spec e a recusa de quem não é admin.
**Where**: `src/app/admin/(acesso)/login/page.tsx`
**Depends on**: T14
**Reuses**: `requireAdmin`
**Requirement**: AUTH-01

**Done when**:

- [ ] `tests/e2e/auth.spec.ts` prova: admin entra e cai em `/admin/produtos` (C2); senha errada mostra "E-mail ou senha incorretos." com o e-mail mantido (C3); usuário sem papel vê "Este acesso não tem permissão para o painel." e continua sem sessão (C4)
- [ ] Gate check passes: `npx vitest run && npx playwright test`
- [ ] Test count: 3 e2e tests pass

**Tests**: e2e
**Gate**: full

**Commit**: `feat(auth): adiciona tela de login do painel`

---

### T16: Recuperação de senha

**What**: `/admin/esqueci-senha`, rota `/admin/auth/callback` e `/admin/nova-senha` (mínimo 8 caracteres).
**Where**: `src/app/admin/(acesso)/esqueci-senha/page.tsx`
**Depends on**: T15
**Reuses**: SMTP de captura de T7
**Requirement**: AUTH-01

**Done when**:

- [ ] `tests/e2e/password.spec.ts` prova: e-mail cadastrado e não cadastrado mostram a mesma mensagem da spec (C5); o link capturado no SMTP abre `/admin/nova-senha`, a senha de 7 caracteres é recusada com "Use ao menos 8 caracteres." e a de 8 abre `/admin/produtos` autenticado (C6)
- [ ] Gate check passes: `npx vitest run && npx playwright test`
- [ ] Test count: 2 e2e tests pass

**Tests**: e2e
**Gate**: full

**Commit**: `feat(auth): adiciona recuperação de senha do painel`

---

### T17: Shell do painel com menu e "Sair"

**What**: Layout `(painel)` com `requireAdmin`, `AdminShell` da captura (8 itens na ordem de AD-007, usuário, "Sair"), menu recolhível no celular, `/admin` redirecionando para `/admin/produtos` e páginas "Em breve" para Banners e ofertas, Cupons e Configurações, e "Nenhum pedido ainda." em Pedidos.
**Where**: `src/components/admin/AdminShell.tsx`
**Depends on**: T16
**Reuses**: tokens de T1
**Requirement**: AUTH-01, PLIST-01

**Done when**:

- [ ] `tests/e2e/shell.spec.ts` prova: "Sair" encerra a sessão e abre `/admin/login`, e voltar para `/admin/produtos` cai no login (C7); o menu mostra os 8 itens na ordem da spec (C22)
- [ ] Gate check passes: `npx vitest run && npx playwright test`
- [ ] Test count: 2 e2e tests pass

**Tests**: e2e
**Gate**: build

**Commit**: `feat(painel): adiciona shell do painel com menu lateral e sair`

---

### T18: Lista de produtos

**What**: `/admin/produtos` com cartões, abas, busca, filtro de categoria (URL sem recarregar), tabela, cartões empilhados abaixo de 768 px, paginação, estados vazios e "Ver no site", lendo do Supabase e usando `filterAdminProducts` e `adminKpis`.
**Where**: `src/app/admin/(painel)/produtos/page.tsx`
**Depends on**: T17
**Reuses**: `src/lib/domain/admin-products.ts`, `formatBRL`
**Requirement**: PLIST-01

**Done when**:

- [ ] A tela a 1440 px confere com `.specs/features/painel-catalogo/captures/admin-produtos.png` (C9, provado no walk)
- [ ] `tests/e2e/products.spec.ts` prova: cada linha mostra capa, marca e nome, embalagem e SKU, categoria, preço, estoque, oferta, visibilidade e "Editar" (C10); filtro sem resultado mostra "Nenhum produto encontrado." e "Limpar filtros" volta à lista toda (C17); banco sem produtos mostra "Nenhum produto cadastrado ainda." e "Novo produto" (C18); "Ver no site" abre `/produtos` em nova aba (C19); cada linha tem o interruptor de oferta (C21); a 390 px a lista vira cartões e a página não rola na horizontal (C24)
- [ ] Gate check passes: `npx vitest run && npx playwright test`
- [ ] Test count: 6 e2e tests pass

**Tests**: e2e
**Gate**: full

**Commit**: `feat(painel): adiciona lista de produtos com filtros e indicadores`

---

### T19: Interruptor com atualização otimista

**What**: `Switch` acessível (`role="switch"`, 44 px de alvo) e `RowToggle`, que muda na hora, chama a action recebida por prop e volta com a mensagem quando ela falha.
**Where**: `src/components/admin/RowToggle.tsx`
**Depends on**: T18
**Reuses**: tokens de T1
**Requirement**: PTOG-01

**Done when**:

- [ ] `src/components/admin/RowToggle.test.tsx` prova: clique muda `aria-checked` na hora; action que devolve `{ ok: false }` volta o interruptor e mostra "Não foi possível salvar. Tente de novo." (C28); action que devolve a mensagem de oferta mostra essa mensagem
- [ ] Gate check passes: `npx vitest run`
- [ ] Test count: 3 tests pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(painel): adiciona interruptor com atualização otimista`

---

### T20: Actions de visibilidade e oferta

**What**: `setVisibility` e `setPromo` gravam no Supabase com a sessão, traduzem `promo_requires_price` e chamam `revalidatePath('/', 'layout')`; a lista passa a usar `RowToggle` com elas.
**Where**: `src/app/admin/(painel)/produtos/actions.ts`
**Depends on**: T19
**Reuses**: `RowToggle`, `createServerSupabase`
**Requirement**: PTOG-01

**Done when**:

- [ ] `tests/e2e/toggles.spec.ts` prova: desligar "Visível no site" muda a linha, e depois de recarregar continua desligado e o produto aparece na aba "Ocultos" (C25); ligar a oferta de um produto com preço promocional persiste (C26); ligar a oferta sem preço promocional volta o interruptor e mostra "Informe o preço promocional antes de ativar a oferta." (C27)
- [ ] Gate check passes: `npx vitest run && npx playwright test`
- [ ] Test count: 3 e2e tests pass

**Tests**: e2e
**Gate**: build

**Commit**: `feat(painel): grava visibilidade e oferta direto na lista`

---

### T21: Enviar fotos

**What**: `PhotoUploader` com área de arrastar e clicar, redução no canvas para WebP (`heic2any` só para HEIC), envio para `product-images/products/<id>/`, selo "Capa", marcar capa, remover e "Falhou · tentar de novo".
**Where**: `src/components/admin/product-form/PhotoUploader.tsx`
**Depends on**: T20
**Reuses**: `acceptPhoto`, `resizeTarget`, `withNewPhoto`, `withoutPhoto`
**Requirement**: PFORM-01

**Done when**:

- [ ] `src/components/admin/product-form/PhotoUploader.test.tsx` prova: com 6 fotos, a 7ª mostra "Máximo de 6 fotos por produto." (C35); um GIF mostra a mensagem de formato (C36); marcar capa move o selo "Capa" para aquela foto e só ela fica com `is_cover` (C37); a primeira foto enviada recebe "Capa" (C38); remover a capa passa o selo para a primeira restante (C39); envio que falha marca só aquela foto com "Falhou · tentar de novo"
- [ ] Gate check passes: `npx vitest run`
- [ ] Test count: 6 tests pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(painel): adiciona envio de fotos com redução e capa`

---

### T22: Escolher embalagens com preço

**What**: `VariantPicker` com os chips Frasco 1L, Frasco 4L, Balde 20L, Tambor 200L e Unidade, "Outra" com texto livre, e Preço (R$) e Preço promocional (R$) para cada embalagem marcada (AD-003).
**Where**: `src/components/admin/product-form/VariantPicker.tsx`
**Depends on**: T21
**Reuses**: `parseBRL`
**Requirement**: PFORM-01

**Done when**:

- [ ] `src/components/admin/product-form/VariantPicker.test.tsx` prova: marcar "Balde 20L" mostra os dois campos de preço daquela embalagem e desmarcar remove a embalagem e seus campos (C40); "Outra" com "Pote 500g" cria a embalagem
- [ ] Gate check passes: `npx vitest run`
- [ ] Test count: 2 tests pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(painel): adiciona escolha de embalagens com preço próprio`

---

### T23: Prévia do card

**What**: `PreviewCard` escuro da captura: selo "Oferta", marca, nome, embalagem e preço (promocional com o normal riscado quando em oferta).
**Where**: `src/components/admin/product-form/PreviewCard.tsx`
**Depends on**: T22
**Reuses**: `displayVariant`, `formatBRL`
**Requirement**: PFORM-01

**Done when**:

- [ ] `src/components/admin/product-form/PreviewCard.test.tsx` prova: em oferta mostra "Oferta", "R$ 349,90" e "R$ 389,90" riscado; fora de oferta mostra só "R$ 389,90" sem selo
- [ ] Gate check passes: `npx vitest run`
- [ ] Test count: 2 tests pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(painel): adiciona prévia do card do produto`

---

### T24: Formulário de produto

**What**: `ProductForm` com Informações básicas, Fotos, Preço e estoque, Embalagens, Ficha técnica, Publicação e Prévia; valida com `productInputSchema` antes de chamar `onSave`; "Cancelar" pergunta "Descartar as alterações?" quando há mudança; abaixo de 768 px uma coluna com Publicação depois de Informações básicas.
**Where**: `src/components/admin/product-form/ProductForm.tsx`
**Depends on**: T23
**Reuses**: `PhotoUploader`, `VariantPicker`, `PreviewCard`, `productInputSchema`
**Requirement**: PFORM-01

**Done when**:

- [ ] `src/components/admin/product-form/ProductForm.test.tsx` prova: salvar vazio mostra "Campo obrigatório" em nome, marca, categoria, embalagem e fotos e não chama `onSave` (C31); promo 400 com preço 389,90 mostra "O preço promocional precisa ser menor que o preço." (C32); estoque -1 mostra "Informe um número válido." (C33); digitar o nome e ligar "Em oferta" muda a prévia sem salvar (C41); "Cancelar" com mudança pergunta e só sai ao confirmar, e sem mudança sai direto (C44); Tipo oferece Mineral, Semissintético e Sintético (C46)
- [ ] Gate check passes: `npx vitest run`
- [ ] Test count: 7 tests pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(painel): adiciona formulário de cadastro de produto`

---

### T25: Páginas de novo produto e edição

**What**: `/admin/produtos/novo` e `/admin/produtos/[id]` com `ProductForm`, action `saveProduct` (valida de novo, chama `save_product`, revalida e volta com "Produto salvo."), `BrandQuickCreate` ("+ Nova marca") e rascunho em `sessionStorage` quando a sessão expira.
**Where**: `src/app/admin/(painel)/produtos/[id]/page.tsx`
**Depends on**: T24
**Reuses**: `ProductForm`, `save_product`
**Requirement**: PFORM-01, TAX-01

**Done when**:

- [ ] A tela de "Novo produto" a 1440 px confere com `.specs/features/painel-catalogo/captures/admin-cadastro.png` (C29, provado no walk)
- [ ] `tests/e2e/product-form.spec.ts` prova: "Editar" abre o formulário com nome, marca, categoria, embalagens, preços e fotos do produto (C30); uma foto PNG de 3000×2000 chega ao Storage como `image/webp` com 1600×1067 (C34); salvar um produto válido volta para a lista com "Produto salvo." e a linha nova (C42); ligar "Destaque na home", salvar e reabrir mostra o interruptor ligado (C43); a 390 px as seções ficam numa coluna com Publicação logo depois de Informações básicas (C47); "+ Nova marca" com "Ipiranga" cria a marca e já a deixa selecionada (C57)
- [ ] Gate check passes: `npx vitest run && npx playwright test`
- [ ] Test count: 6 e2e tests pass

**Tests**: e2e
**Gate**: full

**Commit**: `feat(painel): adiciona páginas de cadastro e edição de produto`

---

### T26: Duplicar produto

**What**: Botão "Duplicar" na edição, que abre `/admin/produtos/novo?de=<id>` com tudo copiado, nome com " (cópia)" e "Visível no site" desligado; as fotos são copiadas para a pasta do novo id ao salvar.
**Where**: `src/app/admin/(painel)/produtos/novo/page.tsx`
**Depends on**: T25
**Reuses**: `ProductForm`, `saveProduct`
**Requirement**: PDUP-01

**Done when**:

- [ ] `tests/e2e/duplicate.spec.ts` prova: "Duplicar" no "Delvac 15W-40" abre o formulário com "Delvac 15W-40 (cópia)", as mesmas embalagens e fotos e "Visível no site" desligado (C48); salvar cria um segundo produto com slug próprio e o original continua igual (C49)
- [ ] Gate check passes: `npx vitest run && npx playwright test`
- [ ] Test count: 2 e2e tests pass

**Tests**: e2e
**Gate**: build

**Commit**: `feat(painel): adiciona duplicar produto`

---

### T27: Categorias

**What**: `/admin/categorias` com a lista em ordem, contagem de produtos, criar, renomear, "Subir", "Descer" e excluir com confirmação; actions traduzem `category_in_use:N` e nome repetido.
**Where**: `src/app/admin/(painel)/categorias/page.tsx`
**Depends on**: T26
**Reuses**: `make_slug`, gatilhos de T6
**Requirement**: TAX-01

**Done when**:

- [ ] `tests/e2e/categories.spec.ts` prova: a lista mostra as 4 categorias na ordem de `position` com a contagem (C50); criar "Arla 32" grava o slug `arla-32` e a põe no fim (C51); excluir "Linha pesada" com produtos mostra "Esta categoria tem 4 produtos. Mude a categoria deles antes de excluir." (C52); criar "linha leve" mostra "Já existe uma com esse nome." (C53); "Subir" em "Filtros" troca a ordem na tela e depois de recarregar (C58)
- [ ] Gate check passes: `npx vitest run && npx playwright test`
- [ ] Test count: 5 e2e tests pass

**Tests**: e2e
**Gate**: full

**Commit**: `feat(painel): adiciona cadastro de categorias`

---

### T28: Marcas

**What**: `/admin/marcas` com a lista alfabética, logo opcional (mesma redução das fotos, bucket `product-images/brands/`), contagem de produtos, criar, renomear e excluir com bloqueio.
**Where**: `src/app/admin/(painel)/marcas/page.tsx`
**Depends on**: T27
**Reuses**: `PhotoUploader` em modo de uma foto, gatilhos de T6
**Requirement**: TAX-01

**Done when**:

- [ ] `tests/e2e/brands.spec.ts` prova: a lista mostra as 6 marcas em ordem alfabética com logo e contagem (C54); criar "Petronas" com logo grava o slug `petronas` e o logo aparece (C55); excluir "Shell" com produtos mostra "Esta marca tem 2 produtos. Mude a marca deles antes de excluir." (C56)
- [ ] Gate check passes: `npx vitest run && npx playwright test`
- [ ] Test count: 3 e2e tests pass

**Tests**: e2e
**Gate**: build

**Commit**: `feat(painel): adiciona cadastro de marcas`

---

## Checks

**C1** - Sem sessão, `/admin/produtos`, `/admin/categorias` e `/admin` terminam em `/admin/login` (AUTH-01, AC 1)
Proof: `npx playwright test tests/e2e/auth.spec.ts -g "AUTH-01.1:"`

**C2** - Admin com e-mail e senha certos cai em `/admin/produtos` (AUTH-01, AC 2)
Proof: `npx playwright test tests/e2e/auth.spec.ts -g "AUTH-01.2:"`

**C3** - Senha errada mostra "E-mail ou senha incorretos." e mantém o e-mail (AUTH-01, AC 3)
Proof: `npx playwright test tests/e2e/auth.spec.ts -g "AUTH-01.3:"`

**C4** - Usuário sem papel admin vê "Este acesso não tem permissão para o painel." e fica sem sessão (AUTH-01, AC 4)
Proof: `npx playwright test tests/e2e/auth.spec.ts -g "AUTH-01.4:"`

**C5** - E-mail cadastrado e não cadastrado mostram a mesma mensagem de recuperação (AUTH-01, AC 5)
Proof: `npx playwright test tests/e2e/password.spec.ts -g "AUTH-01.5:"`

**C6** - O link do e-mail leva à nova senha; 8 caracteres abrem `/admin/produtos` autenticado (AUTH-01, AC 6)
Proof: `npx playwright test tests/e2e/password.spec.ts -g "AUTH-01.6:"`

**C7** - "Sair" encerra a sessão e abre `/admin/login` (AUTH-01, AC 7)
Proof: `npx playwright test tests/e2e/shell.spec.ts -g "AUTH-01.7:"`

**C8** - `anon` e autenticado sem papel não inserem, alteram nem excluem em products, product_images, product_variants, categories e brands (AUTH-01, AC 8)
Proof: `npx vitest run tests/db/rls.test.ts -t "AUTH-01.8:"`

**C9** - A lista de produtos a 1440 px é a da captura (PLIST-01, AC 1)
Proof: browser captures/admin-produtos.running.png

**C10** - Cada linha mostra capa, marca e nome, embalagem e SKU, categoria, preço, estoque, oferta, visibilidade e "Editar" (PLIST-01, AC 2)
Proof: `npx playwright test tests/e2e/products.spec.ts -g "PLIST-01.2:"`

**C11** - A aba "Visíveis" mostra só `is_visible = true` (PLIST-01, AC 3)
Proof: `npx vitest run src/lib/domain/admin-products.test.ts -t "PLIST-01.3:"`

**C12** - A aba "Ocultos" mostra só `is_visible = false` (PLIST-01, AC 4)
Proof: `npx vitest run src/lib/domain/admin-products.test.ts -t "PLIST-01.4:"`

**C13** - A busca acha por nome, marca e SKU sem diferenciar caixa, acento e hífen (PLIST-01, AC 5)
Proof: `npx vitest run src/lib/domain/admin-products.test.ts -t "PLIST-01.5:"`

**C14** - O filtro de categoria combina com a aba e a busca (PLIST-01, AC 6)
Proof: `npx vitest run src/lib/domain/admin-products.test.ts -t "PLIST-01.6:"`

**C15** - Estoque 5 mostra "Baixo · 5"; estoque 6 mostra "6 un." (PLIST-01, AC 7)
Proof: `npx vitest run src/lib/domain/admin-products.test.ts -t "PLIST-01.7:"`

**C16** - 45 produtos dão "20 de 45 produtos", "Página 1 de 3" e 5 itens na página 3 (PLIST-01, AC 8)
Proof: `npx vitest run src/lib/domain/admin-products.test.ts -t "PLIST-01.8:"`

**C17** - Filtro sem resultado mostra "Nenhum produto encontrado." e "Limpar filtros" (PLIST-01, AC 9)
Proof: `npx playwright test tests/e2e/products.spec.ts -g "PLIST-01.9:"`

**C18** - Banco sem produtos mostra "Nenhum produto cadastrado ainda." e "Novo produto" (PLIST-01, AC 10)
Proof: `npx playwright test tests/e2e/products.spec.ts -g "PLIST-01.10:"`

**C19** - "Ver no site" abre `/produtos` em nova aba (PLIST-01, AC 11)
Proof: `npx playwright test tests/e2e/products.spec.ts -g "PLIST-01.11:"`

**C20** - Os cartões contam visíveis, em oferta visíveis, estoque de 5 ou menos e pedidos dos últimos 30 dias (PLIST-01, AC 12)
Proof: `npx vitest run src/lib/domain/admin-products.test.ts -t "PLIST-01.12:"`

**C21** - Cada linha tem um interruptor de oferta (PLIST-01, AC 13)
Proof: `npx playwright test tests/e2e/products.spec.ts -g "PLIST-01.13:"`

**C22** - O menu mostra Visão geral, Produtos, Pedidos, Categorias, Marcas, Banners e ofertas, Cupons e Configurações, nessa ordem (PLIST-01, AC 14)
Proof: `npx playwright test tests/e2e/shell.spec.ts -g "PLIST-01.14:"`

**C23** - Produto com 3 embalagens mostra o preço da primeira e "3 embalagens" (PLIST-01, AC 15)
Proof: `npx vitest run src/lib/domain/admin-products.test.ts -t "PLIST-01.15:"`

**C24** - A 390 px a lista vira cartões e a página não rola na horizontal (PLIST-01, AC 16)
Proof: `npx playwright test tests/e2e/products.spec.ts -g "PLIST-01.16:"`

**C25** - Desligar "Visível no site" persiste sem recarregar e o produto vai para "Ocultos" (PTOG-01, AC 1)
Proof: `npx playwright test tests/e2e/toggles.spec.ts -g "PTOG-01.1:"`

**C26** - Ligar a oferta de um produto com preço promocional persiste (PTOG-01, AC 2)
Proof: `npx playwright test tests/e2e/toggles.spec.ts -g "PTOG-01.2:"`

**C27** - Oferta sem preço promocional volta e mostra "Informe o preço promocional antes de ativar a oferta." (PTOG-01, AC 3)
Proof: `npx playwright test tests/e2e/toggles.spec.ts -g "PTOG-01.3:"`

**C28** - Gravação que falha volta o interruptor e mostra "Não foi possível salvar. Tente de novo." (PTOG-01, AC 4)
Proof: `npx vitest run src/components/admin/RowToggle.test.tsx -t "PTOG-01.4:"`

**C29** - O formulário de novo produto a 1440 px é o da captura (PFORM-01, AC 1)
Proof: browser captures/admin-cadastro.running.png

**C30** - "Editar" abre o formulário preenchido com os dados do produto (PFORM-01, AC 2)
Proof: `npx playwright test tests/e2e/product-form.spec.ts -g "PFORM-01.2:"`

**C31** - Salvar sem nome, marca, categoria, embalagem com preço ou foto mostra "Campo obrigatório" em cada um e não salva (PFORM-01, AC 3)
Proof: `npx vitest run src/components/admin/product-form/ProductForm.test.tsx -t "PFORM-01.3:"`

**C32** - Promo maior ou igual ao preço mostra "O preço promocional precisa ser menor que o preço." e não salva (PFORM-01, AC 4)
Proof: `npx vitest run src/components/admin/product-form/ProductForm.test.tsx -t "PFORM-01.4:"`

**C33** - Número negativo ou não numérico mostra "Informe um número válido." e não salva (PFORM-01, AC 5)
Proof: `npx vitest run src/components/admin/product-form/ProductForm.test.tsx -t "PFORM-01.5:"`

**C34** - Uma foto de 3000×2000 chega ao bucket como WebP de 1600×1067 (PFORM-01, AC 6)
Proof: `npx playwright test tests/e2e/product-form.spec.ts -g "PFORM-01.6:"`

**C35** - A 7ª foto mostra "Máximo de 6 fotos por produto." (PFORM-01, AC 7)
Proof: `npx vitest run src/components/admin/product-form/PhotoUploader.test.tsx -t "PFORM-01.7:"`

**C36** - GIF ou arquivo acima de 15 MB mostra "Envie uma foto JPG, PNG, WebP ou HEIC de até 15 MB." (PFORM-01, AC 8)
Proof: `npx vitest run src/components/admin/product-form/PhotoUploader.test.tsx -t "PFORM-01.8:"`

**C37** - Marcar capa põe o selo "Capa" só naquela foto (PFORM-01, AC 9)
Proof: `npx vitest run src/components/admin/product-form/PhotoUploader.test.tsx -t "PFORM-01.9:"`

**C38** - A primeira foto enviada vira capa (PFORM-01, AC 10)
Proof: `npx vitest run src/components/admin/product-form/PhotoUploader.test.tsx -t "PFORM-01.10:"`

**C39** - Remover a capa passa o selo para a primeira restante (PFORM-01, AC 11)
Proof: `npx vitest run src/components/admin/product-form/PhotoUploader.test.tsx -t "PFORM-01.11:"`

**C40** - Marcar uma embalagem mostra Preço e Preço promocional dela; desmarcar a remove (PFORM-01, AC 12)
Proof: `npx vitest run src/components/admin/product-form/VariantPicker.test.tsx -t "PFORM-01.12:"`

**C41** - Mudar nome ou oferta atualiza a prévia sem salvar (PFORM-01, AC 13)
Proof: `npx vitest run src/components/admin/product-form/ProductForm.test.tsx -t "PFORM-01.13:"`

**C42** - Salvar um produto válido volta à lista com "Produto salvo." (PFORM-01, AC 14)
Proof: `npx playwright test tests/e2e/product-form.spec.ts -g "PFORM-01.14:"`

**C43** - "Destaque na home" ligado e salvo grava `is_featured = true` (PFORM-01, AC 15)
Proof: `npx playwright test tests/e2e/product-form.spec.ts -g "PFORM-01.15:"`

**C44** - "Cancelar" com mudança pergunta "Descartar as alterações?" e só sai ao confirmar (PFORM-01, AC 16)
Proof: `npx vitest run src/components/admin/product-form/ProductForm.test.tsx -t "PFORM-01.16:"`

**C45** - Nomes que geram o mesmo slug recebem `-2` e `-3` (PFORM-01, AC 17)
Proof: `npx vitest run tests/db/functions.test.ts -t "PFORM-01.17:"`

**C46** - Tipo oferece Mineral, Semissintético e Sintético (PFORM-01, AC 18)
Proof: `npx vitest run src/components/admin/product-form/ProductForm.test.tsx -t "PFORM-01.18:"`

**C47** - A 390 px o formulário fica numa coluna com Publicação depois de Informações básicas (PFORM-01, AC 19)
Proof: `npx playwright test tests/e2e/product-form.spec.ts -g "PFORM-01.19:"`

**C48** - "Duplicar" abre o formulário copiado, com " (cópia)" e "Visível no site" desligado (PDUP-01, AC 1)
Proof: `npx playwright test tests/e2e/duplicate.spec.ts -g "PDUP-01.1:"`

**C49** - Salvar a cópia cria outro produto com slug próprio e não muda o original (PDUP-01, AC 2)
Proof: `npx playwright test tests/e2e/duplicate.spec.ts -g "PDUP-01.2:"`

**C50** - "Categorias" lista na ordem de `position` com a contagem de produtos (TAX-01, AC 1)
Proof: `npx playwright test tests/e2e/categories.spec.ts -g "TAX-01.1:"`

**C51** - Criar "Arla 32" grava o slug `arla-32` no fim da ordem (TAX-01, AC 2)
Proof: `npx playwright test tests/e2e/categories.spec.ts -g "TAX-01.2:"`

**C52** - Excluir categoria com produtos mostra "Esta categoria tem N produtos. Mude a categoria deles antes de excluir." (TAX-01, AC 3)
Proof: `npx playwright test tests/e2e/categories.spec.ts -g "TAX-01.3:"`

**C53** - Nome repetido mostra "Já existe uma com esse nome." (TAX-01, AC 4)
Proof: `npx playwright test tests/e2e/categories.spec.ts -g "TAX-01.4:"`

**C54** - "Marcas" lista em ordem alfabética com logo e contagem (TAX-01, AC 5)
Proof: `npx playwright test tests/e2e/brands.spec.ts -g "TAX-01.5:"`

**C55** - Criar "Petronas" com logo grava o slug `petronas` e mostra o logo (TAX-01, AC 6)
Proof: `npx playwright test tests/e2e/brands.spec.ts -g "TAX-01.6:"`

**C56** - Excluir marca com produtos mostra "Esta marca tem N produtos. Mude a marca deles antes de excluir." (TAX-01, AC 7)
Proof: `npx playwright test tests/e2e/brands.spec.ts -g "TAX-01.7:"`

**C57** - "+ Nova marca" cria a marca sem sair do formulário e já a seleciona (TAX-01, AC 8)
Proof: `npx playwright test tests/e2e/product-form.spec.ts -g "TAX-01.8:"`

**C58** - "Subir" e "Descer" mudam a ordem na tela e gravam `position` (TAX-01, AC 9)
Proof: `npx playwright test tests/e2e/categories.spec.ts -g "TAX-01.9:"`

---

## Handoff

The feature's live state, written as it happens - a compaction gives no warning.

**Settled mid-build:** none
**Dispatched:** none
**Walked:** none

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7

Phase 1:  T1 → T2 → T3 → T4 → T5 → T6
Phase 2:  T7 → T8
Phase 3:  T9 → T10 → T11 → T12 → T13
Phase 4:  T14 → T15 → T16 → T17
Phase 5:  T18 → T19 → T20
Phase 6:  T21 → T22 → T23 → T24 → T25 → T26
Phase 7:  T27 → T28
```

Execution is strictly sequential. 28 tarefas formam 4 lotes de ~7: Fase 1 (6); Fases 2 e 3 (7); Fases 4 e 5 (7); Fases 6 e 7 (8).
