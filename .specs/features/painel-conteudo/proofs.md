# painel-conteudo proofs

**HEAD**: 279eda7
**Tree**: clean
**Result**: 22 pass, 0 fail; mutations 3 killed, 0 not

| Check | Proof | Ran | Passed | Result |
| --- | --- | --- | --- | --- |
| C1 | `npx playwright test tests/e2e/banners.spec.ts -g "BAN-01.1:"` | 1 | - | pass |
| C2 | `npx playwright test tests/e2e/banners.spec.ts -g "BAN-01.2:"` | 1 | - | pass |
| C3 | `npx playwright test tests/e2e/banners.spec.ts -g "BAN-01.3:"` | 1 | - | pass |
| C4 | `npx vitest run src/lib/domain/banner-input.test.ts -t "BAN-01.4:"` | 1 | 1 | pass |
| C5 | `npx playwright test tests/e2e/banners.spec.ts -g "BAN-01.5:"` | 1 | - | pass |
| C6 | `npx playwright test tests/e2e/banners.spec.ts -g "BAN-01.6:"` | 1 | - | pass |
| C7 | `npx playwright test tests/e2e/banners.spec.ts -g "BAN-01.7:"` | 1 | - | pass |
| C8 | `npx playwright test tests/e2e/coupons.spec.ts -g "CUP-01.1:"` | 1 | - | pass |
| C9 | `npx vitest run src/lib/domain/coupon-input.test.ts -t "CUP-01.2:"` | 1 | 1 | pass |
| C10 | `npx vitest run src/lib/domain/coupon-input.test.ts -t "CUP-01.3:"` | 1 | 1 | pass |
| C11 | `npx playwright test tests/e2e/coupons.spec.ts -g "CUP-01.4:"` | 1 | - | pass |
| C12 | `npx playwright test tests/e2e/coupons.spec.ts -g "CUP-01.5:"` | 1 | - | pass |
| C13 | `npx playwright test tests/e2e/settings.spec.ts -g "CONF-01.1:"` | 1 | - | pass |
| C14 | `npx playwright test tests/e2e/settings.spec.ts -g "CONF-01.2:"` | 1 | - | pass |
| C15 | `npx vitest run src/lib/domain/settings-input.test.ts -t "CONF-01.3:"` | 1 | 1 | pass |
| C16 | `npx vitest run src/lib/domain/settings-input.test.ts -t "CONF-01.4:"` | 1 | 1 | pass |
| C17 | `npx vitest run src/lib/domain/settings-input.test.ts -t "CONF-01.5:"` | 1 | 1 | pass |
| C18 | `npx vitest run src/lib/domain/settings-input.test.ts -t "CONF-01.6:"` | 1 | 1 | pass |
| C19 | `npx vitest run tests/db/schema.test.ts -t "CONF-01.7:"` | 1 | 1 | pass |
| Build | `npm run build` | - | - | pass |
| Build | `npm run typecheck` | - | - | pass |
| Build | `npm run lint` | - | - | pass |

## Mutations

| Mutation | Location | Killed |
| --- | --- | --- |
| título vazio só é recusado quando a foto também falta | `src/lib/domain/banner-input.ts:35` | yes |
| mensagem do link do WhatsApp com encodeURI (deixa ?, & e # crus) | `src/lib/domain/settings-input.ts:49` | yes |
| percentual 100 passa a ser recusado (<= 100 -> < 100) | `src/lib/domain/coupon-input.ts:22` | yes |
