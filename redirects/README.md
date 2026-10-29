# URLs do site antigo

`legacy-urls.json` leva cada endereço do WordPress (faclubrificantes.com.br) para a página nova
equivalente, com 301 (feature lancamento, REDIR-01). A lista veio do `wp-sitemap.xml` do site antigo,
lido em 2026-10-28. Antes de trocar o DNS, confira o relatório de páginas do Google Search Console e
acrescente aqui o que faltar; o teste `src/lib/domain/legacy-redirects.test.ts` e o e2e
`tests/e2e/redirects.spec.ts` conferem cada par.
