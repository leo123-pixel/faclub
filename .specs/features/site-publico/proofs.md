# site-publico proofs

**HEAD**: 792e512
**Tree**: clean
**Result**: 61 pass, 3 fail; mutations 0 killed, 0 not

| Check | Proof | Ran | Passed | Result |
| --- | --- | --- | --- | --- |
| C1 | `npx playwright test tests/e2e/site-header.spec.ts -g "HEAD-01.1:"` | 1 | - | pass |
| C2 | `npx playwright test tests/e2e/site-header.spec.ts -g "HEAD-01.2:"` | 1 | - | pass |
| C3 | `npx playwright test tests/e2e/site-header.spec.ts -g "HEAD-01.3:"` | 1 | - | pass |
| C4 | `npx playwright test tests/e2e/site-header.spec.ts -g "HEAD-01.4:"` | 1 | - | pass |
| C5 | `npx playwright test tests/e2e/site-header.spec.ts -g "HEAD-01.5:"` | 1 | - | pass |
| C6 | `npx playwright test tests/e2e/site-header.spec.ts -g "HEAD-01.6:"` | 1 | - | pass |
| C7 | `browser captures/home.running.png` | - | - | **not judged** (screens.md) |
| C8 | `npx playwright test tests/e2e/site-home.spec.ts -g "HOME-01.2:"` | 1 | - | pass |
| C9 | `npx playwright test tests/e2e/site-home.spec.ts -g "HOME-01.3:"` | 1 | - | pass |
| C10 | `npx playwright test tests/e2e/site-home.spec.ts -g "HOME-01.4:"` | 1 | - | pass |
| C11 | `npx playwright test tests/e2e/site-home.spec.ts -g "HOME-01.5:"` | 1 | - | pass |
| C12 | `npx playwright test tests/e2e/site-home.spec.ts -g "HOME-01.6:"` | 1 | - | pass |
| C13 | `npx playwright test tests/e2e/site-home.spec.ts -g "HOME-01.7:"` | 1 | - | pass |
| C14 | `npx playwright test tests/e2e/site-home.spec.ts -g "HOME-01.8:"` | 1 | - | pass |
| C15 | `npx playwright test tests/e2e/site-home.spec.ts -g "HOME-01.9:"` | 1 | - | pass |
| C16 | `npx playwright test tests/e2e/site-footer.spec.ts -g "HOME-01.10:"` | 1 | - | pass |
| C17 | `npx playwright test tests/e2e/site-home.spec.ts -g "HOME-01.11:"` | 1 | - | pass |
| C18 | `npx playwright test tests/e2e/site-freshness.spec.ts -g "HOME-01.12:"` | 1 | - | pass |
| C19 | `npx playwright test tests/e2e/site-freshness.spec.ts -g "HOME-01.13:"` | 1 | - | pass |
| C20 | `npx playwright test tests/e2e/site-freshness.spec.ts -g "HOME-01.14:"` | 1 | - | pass |
| C21 | `npx playwright test tests/e2e/site-freshness.spec.ts -g "HOME-01.15:"` | 1 | - | pass |
| C22 | `npx vitest run src/components/site/CouponBlock.test.tsx -t "CUPOM-01.1:"` | 1 | 1 | pass |
| C23 | `npx vitest run src/components/site/CouponBlock.test.tsx -t "CUPOM-01.2:"` | 2 | 2 | pass |
| C24 | `npx vitest run src/components/site/CouponBlock.test.tsx -t "CUPOM-01.3:"` | 1 | 1 | pass |
| C25 | `npx vitest run src/components/site/CouponBlock.test.tsx -t "CUPOM-01.4:"` | 1 | 1 | pass |
| C26 | `browser captures/catalogo.running.png` | - | - | **not judged** (screens.md) |
| C27 | `npx playwright test tests/e2e/site-catalog.spec.ts -g "CAT-01.2:"` | 1 | - | pass |
| C28 | `npx playwright test tests/e2e/site-catalog.spec.ts -g "CAT-01.3:"` | 1 | - | pass |
| C29 | `npx playwright test tests/e2e/site-catalog.spec.ts -g "CAT-01.4:"` | 1 | - | pass |
| C30 | `npx vitest run src/lib/domain/catalog.test.ts -t "CAT-01.5:"` | 1 | 1 | pass |
| C31 | `npx vitest run src/lib/domain/catalog.test.ts -t "CAT-01.6:"` | 1 | 1 | pass |
| C32 | `npx vitest run src/lib/domain/catalog.test.ts -t "CAT-01.7:"` | 1 | 1 | pass |
| C33 | `npx vitest run src/lib/domain/catalog.test.ts -t "CAT-01.8:"` | 1 | 1 | pass |
| C34 | `npx vitest run src/lib/domain/catalog.test.ts -t "CAT-01.9:"` | 2 | 2 | pass |
| C35 | `npx vitest run src/lib/domain/catalog.test.ts -t "CAT-01.10:"` | 1 | 1 | pass |
| C36 | `npx playwright test tests/e2e/site-catalog.spec.ts -g "CAT-01.11:"` | 1 | - | pass |
| C37 | `npx playwright test tests/e2e/site-catalog.spec.ts -g "CAT-01.12:"` | 1 | - | pass |
| C38 | `npx vitest run src/components/site/ProductCard.test.tsx -t "CAT-01.13:"` | 1 | 1 | pass |
| C39 | `npx vitest run src/components/site/ProductCard.test.tsx -t "CAT-01.14:"` | 1 | 1 | pass |
| C40 | `npx playwright test tests/e2e/site-freshness.spec.ts -g "CAT-01.15:"` | 1 | - | pass |
| C41 | `npx playwright test tests/e2e/site-freshness.spec.ts -g "CAT-01.16:"` | 1 | - | pass |
| C42 | `npx playwright test tests/e2e/site-freshness.spec.ts -g "CAT-01.17:"` | 1 | - | pass |
| C43 | `browser captures/produto.running.png` | - | - | **not judged** (screens.md) |
| C44 | `npx playwright test tests/e2e/site-product.spec.ts -g "PDP-01.2:"` | 1 | - | pass |
| C45 | `npx vitest run src/components/site/ProductGallery.test.tsx -t "PDP-01.3:"` | 1 | 1 | pass |
| C46 | `npx vitest run src/components/site/PurchaseBox.test.tsx -t "PDP-01.4:"` | 1 | 1 | pass |
| C47 | `npx vitest run src/components/site/PurchaseBox.test.tsx -t "PDP-01.5:"` | 1 | 1 | pass |
| C48 | `npx vitest run src/components/site/PurchaseBox.test.tsx -t "PDP-01.6:"` | 1 | 1 | pass |
| C49 | `npx playwright test tests/e2e/site-product.spec.ts -g "PDP-01.7:"` | 1 | - | pass |
| C50 | `npx vitest run src/lib/domain/product-page.test.ts -t "PDP-01.8:"` | 1 | 1 | pass |
| C51 | `npx vitest run src/lib/domain/product-page.test.ts -t "PDP-01.9:"` | 1 | 1 | pass |
| C52 | `npx playwright test tests/e2e/site-product.spec.ts -g "PDP-01.10:"` | 1 | - | pass |
| C53 | `npx playwright test tests/e2e/site-product.spec.ts -g "PDP-01.11:"` | 1 | - | pass |
| C54 | `npx vitest run src/lib/domain/product-page.test.ts -t "PDP-01.12:"` | 1 | 1 | pass |
| C55 | `npx playwright test tests/e2e/site-product.spec.ts -g "PDP-01.13:"` | 1 | - | pass |
| C56 | `npx vitest run src/components/site/PurchaseBox.test.tsx -t "PDP-01.14:"` | 1 | 1 | pass |
| C57 | `npx playwright test tests/e2e/site-footer.spec.ts -g "PRIV-01.1:"` | 1 | - | pass |
| C58 | `npx playwright test tests/e2e/site-footer.spec.ts -g "PRIV-01.2:"` | 1 | - | pass |
| C59 | `npx playwright test tests/e2e/site-seo.spec.ts -g "SEO-01.1:"` | 1 | - | pass |
| C60 | `npx playwright test tests/e2e/site-seo.spec.ts -g "SEO-01.2:"` | 1 | - | pass |
| C61 | `npx playwright test tests/e2e/site-seo.spec.ts -g "SEO-01.3:"` | 1 | - | pass |
| Build | `npm run build:local` | - | - | pass |
| Build | `npm run typecheck` | - | - | pass |
| Build | `npm run lint` | - | - | pass |
