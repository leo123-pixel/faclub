# lancamento proofs

**HEAD**: 842484a
**Tree**: clean
**Result**: 25 pass, 0 fail; mutations 0 killed, 0 not

| Check | Proof | Ran | Passed | Result |
| --- | --- | --- | --- | --- |
| C1 | `npx playwright test tests/e2e/consent.spec.ts -g "CONS-01.1:"` | 1 | - | pass |
| C2 | `npx playwright test tests/e2e/consent.spec.ts -g "CONS-01.2:"` | 1 | - | pass |
| C3 | `npx playwright test tests/e2e/consent.spec.ts -g "CONS-01.3:"` | 1 | - | pass |
| C4 | `npx playwright test tests/e2e/consent.spec.ts -g "CONS-01.4:"` | 1 | - | pass |
| C5 | `npx playwright test tests/e2e/events.spec.ts -g "CONS-01.5:"` | 1 | - | pass |
| C6 | `npx playwright test tests/e2e/events.spec.ts -g "CONS-01.6:"` | 1 | - | pass |
| C7 | `npx playwright test tests/e2e/events.spec.ts -g "CONS-01.7:"` | 1 | - | pass |
| C8 | `npx playwright test tests/e2e/events.spec.ts -g "CONS-01.8:"` | 1 | - | pass |
| C9 | `npx playwright test tests/e2e/events.spec.ts -g "CONS-01.9:"` | 1 | - | pass |
| C10 | `npx playwright test tests/e2e/events.spec.ts -g "CONS-01.10:"` | 1 | - | pass |
| C11 | `npx playwright test tests/e2e/consent.spec.ts -g "CONS-01.11:"` | 1 | - | pass |
| C12 | `npx playwright test tests/e2e/seo-tech.spec.ts -g "SITEMAP-01.1:"` | 1 | - | pass |
| C13 | `npx playwright test tests/e2e/seo-tech.spec.ts -g "SITEMAP-01.2:"` | 1 | - | pass |
| C14 | `npx playwright test tests/e2e/seo-tech.spec.ts -g "SITEMAP-01.3:"` | 1 | - | pass |
| C15 | `npx playwright test tests/e2e/seo-tech.spec.ts -g "SITEMAP-01.4:"` | 1 | - | pass |
| C16 | `npx playwright test tests/e2e/seo-tech.spec.ts -g "SITEMAP-01.5:"` | 1 | - | pass |
| C17 | `npx playwright test tests/e2e/redirects.spec.ts -g "REDIR-01.1:"` | 1 | - | pass |
| C18 | `npx playwright test tests/e2e/redirects.spec.ts -g "REDIR-01.2:"` | 1 | - | pass |
| C19 | `npx vitest run src/lib/domain/legacy-redirects.test.ts -t "REDIR-01.3:"` | 1 | 1 | pass |
| C20 | `npx playwright test tests/e2e/backup.spec.ts -g "BKP-01.1:"` | 1 | - | pass |
| C21 | `npx vitest run tests/config/backup-workflow.test.ts -t "BKP-01.2:"` | 1 | 1 | pass |
| C22 | `npx vitest run tests/config/backup-workflow.test.ts -t "BKP-01.3:"` | 1 | 1 | pass |
| Build | `npm run build:local` | - | - | pass |
| Build | `npm run typecheck` | - | - | pass |
| Build | `npm run lint` | - | - | pass |
