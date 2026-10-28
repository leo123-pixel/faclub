# LESSONS - auto-maintained by scripts/lessons.py

> Machine-owned. Do NOT hand-edit. Changes are overwritten on the next `lessons.py` write.
> Canonical state lives in `.specs/lessons.json`. Edit lessons only via the script.
> promote_threshold=2 distinct features · window_days=45 · quarantine_threshold=2

## Confirmed (load these at Plan/Checks)

Corroborated across multiple features. Safe to apply as guidance.

_none_

## Candidates (under observation - do NOT load as guidance yet)

Seen once or not yet corroborated. Tracked, not trusted.

### L-001 - Test access rules with a user who sets the privileged claim in a field they control, such as user_metadata
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `rls` · harmful: 0
- features: painel-catalogo
- evidence: supabase/migrations/20261028000200_rls.sql:8 (rls)
- last seen: 2026-10-28T12:56:07Z

### L-002 - Prove each boundary comparison with the equal value, not only a value past it
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `domain` · harmful: 0
- features: painel-catalogo
- evidence: src/lib/domain/product-input.ts:83 (domain)
- last seen: 2026-10-28T12:56:08Z

### L-003 - Exercise optimistic UI state across two consecutive actions so a revert to the initial value is caught
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `components` · harmful: 0
- features: painel-catalogo
- evidence: src/components/admin/RowToggle.tsx:30 (components)
- last seen: 2026-10-28T12:56:08Z

### L-004 - Prove time-window filters with records on both sides of the boundary through the data layer, not only the aggregation function
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `data-layer` · harmful: 0
- features: painel-catalogo
- evidence: C20 (data-layer)
- last seen: 2026-10-28T12:56:08Z

### L-005 - When a criterion lists several fields, the proving test changes every field it names
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `tests` · harmful: 0
- features: painel-catalogo
- evidence: C41 (tests)
- last seen: 2026-10-28T12:56:08Z

### L-006 - Validate numeric input against the database column limits so overflow shows the field message
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `domain` · harmful: 0
- features: painel-catalogo
- evidence: src/lib/domain/product-input.ts (domain)
- last seen: 2026-10-28T12:56:08Z

### L-007 - Recompute derived markers such as the cover from the items that actually succeeded
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `components` · harmful: 0
- features: painel-catalogo
- evidence: src/components/admin/product-form/PhotoUploader.tsx (components)
- last seen: 2026-10-28T12:56:08Z

### L-008 - Parse money the way people type it, including thousands separators without decimals
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `domain` · harmful: 0
- features: painel-catalogo
- evidence: src/lib/domain/money.ts (domain)
- last seen: 2026-10-28T12:56:08Z

### L-009 - Enforce a component limit prop in the rule it feeds, not only in the markup
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `components` · harmful: 0
- features: painel-catalogo
- evidence: src/components/admin/product-form/PhotoUploader.tsx:max (components)
- last seen: 2026-10-28T12:56:08Z

### L-010 - Test each required field missing on its own, not only all of them together
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `domain` · harmful: 0
- features: painel-conteudo
- evidence: src/lib/domain/banner-input.ts:35 (domain)
- last seen: 2026-10-28T13:33:37Z

### L-011 - Test text encoding with the reserved characters people can type, such as question mark, ampersand and hash
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `domain` · harmful: 0
- features: painel-conteudo
- evidence: src/lib/domain/settings-input.ts:49 (domain)
- last seen: 2026-10-28T13:33:37Z

### L-012 - Validate only what the criterion states; an extra format rule rejects input the spec allows
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `domain` · harmful: 0
- features: painel-conteudo
- evidence: src/lib/domain/banner-input.ts:27 (domain)
- last seen: 2026-10-28T13:33:37Z

### L-013 - Normalize input exactly as the criterion says before checking it, and reject every other character
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `domain` · harmful: 0
- features: painel-conteudo
- evidence: src/lib/domain/settings-input.ts (domain)
- last seen: 2026-10-28T13:33:37Z

### L-014 - A criterion that says nothing is saved is proven at the layer that saves
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `tests` · harmful: 0
- features: painel-conteudo
- evidence: C3 (tests)
- last seen: 2026-10-28T13:33:37Z

### L-015 - Teste uma regra que escolhe um entre vários valores (embalagem, foto, preço) com casos em que a escolha certa não é a primeira nem a menor
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `domain` · harmful: 0
- features: site-publico
- evidence: src/lib/domain/catalog.ts:110 (C34) (domain)
- last seen: 2026-10-28T20:57:03Z

### L-016 - Busca tolerante casa cada termo no início de uma palavra do campo e testa vizinhos que contêm o termo, como 5W-40 ao lado de 15W-40
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `domain` · harmful: 0
- features: site-publico
- evidence: src/lib/domain/search.ts:18 (C30) (domain)
- last seen: 2026-10-28T20:57:03Z

### L-017 - Prove paginação incremental com ao menos duas cargas e um resto, para separar mais N de mostrar todos
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `e2e` · harmful: 0
- features: site-publico
- evidence: tests/e2e/site-catalog.spec.ts:81 (C36) (e2e)
- last seen: 2026-10-28T20:57:03Z

### L-018 - Um critério de todas as páginas tem um teste que percorre a lista inteira de páginas públicas, atualizada a cada página nova
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `e2e` · harmful: 0
- features: site-publico
- evidence: tests/e2e/site-header.spec.ts:5 (C1, C2, C4) (e2e)
- last seen: 2026-10-28T20:57:03Z

### L-019 - Ao especificar com captura vinculante, liste em Differences from the source cada critério que muda o que a captura desenha, antes de aprovar a spec
- signal: `spec_deviation` · recurrence: 1 feature(s) · scope: `spec` · harmful: 0
- features: site-publico
- evidence: captures/catalogo.png, captures/produto.png, captures/home.png (C26, C54, C24, C10) (spec)
- last seen: 2026-10-28T20:57:03Z

### L-020 - Antes do design, confira se cada imagem que a captura desenha existe nos arquivos recebidos; a que faltar vira pergunta ao usuário
- signal: `spec_deviation` · recurrence: 1 feature(s) · scope: `spec` · harmful: 0
- features: site-publico
- evidence: captures/home.png, cards de serviço (C7) (spec)
- last seen: 2026-10-28T20:57:03Z

## Quarantined (failed when applied - ignore)

A confirmed lesson that recurred alongside failure. Kept for the maintainer to review.

_none_
