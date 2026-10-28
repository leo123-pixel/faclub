# carrinho-pedidos proofs

**HEAD**: 5ba17a5
**Tree**: clean
**Result**: 33 pass, 0 fail; mutations 0 killed, 0 not

| Check | Proof | Ran | Passed | Result |
| --- | --- | --- | --- | --- |
| C1 | `npx playwright test tests/e2e/cart.spec.ts -g "CART-01.1:"` | 1 | - | pass |
| C2 | `npx playwright test tests/e2e/cart.spec.ts -g "CART-01.2:"` | 1 | - | pass |
| C3 | `npx vitest run src/lib/domain/cart.test.ts -t "CART-01.3:"` | 1 | 1 | pass |
| C4 | `npx playwright test tests/e2e/cart.spec.ts -g "CART-01.4:"` | 1 | - | pass |
| C5 | `npx playwright test tests/e2e/cart.spec.ts -g "CART-01.5:"` | 1 | - | pass |
| C6 | `npx playwright test tests/e2e/cart.spec.ts -g "CART-01.6:"` | 1 | - | pass |
| C7 | `npx playwright test tests/e2e/cart.spec.ts -g "CART-01.7:"` | 1 | - | pass |
| C8 | `npx vitest run src/lib/domain/cart.test.ts -t "CART-01.8:"` | 1 | 1 | pass |
| C9 | `npx playwright test tests/e2e/cart.spec.ts -g "CART-01.9:"` | 1 | - | pass |
| C10 | `npx vitest run src/components/site/CartProvider.test.tsx -t "CART-01.10:"` | 1 | 1 | pass |
| C11 | `npx playwright test tests/e2e/cart.spec.ts -g "CART-01.11:"` | 1 | - | pass |
| C12 | `npx playwright test tests/e2e/cart.spec.ts -g "CART-04.1:"` | 1 | - | pass |
| C13 | `npx vitest run src/lib/domain/order.test.ts -t "CART-04.2:"` | 1 | 1 | pass |
| C14 | `npx vitest run src/lib/domain/order.test.ts -t "CART-04.3:"` | 1 | 1 | pass |
| C15 | `npx playwright test tests/e2e/cart-send.spec.ts -g "CART-04.4:"` | 1 | - | pass |
| C16 | `npx vitest run src/lib/domain/order.test.ts -t "CART-04.5:"` | 1 | 1 | pass |
| C17 | `npx playwright test tests/e2e/cart-send.spec.ts -g "CART-04.6:"` | 1 | - | pass |
| C18 | `npx playwright test tests/e2e/cart-send.spec.ts -g "CART-04.7:"` | 1 | - | pass |
| C19 | `npx playwright test tests/e2e/cart-send.spec.ts -g "CART-04.8:"` | 1 | - | pass |
| C20 | `npx playwright test tests/e2e/cart-api.spec.ts -g "CART-04.9:"` | 1 | - | pass |
| C21 | `npx playwright test tests/e2e/cart-send.spec.ts -g "CART-04.10:"` | 1 | - | pass |
| C22 | `npx playwright test tests/e2e/cart-send.spec.ts -g "CART-04.11:"` | 1 | - | pass |
| C23 | `npx playwright test tests/e2e/cart-send.spec.ts -g "CART-04.12:"` | 1 | - | pass |
| C24 | `npx playwright test tests/e2e/cart.spec.ts -g "CART-04.13:"` | 1 | - | pass |
| C25 | `npx playwright test tests/e2e/cart-send.spec.ts -g "CART-04.14:"` | 1 | - | pass |
| C26 | `npx playwright test tests/e2e/orders.spec.ts -g "ORD-01.1:"` | 1 | - | pass |
| C27 | `npx playwright test tests/e2e/orders.spec.ts -g "ORD-01.2:"` | 1 | - | pass |
| C28 | `npx playwright test tests/e2e/orders.spec.ts -g "ORD-01.3:"` | 1 | - | pass |
| C29 | `npx vitest run tests/db/rls.test.ts -t "ORD-01.4:"` | 1 | 1 | pass |
| C30 | `npx playwright test tests/e2e/orders.spec.ts -g "ORD-01.5:"` | 1 | - | pass |
| Build | `npm run build:local` | - | - | pass |
| Build | `npm run typecheck` | - | - | pass |
| Build | `npm run lint` | - | - | pass |
