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

## Quarantined (failed when applied - ignore)

A confirmed lesson that recurred alongside failure. Kept for the maintainer to review.

_none_
