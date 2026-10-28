# Painel: banners, cupom e configurações verification

**Verdict**: FAIL
**Mutations**: 3 - probed C3, C18, C10
**Proofs**: `proofs.md` at 4a8c39b
**Verifier**: independent sub-agent (author != verifier)

## Findings

| Finding | Evidence | Fix | Closed |
| --- | --- | --- | --- |
| C3 prova "Campo obrigatório" só com foto e título faltando juntos; título vazio com foto presente pode passar e nenhum teste falha | mutação `!v.title.trim()` -> `!v.title.trim() && !v.imagePath` não morta por `banner-input.test.ts -t "BAN-01.3:"` (o caso único está em `banner-input.test.ts:20`) | em BAN-01.3 assertar também só sem título (com foto) e só sem foto (com título), cada um com o erro só no seu campo | |
| C18 não fixa a codificação da mensagem do WhatsApp: com `encodeURI` um `?`, `&` ou `#` digitado pela loja corta o texto no link e o teste fica verde | mutação `encodeURIComponent` -> `encodeURI` não morta por `settings-input.test.ts -t "CONF-01.6:"`; a mensagem do teste (`settings-input.test.ts:57`) só tem acento, `!` e espaço | assertar `whatsappLink("1129545764", "Pode agendar? Óleo & filtro #1")` com `%3F`, `%26` e `%23` | |
| Link de banner que começa com `/` mas tem espaço é recusado com a mensagem "Use um link do site (começando com /)...", contra BAN-01 AC 4 | exemplo próprio: `validateBanner({... link: "/produtos?busca=oleo 5w30"})` -> `{ ok: false, errors: { link: BANNER_LINK_MESSAGE } }` (`banner-input.ts:27`, `\S*`) | aceitar o que começa com `/` (exceto `//`), `https://` ou `http://`, ou codificar os espaços; teste com o caso | |
| WhatsApp com letras é aceito: "tel 11 2954-5764" grava `1129545764`, mas CONF-01 AC 3 só remove espaços, parênteses e hífens antes de contar | exemplo próprio: `validateSettings({... whatsapp: "tel 11 2954-5764"})` -> `ok: true` (`settings-input.ts:63`, `onlyDigits` tira tudo que não é dígito) | remover só espaços, `(`, `)` e `-` e recusar o que sobrar que não for dígito; teste com letras e com pontos | |
| C3 diz "e nada grava", mas a prova é uma função pura que não toca o banco; a matriz põe o efeito gravado das Server Actions no e2e | `tasks.md` C3 -> `banner-input.test.ts -t "BAN-01.3:"`; o e2e que confere o banco vazio (`banners.spec.ts`, "salvar sem foto e sem título...") não tem o prefixo `BAN-01.3:` e nenhuma check o nomeia | dar o prefixo `BAN-01.3:` ao e2e e apontar C3 também para ele (ou tirar "nada grava" da check) | |
