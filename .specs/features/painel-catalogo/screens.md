# Painel: login e catálogo screens

**Verifier**: independent sub-agent (author != verifier)
**Round**: 2

| Screen | Compared with | Verdict | Finding |
| --- | --- | --- | --- |
| `captures/admin-produtos.running.png` | `captures/admin-produtos.png` | matches | 0 linhas diferem (Oferta em interruptor, item Pedidos e cartão "Pedidos · 30 dias" são AD-006, AD-007 e AD-008) |
| `captures/admin-cadastro.running.png` | `captures/admin-cadastro.png` | matches | 0 linhas diferem na rodada 2 (ícones e bloco do usuário são AD-014; chips "Unidade" e "Outra" são AD-013) |

Rodada 2: só `captures/admin-cadastro.running.png` foi tirada de novo, por um novo verificador, e só as 6 linhas que deram `differs` na rodada 1 foram reabertas. App de `scripts/local-supabase/start.mjs --app` com build novo (sem `E2E_SKIP_BUILD`, sem injetar variáveis no navegador) e `seed.mjs`, Playwright/Chromium a 1440×1446, login `contato@onbind.com.br`, estado da linha `**Walked:**` (duas fotos JPEG 3024×4032 enviadas sem "Enviando…" nem "Falhou", mouse fora das fotos). A página tem 1515 px de altura.

Rodada 1 — fotos tiradas por este verificador: app de `scripts/local-supabase/start.mjs --app` (com `E2E_SKIP_BUILD=1`, build já existente) e `seed.mjs`, Playwright/Chromium com janela de 1440×1033 (lista) e 1440×1446 (cadastro), login `contato@onbind.com.br`, estados alcançados como diz a linha `**Walked:**`. A página de cadastro tem 1544 px de altura, por isso a foto de página inteira passa dos 1446 px da janela.

Nota de ambiente (não é linha do inventário): o build em `.next` usado aqui não tem `NEXT_PUBLIC_SUPABASE_URL` nem `NEXT_PUBLIC_SUPABASE_ANON_KEY` embutidos no bundle do navegador (o chunk lê `process.env.NEXT_PUBLIC_SUPABASE_URL` em tempo de execução, e no navegador ele fica vazio). Com esse build as duas fotos caem em "Falhou · tentar de novo". Para chegar ao estado da captura, o script do verificador injetou `window.process.env` com as variáveis `NEXT_PUBLIC_*` de `scripts/local-supabase/config.mjs` antes de carregar a página; aí o envio ao Storage local respondeu 200 nas duas fotos. Um build feito pelo `start.mjs` sem `E2E_SKIP_BUILD` embute as variáveis; vale conferir que o deploy as define em tempo de build.

### `captures/admin-produtos.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| menu lateral: fundo azul-marinho em coluna fixa à esquerda, de cima a baixo | same | |
| marca do menu: logo + "FAC LUB" e "Painel" em dourado | same | nota: a captura desenha o logo quebrado (texto alternativo "FAC LUB"); a foto desenha a imagem do logo redonda |
| itens do menu com ícone: Visão geral, Produtos, Categorias, Marcas, Banners e ofertas, Cupons, Configurações | same | "Pedidos" entre Produtos e Categorias, com ícone (AD-007) |
| item ativo "Produtos": fundo escuro arredondado, texto e ícone dourados | same | |
| rodapé do menu: avatar dourado com inicial, nome do usuário e "Sair" num bloco arredondado | same | nota: "[Administrador]" é dado de exemplo; a foto mostra o e-mail "contato@onbind.co…" cortado com reticências e avatar "C" |
| cabeçalho: sobretítulo "Catálogo" e título "Produtos" à esquerda | same | |
| botões do cabeçalho à direita: "Ver no site" (contorno) e "+ Novo produto" (escuro, texto dourado) | same | nota: botões ~10 px mais baixos que na captura |
| fila de 4 cartões de indicadores com mesma largura | same | |
| cartão "Produtos ativos" com valor 7 | same | |
| cartão "Em oferta" com valor 3 | same | |
| cartão "Estoque baixo" com valor 2 em laranja-escuro | same | |
| 4º cartão escuro com rótulo claro e valor dourado | same | rótulo "Pedidos · 30 dias" e valor 0 (AD-008); "[—]" da captura é marcador |
| painel da tabela: cartão branco com borda arredondada | same | |
| abas segmentadas "Todos", "Visíveis", "Ocultos" com "Todos" ativa (fundo branco) à esquerda | same | |
| campo de busca "Buscar produto ou SKU" e seletor "Todas as categorias" à direita | same | |
| cabeçalho da tabela em maiúsculas: PRODUTO, CATEGORIA, PREÇO, ESTOQUE, OFERTA, VISÍVEL NO SITE, AÇÕES (à direita) | same | nota: "VISÍVEL NO SITE" cabe em uma linha na foto (duas na captura); colunas deslocadas alguns px |
| célula Produto: miniatura azul-marinho com ícone dourado, nome em negrito, linha "embalagem · SKU" em cinza | same | nota: "SKU [—]" é marcador; a foto mostra "SKU —" |
| 8 linhas na ordem: Mobil Super 5W-30 Sintético, Shell Helix HX8 5W-30, Texaco Havoline 10W-40, Lubrax Top Turbo 15W-40, Shell Rimula R4 15W-40, Urania 15W-40, Brutus 15W-40, Filtro de óleo | same | nota: "[MARCA] Filtro de óleo" é marcador; a foto mostra "Mobil Filtro de óleo" |
| embalagens: Frasco 1L (3 primeiras), Balde 20L (4 seguintes), Unidade (filtro) | same | |
| coluna Categoria: Linha leve ×3, Linha pesada ×4, Filtros | same | |
| coluna Preço | same | nota: "[PREÇO]" é marcador; a foto mostra R$ 54,90, 52,90, 34,90, 389,90, 459,90, 399,90, 329,90, 39,90 |
| coluna Estoque: 48 un., 32 un., selo "Baixo · 4", 12 un., 9 un., selo "Baixo · 3", 15 un., 60 un. | same | |
| coluna Oferta: selo "Em oferta" em Mobil, Lubrax e Brutus; "—" nas demais | same | interruptor por linha, ligado em Mobil, Lubrax e Brutus e desligado nas demais (AD-006) |
| coluna Visível no site: interruptor verde ligado em 7 linhas, cinza desligado no filtro | same | |
| coluna Ações: botão "Editar" com contorno em cada linha | same | nota: botões encostados na borda direita, alinhados ao cabeçalho "AÇÕES" |
| linhas separadas por traço fino | same | |
| rodapé da tabela: "8 de 8 produtos" à esquerda e "Página 1 de 1" à direita | same | |

### `captures/admin-cadastro.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| menu lateral azul-marinho com logo, "FAC LUB" e "Painel" | same | nota: logo desenhado como imagem (a captura mostra o logo quebrado) |
| itens do menu só com texto, sem ícone: Visão geral, Produtos (ativo, dourado), Categorias, Marcas, Banners e ofertas, Cupons, Configurações | same | cada item tem ícone à esquerda (AD-014) e "Pedidos" abaixo de Produtos (AD-007); Produtos ativo em dourado |
| menu sem bloco de usuário no rodapé | same | bloco no rodapé com avatar "C", e-mail "contato@onbind.co…" e "Sair" (AD-014) |
| trilha "Produtos / Novo produto" com "Produtos" sublinhado | same | |
| título "Cadastrar produto" | same | |
| botões "Cancelar" (contorno) e "Salvar produto" (escuro, texto dourado) à direita | same | nota: ~10 px mais baixos |
| duas colunas: seções do formulário à esquerda (larga), Publicação e Prévia à direita (estreita) | same | nota: a página fica com 1544 px de altura por causa das linhas extras abaixo |
| seção "Informações básicas": "Nome do produto" com "Top Turbo 15W-40" | same | |
| "Marca" (Lubrax) e "Categoria" (Linha pesada) lado a lado em seletores | same | |
| nada entre os seletores e "Descrição" | same | nada entre os seletores e "Descrição"; "+ Nova marca" passou a ser uma opção dentro do seletor Marca, fora da vista |
| "Descrição": área de texto com "Para que serve, em qual motor usar, diferenciais..." | same | |
| seção "Fotos": área tracejada com ícone de envio, "**Arraste as fotos** ou clique para enviar" e "JPG ou PNG, fundo claro de preferência" | same | nota: o texto quebra em quatro linhas ("ou clique para / enviar") |
| duas miniaturas de foto ao lado da área de envio, a primeira com selo dourado "Capa" | same | nota: as fotos são as imagens de teste enviadas |
| miniaturas sem botões | same | as duas miniaturas sem botões, só o selo "Capa" na primeira (com o mouse fora das fotos) |
| seção "Preço e estoque": linha Preço (R$) "0,00", Preço promocional (R$) "Opcional", Estoque "12" | same | Estoque "12" e "SKU / código" lado a lado; Preço (R$) "0,00" e Preço promocional (R$) "Opcional" num quadro "Balde 20L" abaixo das embalagens (AD-003) |
| "SKU / código" com "Ex.: LBX-1540-20" | same | nota: ao lado do Estoque, não sozinho na linha de baixo (consequência de AD-003) |
| "Embalagens disponíveis": chips Frasco 1L, Frasco 4L, Balde 20L (escuro com ✓ e texto dourado), Tambor 200L | same | |
| só quatro chips de embalagem | same | mais dois chips, "Unidade" e "Outra" (contorno tracejado), aprovados em AD-013 |
| seção "Ficha técnica": Viscosidade "15W-40", Tipo "Mineral" (seletor), Especificação API "Ex.: CI-4" em três colunas | same | |
| "Aplicação" com "Motores diesel" abaixo, em um terço da largura | same | |
| cartão "Publicação" com título e traço fino abaixo do título | same | traço fino entre o título "Publicação" e "Visível no site", e entre as linhas |
| "Visível no site" / "Aparece no catálogo" com interruptor ligado | same | |
| "Em oferta" / "Selo de oferta e preço promocional" com interruptor ligado | same | |
| "Destaque na home" / "Entra na vitrine da página inicial" com interruptor desligado | same | |
| cartão escuro "Prévia no site" abaixo da Publicação | same | |
| card da prévia: área da foto com selo dourado "Oferta" no canto, depois "Lubrax", "Top Turbo 15W-40", "Balde 20L" e preço dourado | same | nota: a área da foto mostra a capa enviada; o preço aparece como "R$ —" porque nenhum preço foi digitado ("[PREÇO]" é marcador) |
