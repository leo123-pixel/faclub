# Painel: banners, cupom e configurações Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, the walk, check_proofs, the Verifier and the screens sub-agent).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: inline (escopo médio) - ver `## Design notes` abaixo
**Status**: Approved
**Approved**: 2026-10-28 - user: "aprovado, pode seguir"
**Mutations**: 3
**Build**: `npm run build; npm run typecheck; npm run lint`

---

## Design notes

Sem arquitetura nova: as três telas seguem os padrões de painel-catalogo (AD-010, AD-011, AD-014).

- **Onde as regras rodam (AD-011):** validação de configurações, banner e cupom em funções puras (`src/lib/domain/settings-input.ts`, `banner-input.ts`, `coupon-input.ts`), testadas pelo Vitest; o link do WhatsApp (`whatsappLink`) também mora em `settings-input.ts`, para o site público reaproveitar. Unicidade do código do cupom, faixa do percentual e linha única em `settings` já estão no banco (migração do esquema).
- **Telas:** `src/app/admin/(painel)/configuracoes`, `cupons` e `banners` (lista, `novo` e `[id]`), trocando as páginas "Em breve". Reaproveitam `PageHeader`, `RowToggle` (interruptor Ativo), `PhotoUploader` com `max={1}` e o padrão de Server Actions com `requireAdmin` e `revalidatePath('/', 'layout')`.
- **Foto do banner:** `compressToWebp` ganha o parâmetro `maxSide` (1600 nas fotos de produto, 2400 no banner); o `PhotoUploader` repassa. Pasta `banners/` no bucket `product-images`.
- **Seed:** `seed.mjs` passa a repor também `settings`, o cupom FACLUB10 e a tabela `banners`, para cada teste começar do mesmo estado.

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: `.specs/features/painel-catalogo/tasks.md` (matriz aprovada da feature anterior).

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Domínio (`src/lib/domain`) | unit | Todos os ramos; 1:1 com os critérios; os dois lados de cada limite | `src/lib/domain/*.test.ts` | `npx vitest run src/lib/domain` |
| Componentes (`src/components`) | unit (jsdom) | Cada gesto que um critério nomeia | `src/components/**/*.test.tsx` | `npx vitest run src/components` |
| Banco (`supabase/migrations`) | integration | Restrição aceita e recusada | `tests/db/*.test.ts` | `npx vitest run tests/db` |
| Páginas e Server Actions | e2e | Caminho feliz, erros e o efeito gravado no banco | `tests/e2e/*.spec.ts` | `npx playwright test` |
| Configuração, scripts e seed | none | - (build gate only) | - | build gate only |

## Gate Check Commands

> Generated from codebase - confirm before Execute.

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Quick | Tarefas com testes unit ou de banco | `npx vitest run` |
| Full | Tarefas com testes e2e | `npx vitest run && npx playwright test` |
| Build | Fim de fase, ou tarefas só de configuração | `npm run lint && npm run typecheck && npm run build && npx vitest run && npx playwright test` |

---

## Execution Plan

### Phase 1: Regras e dados

```
T1 → T2 → T3 → T4 → T5
```

### Phase 2: Telas

```
T5 → T6 → T7 → T8 → T9
```

---

## Task Breakdown

### T1: Repor configurações, cupom e banners no seed ✅

**What**: `seed.mjs` volta `settings` aos valores iniciais, o FACLUB10 a 10% ativo (apagando outros cupons) e esvazia `banners` a cada execução.
**Where**: `scripts/local-supabase/seed.mjs`
**Depends on**: None
**Reuses**: `SEED_SQL` existente
**Requirement**: CONF-01, CUP-01, BAN-01

**Done when**:

- [x] Rodar o seed depois de mudar settings, cupons e banners devolve os valores iniciais da spec
- [x] Gate check passes: build gate

**Tests**: none
**Gate**: build

**Commit**: `chore: seed repõe configurações, cupom e banners`

---

### T2: Validar as configurações e montar o link do WhatsApp

**What**: `validateSettings` (WhatsApp com 10 ou 11 dígitos, e-mail, links `https://`) com as mensagens da spec, `onlyDigits` e `whatsappLink(digits, message)`.
**Where**: `src/lib/domain/settings-input.ts`
**Depends on**: T1
**Reuses**: padrão de `product-input.ts`
**Requirement**: CONF-01

**Done when**:

- [ ] `src/lib/domain/settings-input.test.ts` cobre: 9 e 12 dígitos recusados e 10 e 11 aceitos (C15); e-mail sem `@`, sem domínio e válido (C16); grupo e Instagram com `http://`, sem protocolo e vazios (C17); "(11) 2954-5764" vira `1129545764` e `https://wa.me/551129545764?text=` com a mensagem codificada (C18)
- [ ] Gate check passes: `npx vitest run`
- [ ] Test count: 5 tests pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(domain): adiciona validação das configurações e link do whatsapp`

---

### T3: Validar o banner

**What**: `validateBanner` (foto e título obrigatórios, link vazio ou começando com `/`, `https://` ou `http://`, ordem inteira não negativa).
**Where**: `src/lib/domain/banner-input.ts`
**Depends on**: T2
**Reuses**: `MESSAGES.required` de `product-input.ts`
**Requirement**: BAN-01

**Done when**:

- [ ] `src/lib/domain/banner-input.test.ts` cobre: sem foto e sem título dão "Campo obrigatório" nos dois (C3); `www.site.com`, `ftp://x` e `javascript:alert(1)` recusados e `/produtos`, `https://x.com` e vazio aceitos (C4); ordem `-1` e `2,5` recusadas
- [ ] Gate check passes: `npx vitest run`
- [ ] Test count: 4 tests pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(domain): adiciona validação do banner`

---

### T4: Validar o cupom

**What**: `normalizeCouponCode` (maiúsculas, sem espaços) e `validateCoupon` (código obrigatório, percentual inteiro de 1 a 100).
**Where**: `src/lib/domain/coupon-input.ts`
**Depends on**: T3
**Reuses**: -
**Requirement**: CUP-01

**Done when**:

- [ ] `src/lib/domain/coupon-input.test.ts` cobre: " fac club 10 " vira `FACCLUB10` (C9); 0, 101, 10,5 e "dez" recusados com "Use um número de 1 a 100." e 1 e 100 aceitos (C10); código vazio com "Campo obrigatório"
- [ ] Gate check passes: `npx vitest run`
- [ ] Test count: 3 tests pass

**Tests**: unit
**Gate**: quick

**Commit**: `feat(domain): adiciona validação do cupom`

---

### T5: Redução com lado maior configurável

**What**: `compressToWebp(file, maxSide)` e a prop `maxSide` do `PhotoUploader` (padrão 1600); renomeia o teste de linha única de `settings` para a prova de CONF-01 AC 7.
**Where**: `src/components/admin/product-form/compress.ts`
**Depends on**: T4
**Reuses**: `resizeTarget`
**Requirement**: BAN-01, CONF-01

**Done when**:

- [ ] `src/lib/domain/photos.test.ts` prova que 3000×2000 com máximo 2400 vira 2400×1600 e que 2000×1500 fica igual
- [ ] `tests/db/schema.test.ts` tem o teste "CONF-01.7: aceita só uma linha em settings" (C19)
- [ ] Gate check passes: `npm run lint && npm run typecheck && npm run build && npx vitest run && npx playwright test`
- [ ] Test count: os testes de fotos continuam passando

**Tests**: unit
**Gate**: build

**Commit**: `feat(painel): permite lado maior configurável na redução das fotos`

---

### T6: Tela de configurações

**What**: `/admin/configuracoes` com WhatsApp, telefone, e-mail, endereço, horários de seg a sex e de sábado, link do grupo, Instagram e mensagem de agendamento; action `saveSettings` valida com `validateSettings`, grava os dígitos, revalida e mostra "Configurações salvas.".
**Where**: `src/app/admin/(painel)/configuracoes/page.tsx`
**Depends on**: T5
**Reuses**: `PageHeader`, `validateSettings`, `requireAdmin`
**Requirement**: CONF-01

**Done when**:

- [ ] `tests/e2e/settings.spec.ts` prova: o formulário abre com os valores do seed (C13); trocar o sábado para "8h às 12h" e o WhatsApp para "(11) 99999-0000" mostra "Configurações salvas.", recarregar mostra os novos valores e o banco tem `11999990000` (C14); um WhatsApp com 9 dígitos mostra a mensagem da spec e não grava
- [ ] Gate check passes: `npx vitest run && npx playwright test`
- [ ] Test count: 3 e2e tests pass

**Tests**: e2e
**Gate**: full

**Commit**: `feat(painel): adiciona tela de configurações da loja`

---

### T7: Tela de cupons

**What**: `/admin/cupons` com a lista (código, percentual, texto, interruptor Ativo), criar e editar no mesmo formulário; actions traduzem código repetido e chamam `revalidatePath('/', 'layout')`.
**Where**: `src/app/admin/(painel)/cupons/page.tsx`
**Depends on**: T6
**Reuses**: `RowToggle`, `validateCoupon`, `normalizeCouponCode`
**Requirement**: CUP-01

**Done when**:

- [ ] `tests/e2e/coupons.spec.ts` prova: a lista mostra FACLUB10, "10%", o texto e Ativo ligado (C8); criar "faclub10" mostra "Já existe um cupom com esse código." (C11); desligar Ativo do FACLUB10 persiste depois de recarregar sem recarregar a página no clique (C12); salvar " troca 15 " com 15 grava `TROCA15`
- [ ] Gate check passes: `npx vitest run && npx playwright test`
- [ ] Test count: 4 e2e tests pass

**Tests**: e2e
**Gate**: full

**Commit**: `feat(painel): adiciona tela de cupons`

---

### T8: Lista de banners

**What**: `/admin/banners` com os banners na ordem do campo Ordem (foto, título, ordem, interruptor Ativo, Editar, Excluir com confirmação), "Novo banner" e o estado vazio "Nenhum banner cadastrado ainda.".
**Where**: `src/app/admin/(painel)/banners/page.tsx`
**Depends on**: T7
**Reuses**: `RowToggle`, `publicImageUrl`
**Requirement**: BAN-01

**Done when**:

- [ ] `tests/e2e/banners.spec.ts` prova: com dois banners criados no teste, a lista mostra os dois na ordem do campo Ordem com foto, título e Ativo (C1); desligar Ativo persiste depois de recarregar (C5); Excluir pergunta "Excluir este banner?", cancelar mantém e confirmar remove (C6)
- [ ] Gate check passes: `npx vitest run && npx playwright test`
- [ ] Test count: 3 e2e tests pass

**Tests**: e2e
**Gate**: full

**Commit**: `feat(painel): adiciona lista de banners`

---

### T9: Cadastro e edição de banner

**What**: `/admin/banners/novo` e `/admin/banners/[id]` com Foto (uma, até 2400 px), Título, Texto, Link, Ordem e Ativo; action `saveBanner` valida com `validateBanner`, grava, revalida e volta com "Banner salvo."; a foto que falha no envio mantém a anterior e mostra "Não foi possível enviar a foto. Tente de novo.".
**Where**: `src/app/admin/(painel)/banners/[id]/page.tsx`
**Depends on**: T8
**Reuses**: `PhotoUploader` com `max={1}` e `maxSide={2400}`, `validateBanner`
**Requirement**: BAN-01

**Done when**:

- [ ] `tests/e2e/banners.spec.ts` prova: criar um banner com foto, título "Oferta da semana", texto, link `/produtos` e ordem 1 volta à lista com "Banner salvo." e a linha nova; editar o título grava o novo título (C2); uma foto de 3000×2000 chega ao Storage como WebP de 2400×1600 (C7); salvar sem foto e sem título mostra "Campo obrigatório" nos dois
- [ ] Gate check passes: `npm run lint && npm run typecheck && npm run build && npx vitest run && npx playwright test`
- [ ] Test count: 3 e2e tests pass

**Tests**: e2e
**Gate**: build

**Commit**: `feat(painel): adiciona cadastro e edição de banner`

---

## Checks

**C1** - "Banners e ofertas" lista os banners na ordem do campo Ordem com foto, título, Ativo e ordem (BAN-01, AC 1)
Proof: `npx playwright test tests/e2e/banners.spec.ts -g "BAN-01.1:"`

**C2** - Salvar um banner válido grava, volta à lista com "Banner salvo." e a edição grava o novo título (BAN-01, AC 2)
Proof: `npx playwright test tests/e2e/banners.spec.ts -g "BAN-01.2:"`

**C3** - Sem foto ou sem título, "Campo obrigatório" em cada campo que falta e nada grava (BAN-01, AC 3)
Proof: `npx vitest run src/lib/domain/banner-input.test.ts -t "BAN-01.3:"`

**C4** - Link fora de `/`, `https://` e `http://` mostra "Use um link do site (começando com /) ou um endereço completo." (BAN-01, AC 4)
Proof: `npx vitest run src/lib/domain/banner-input.test.ts -t "BAN-01.4:"`

**C5** - O interruptor Ativo grava `is_active` sem recarregar a página (BAN-01, AC 5)
Proof: `npx playwright test tests/e2e/banners.spec.ts -g "BAN-01.5:"`

**C6** - Excluir pergunta "Excluir este banner?" e só exclui com a confirmação (BAN-01, AC 6)
Proof: `npx playwright test tests/e2e/banners.spec.ts -g "BAN-01.6:"`

**C7** - Uma foto de 3000×2000 chega ao bucket como WebP de 2400×1600 (BAN-01, AC 7)
Proof: `npx playwright test tests/e2e/banners.spec.ts -g "BAN-01.7:"`

**C8** - "Cupons" lista código, percentual, texto e Ativo (CUP-01, AC 1)
Proof: `npx playwright test tests/e2e/coupons.spec.ts -g "CUP-01.1:"`

**C9** - O código é gravado em maiúsculas e sem espaços (CUP-01, AC 2)
Proof: `npx vitest run src/lib/domain/coupon-input.test.ts -t "CUP-01.2:"`

**C10** - Percentual fora de 1 a 100 ou não inteiro mostra "Use um número de 1 a 100." (CUP-01, AC 3)
Proof: `npx vitest run src/lib/domain/coupon-input.test.ts -t "CUP-01.3:"`

**C11** - Código repetido mostra "Já existe um cupom com esse código." (CUP-01, AC 4)
Proof: `npx playwright test tests/e2e/coupons.spec.ts -g "CUP-01.4:"`

**C12** - O interruptor Ativo do cupom grava `is_active` sem recarregar a página (CUP-01, AC 5)
Proof: `npx playwright test tests/e2e/coupons.spec.ts -g "CUP-01.5:"`

**C13** - "Configurações" abre com todos os campos preenchidos com os valores atuais (CONF-01, AC 1)
Proof: `npx playwright test tests/e2e/settings.spec.ts -g "CONF-01.1:"`

**C14** - Salvar grava a linha de `settings` e mostra "Configurações salvas." (CONF-01, AC 2)
Proof: `npx playwright test tests/e2e/settings.spec.ts -g "CONF-01.2:"`

**C15** - WhatsApp sem 10 ou 11 dígitos mostra "Informe o WhatsApp com DDD, por exemplo (11) 2954-5764." (CONF-01, AC 3)
Proof: `npx vitest run src/lib/domain/settings-input.test.ts -t "CONF-01.3:"`

**C16** - E-mail inválido mostra "Informe um e-mail válido." (CONF-01, AC 4)
Proof: `npx vitest run src/lib/domain/settings-input.test.ts -t "CONF-01.4:"`

**C17** - Link do grupo ou do Instagram sem `https://` mostra "Use o endereço completo, começando com https://." (CONF-01, AC 5)
Proof: `npx vitest run src/lib/domain/settings-input.test.ts -t "CONF-01.5:"`

**C18** - O WhatsApp é guardado só com dígitos e o link é `https://wa.me/55<dígitos>` (CONF-01, AC 6)
Proof: `npx vitest run src/lib/domain/settings-input.test.ts -t "CONF-01.6:"`

**C19** - O banco recusa uma segunda linha em `settings` (CONF-01, AC 7)
Proof: `npx vitest run tests/db/schema.test.ts -t "CONF-01.7:"`

---

## Handoff

The feature's live state, written as it happens - a compaction gives no warning.

**Settled mid-build:** none
**Dispatched:** none
**Walked:** none

---

## Phase Execution Map

```
Phase 1 → Phase 2

Phase 1:  T1 → T2 → T3 → T4 → T5
Phase 2:  T6 → T7 → T8 → T9
```

9 tarefas: um lote só, executado nesta sessão, sem sub-agentes de lote.
