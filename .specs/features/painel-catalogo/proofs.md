# painel-catalogo proofs

**HEAD**: 794efb9
**Tree**: clean
**Result**: 60 pass, 1 fail; mutations 3 killed, 0 not

| Check | Proof | Ran | Passed | Result |
| --- | --- | --- | --- | --- |
| C1 | `npx playwright test tests/e2e/auth.spec.ts -g "AUTH-01.1:"` | 1 | - | pass |
| C2 | `npx playwright test tests/e2e/auth.spec.ts -g "AUTH-01.2:"` | 1 | - | pass |
| C3 | `npx playwright test tests/e2e/auth.spec.ts -g "AUTH-01.3:"` | 1 | - | pass |
| C4 | `npx playwright test tests/e2e/auth.spec.ts -g "AUTH-01.4:"` | 1 | - | pass |
| C5 | `npx playwright test tests/e2e/password.spec.ts -g "AUTH-01.5:"` | 1 | - | pass |
| C6 | `npx playwright test tests/e2e/password.spec.ts -g "AUTH-01.6:"` | 1 | - | pass |
| C7 | `npx playwright test tests/e2e/shell.spec.ts -g "AUTH-01.7:"` | 1 | - | pass |
| C8 | `npx vitest run tests/db/rls.test.ts -t "AUTH-01.8:"` | 15 | 15 | pass |
| C9 | `browser captures/admin-produtos.running.png` | - | - | pass |
| C10 | `npx playwright test tests/e2e/products.spec.ts -g "PLIST-01.2:"` | 1 | - | pass |
| C11 | `npx vitest run src/lib/domain/admin-products.test.ts -t "PLIST-01.3:"` | 1 | 1 | pass |
| C12 | `npx vitest run src/lib/domain/admin-products.test.ts -t "PLIST-01.4:"` | 1 | 1 | pass |
| C13 | `npx vitest run src/lib/domain/admin-products.test.ts -t "PLIST-01.5:"` | 1 | 1 | pass |
| C14 | `npx vitest run src/lib/domain/admin-products.test.ts -t "PLIST-01.6:"` | 1 | 1 | pass |
| C15 | `npx vitest run src/lib/domain/admin-products.test.ts -t "PLIST-01.7:"` | 1 | 1 | pass |
| C16 | `npx vitest run src/lib/domain/admin-products.test.ts -t "PLIST-01.8:"` | 1 | 1 | pass |
| C17 | `npx playwright test tests/e2e/products.spec.ts -g "PLIST-01.9:"` | 1 | - | pass |
| C18 | `npx playwright test tests/e2e/products.spec.ts -g "PLIST-01.10:"` | 1 | - | pass |
| C19 | `npx playwright test tests/e2e/products.spec.ts -g "PLIST-01.11:"` | 1 | - | pass |
| C20 | `npx playwright test tests/e2e/products.spec.ts -g "PLIST-01.12:"` | 1 | - | pass |
| C21 | `npx playwright test tests/e2e/products.spec.ts -g "PLIST-01.13:"` | 1 | - | pass |
| C22 | `npx playwright test tests/e2e/shell.spec.ts -g "PLIST-01.14:"` | 1 | - | pass |
| C23 | `npx vitest run src/lib/domain/admin-products.test.ts -t "PLIST-01.15:"` | 1 | 1 | pass |
| C24 | `npx playwright test tests/e2e/products.spec.ts -g "PLIST-01.16:"` | 1 | - | pass |
| C25 | `npx playwright test tests/e2e/toggles.spec.ts -g "PTOG-01.1:"` | 1 | - | pass |
| C26 | `npx playwright test tests/e2e/toggles.spec.ts -g "PTOG-01.2:"` | 1 | - | pass |
| C27 | `npx playwright test tests/e2e/toggles.spec.ts -g "PTOG-01.3:"` | 1 | - | pass |
| C28 | `npx vitest run src/components/admin/RowToggle.test.tsx -t "PTOG-01.4:"` | 2 | 2 | pass |
| C29 | `browser captures/admin-cadastro.running.png` | - | - | **diverges** (screens.md) |
| C30 | `npx playwright test tests/e2e/product-form.spec.ts -g "PFORM-01.2:"` | 1 | - | pass |
| C31 | `npx vitest run src/components/admin/product-form/ProductForm.test.tsx -t "PFORM-01.3:"` | 1 | 1 | pass |
| C32 | `npx vitest run src/components/admin/product-form/ProductForm.test.tsx -t "PFORM-01.4:"` | 1 | 1 | pass |
| C33 | `npx vitest run src/components/admin/product-form/ProductForm.test.tsx -t "PFORM-01.5:"` | 1 | 1 | pass |
| C34 | `npx playwright test tests/e2e/product-form.spec.ts -g "PFORM-01.6:"` | 1 | - | pass |
| C35 | `npx vitest run src/components/admin/product-form/PhotoUploader.test.tsx -t "PFORM-01.7:"` | 1 | 1 | pass |
| C36 | `npx vitest run src/components/admin/product-form/PhotoUploader.test.tsx -t "PFORM-01.8:"` | 1 | 1 | pass |
| C37 | `npx vitest run src/components/admin/product-form/PhotoUploader.test.tsx -t "PFORM-01.9:"` | 1 | 1 | pass |
| C38 | `npx vitest run src/components/admin/product-form/PhotoUploader.test.tsx -t "PFORM-01.10:"` | 2 | 2 | pass |
| C39 | `npx vitest run src/components/admin/product-form/PhotoUploader.test.tsx -t "PFORM-01.11:"` | 1 | 1 | pass |
| C40 | `npx vitest run src/components/admin/product-form/VariantPicker.test.tsx -t "PFORM-01.12:"` | 1 | 1 | pass |
| C41 | `npx vitest run src/components/admin/product-form/ProductForm.test.tsx -t "PFORM-01.13:"` | 1 | 1 | pass |
| C42 | `npx playwright test tests/e2e/product-form.spec.ts -g "PFORM-01.14:"` | 1 | - | pass |
| C43 | `npx playwright test tests/e2e/product-form.spec.ts -g "PFORM-01.15:"` | 1 | - | pass |
| C44 | `npx vitest run src/components/admin/product-form/ProductForm.test.tsx -t "PFORM-01.16:"` | 1 | 1 | pass |
| C45 | `npx vitest run tests/db/functions.test.ts -t "PFORM-01.17:"` | 1 | 1 | pass |
| C46 | `npx vitest run src/components/admin/product-form/ProductForm.test.tsx -t "PFORM-01.18:"` | 1 | 1 | pass |
| C47 | `npx playwright test tests/e2e/product-form.spec.ts -g "PFORM-01.19:"` | 1 | - | pass |
| C48 | `npx playwright test tests/e2e/duplicate.spec.ts -g "PDUP-01.1:"` | 1 | - | pass |
| C49 | `npx playwright test tests/e2e/duplicate.spec.ts -g "PDUP-01.2:"` | 1 | - | pass |
| C50 | `npx playwright test tests/e2e/categories.spec.ts -g "TAX-01.1:"` | 1 | - | pass |
| C51 | `npx playwright test tests/e2e/categories.spec.ts -g "TAX-01.2:"` | 1 | - | pass |
| C52 | `npx playwright test tests/e2e/categories.spec.ts -g "TAX-01.3:"` | 1 | - | pass |
| C53 | `npx playwright test tests/e2e/categories.spec.ts -g "TAX-01.4:"` | 1 | - | pass |
| C54 | `npx playwright test tests/e2e/brands.spec.ts -g "TAX-01.5:"` | 1 | - | pass |
| C55 | `npx playwright test tests/e2e/brands.spec.ts -g "TAX-01.6:"` | 1 | - | pass |
| C56 | `npx playwright test tests/e2e/brands.spec.ts -g "TAX-01.7:"` | 1 | - | pass |
| C57 | `npx playwright test tests/e2e/product-form.spec.ts -g "TAX-01.8:"` | 1 | - | pass |
| C58 | `npx playwright test tests/e2e/categories.spec.ts -g "TAX-01.9:"` | 1 | - | pass |
| Build | `npm run build` | - | - | pass |
| Build | `npm run typecheck` | - | - | pass |
| Build | `npm run lint` | - | - | pass |

## Mutations

| Mutation | Location | Killed |
| --- | --- | --- |
| is_admin também aceita user_metadata.role (editável pelo próprio usuário) | `supabase/migrations/20261028000200_rls.sql:8` | yes |
| preço promocional igual ao preço passa a ser aceito (>= -> >) | `src/lib/domain/product-input.ts:87` | yes |
| falha volta o interruptor ao valor inicial da página, não à posição anterior | `src/components/admin/RowToggle.tsx:30` | yes |
