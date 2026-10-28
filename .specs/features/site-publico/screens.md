# Site público screens

**Verifier**: independent sub-agent (author != verifier)
**Round**: 2

Fotos tiradas por este sub-agente em 2026-10-28, como diz o `**Walked:**`: `npm run build:local`, `E2E_SKIP_BUILD=1 node scripts/local-supabase/start.mjs --app`, `node scripts/local-supabase/seed.mjs --site`, `POST /api/revalidar`, Chromium do Playwright com a janela no tamanho de cada captura (1x), página rolada até o fim e de volta ao topo, 1 s de espera e foto só da janela (sem fullPage). O iframe do Google Maps não carrega neste ambiente (o proxy recusa `www.google.com`), então o mapa fica no estado "Carregando o mapa...".

Rodada 2, por outro sub-agente independente, em 2026-10-28: as três fotos tiradas de novo do mesmo jeito (build, `start.mjs --app`, seed `--site`, `POST /api/revalidar`, janela no tamanho da captura, 1x, rolagem até o fim e volta, 1 s, foto só da janela). Só as linhas que estavam `differs` foram reabertas; as `same` ficaram como estavam e nada foi acrescentado aos inventários. As linhas cobertas por AD-015 em `## Differences from the source` contam como aprovadas.

| Screen | Compared with | Verdict | Finding |
| --- | --- | --- | --- |
| `captures/home.running.png` | `captures/home.png` | diverges | rodada 2: 1 linha difere: os cards de serviço continuam sem foto. Altura dos cards "Por que a FAC LUB", "Entrar no grupo de ofertas" e rodapé agora iguais; frase do cupom aprovada (AD-015) |
| `captures/catalogo.running.png` | `captures/catalogo.png` | matches | rodada 2: "Carregar mais" ausente com 12 produtos é diferença aprovada (AD-015) |
| `captures/produto.running.png` | `captures/produto.png` | matches | rodada 2: o rodapé aparece inteiro na janela |

### `captures/home.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| arrangement: topo e banner num card escuro arredondado com margem, depois faixa, marcas, serviços, por que, destaques, cupom, contato e rodapé, nessa ordem | same | mesma ordem; o rodapé está abaixo da janela (ver última linha) |
| topo: logo + "FAC LUB" à esquerda | same | logo carregado (na captura a imagem está quebrada) |
| topo: links "Serviços", "Produtos", "Contato" no centro, nenhum em negrito | same | |
| topo: botão branco "Agendar troca" à direita | same | sacola do carrinho à esquerda dele: diferença aprovada (AD-005) |
| banner: foto de fundo ocupando o card | same | foto de oficina sob véu escuro (conteúdo da foto não conta) |
| banner: título "Troca de óleo e filtros com quem entende do assunto" em 3 linhas, centralizado | same | |
| banner: texto "Óleos das principais marcas para carro, utilitário e linha pesada. / Rápido, sem enrolação e com o registro da sua próxima troca." em 2 linhas | same | |
| banner: botões "Agendar pelo WhatsApp" (escuro) e "Ver produtos" (contorno) lado a lado | same | |
| faixa: 4 blocos numa linha, no pé do card escuro: "Seg a Sex / 7h às 18h", "Sábado / 8h às 13h", "Endereço / R. Cabo Antônio Alves, 50" (cinza claro) e "Cupom de desconto / 10% OFF · FACLUB10" (amarelo) | same | |
| marcas: título "Trabalhamos com as marcas que mais rodam no Brasil" em 2 linhas e subtítulo "Lubrificantes originais, com procedência, para cada tipo de motor." | same | nota: a seção fica ~30 px mais alta |
| marcas: 6 nomes em cinza numa linha centralizada | same | nota: mesmos 6 nomes em ordem alfabética (Brutus, Lubrax, Mobil, Shell, Texaco, Urania); a captura usa Mobil, Shell, Texaco, Lubrax, Urania, Brutus. O spec (HOME-01 AC4) não fixa a ordem |
| serviços: título "Nossos serviços", subtítulo "Do carro do dia a dia ao caminhão, cada serviço com o produto certo." e botão escuro "Pedir orçamento" | same | |
| serviços: grade 3×2 de cards escuros arredondados (~389×340) com título e texto no pé: "Troca de óleo de motor", "Óleo de câmbio", "Filtros", "Linha pesada", "Aditivos, graxas e direção", "Lubrificante industrial", com os textos da captura | same | |
| serviços: uma foto ocupando cada card (na captura, imagens com alt "Troca de óleo", "Óleo de câmbio", "Filtros", "Linha pesada", "Aditivos e graxas", "Lubrificante industrial") | differs | rodada 2: continua sem foto em nenhum dos 6 cards: só o gradiente escuro de cima para baixo, sem elemento de imagem e sem as alts da captura (o spec, Assumptions, pede fotos de banco nas seções de serviços; nenhuma linha de `## Differences from the source` cobre a ausência) |
| por que: título "Por que a FAC LUB" e subtítulo "Um atendimento pensado para quem não pode ficar parado." | same | |
| por que: 3 cards claros; esquerda e direita com texto em cima e foto embaixo, meio com foto em cima e texto embaixo; textos "Atendimento ágil", "O óleo certo para o seu motor", "Próxima troca registrada" e seus parágrafos | same | |
| por que: tamanho dos cards (~389×360) e das fotos (~240 px de altura) | same | rodada 2: cards de ~389×378 e fotos de 389×240 nos três cards (esquerda e direita embaixo, meio em cima); nota: ~18 px mais altos que a captura |
| destaques: título "Produtos em destaque", subtítulo "Pronta entrega na loja. Peça pelo WhatsApp e retire ou faça a troca aqui." e botão "Ver todos" | same | |
| destaques: 4 cards numa linha, foto arredondada (~288×300) com selo "Oferta", embaixo "marca · embalagem" à esquerda e preço à direita, e o nome; Super 5W-30 Sintético, Top Turbo 15W-40, Rimula R4 15W-40, Filtro de óleo | same | nota: imagem neutra de embalagem; selo "Oferta" também no Top Turbo (em oferta nos dados) e o preço normal riscado sob o preço; "[MARCA]" e "[PREÇO]" viram Mobil e R$ 34,90 etc. |
| cupom: seção escura de largura total com foto de fundo e card branco centralizado | same | |
| cupom: título "10% de desconto na sua troca" em 2 linhas | same | |
| cupom: texto "Mostre o cupom no atendimento e entre no grupo para receber as ofertas da semana." (só essa frase) | same | rodada 2: a frase e, abaixo dela, a linha menor "O desconto vale só para serviços feitos na loja.": diferença aprovada (AD-015, CUPOM-01 AC 3) |
| cupom: campo tracejado amarelo claro com "FACLUB10" e botão escuro "Copiar" | same | |
| cupom: botão de contorno "Entrar no grupo de ofertas" de largura total | same | rodada 2: o botão de contorno "Entrar no grupo de ofertas" de largura total aparece abaixo do campo do cupom |
| contato: título "Passa aqui na FAC LUB" em 2 linhas à esquerda; grade 2×2 com "Endereço" (Rua Cabo Antônio Alves, 50 / Parque Novo Mundo, São Paulo), "Horário" (Seg a Sex, 7h às 18h / Sábado, 8h às 13h), "Telefone" ((11) 2954-5764), "E-mail" (contato@faclubrificantes.com.br, sublinhado) | same | |
| contato: botão escuro "Chamar no WhatsApp" | same | |
| contato: mapa à direita num painel cinza arredondado (~658×420) com pino ao centro | same | nota: legenda "Carregando o mapa..." no lugar de "[Mapa do Google incorporado]" porque o Google não é acessível neste ambiente |
| rodapé: linha divisória, logo + "© 2026 FAC Lubrificantes" à esquerda e "Instagram", "Produtos", "Área administrativa" à direita, no pé da janela | same | rodada 2: o rodapé está na janela, com linha divisória, logo + "© 2026 FAC Lubrificantes" à esquerda e "Instagram", "Produtos", "Política de privacidade" (aprovado, AD-005) e "Área administrativa" à direita; nota: a página tem 5253 px, então os últimos 16 px do espaço abaixo do texto do rodapé ficam fora da janela |

### `captures/catalogo.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| topo branco com linha embaixo: logo + "FAC LUB", links "Serviços", "Produtos" (em negrito), "Contato", botão escuro "Agendar troca" | same | sacola do carrinho entre os links e "Agendar troca": diferença aprovada (AD-005) |
| título "Produtos" centralizado e subtítulo "Óleos, filtros e lubrificantes a pronta entrega. Escolha o produto e finalize pelo WhatsApp." em 2 linhas | same | |
| filtros: grupo cinza com chips "Todos" (ativo, escuro), "Linha leve", "Linha pesada", "Filtros", "Aditivos e graxas" à esquerda | same | |
| busca com lupa e placeholder "Marca, viscosidade, aplicação" e select "Destaques" à direita, na mesma linha dos chips | same | |
| contador "12 produtos" acima da grade | same | |
| grade de 4 colunas × 3 linhas, 12 cards | same | |
| card: foto arredondada com selo "Oferta" no canto, "marca · embalagem", nome e preço à esquerda e botão redondo escuro "+" à direita | same | nota: imagem neutra de embalagem; preço normal riscado ao lado do preço nas ofertas (CAT-01 AC13); a ordem dos cards e os selos seguem os dados na ordem "Destaques" (Top Turbo, Filtro de óleo, Super 5W-30, Rimula R4, Brutus, Graxa multiuso, Delvac, Filtro de ar, Helix HX8, Fluido de direção, Havoline, Urania), com "Oferta" em 4 cards |
| botão de contorno "Carregar mais" centralizado abaixo da grade | same | rodada 2: não há botão, só espaço branco até o rodapé, com 12 produtos: diferença aprovada (AD-015, CAT-01 AC 11) |
| rodapé: linha divisória, "© 2026 FAC Lubrificantes · Parque Novo Mundo, São Paulo" à esquerda e "Área administrativa" à direita | same | "Política de privacidade" antes de "Área administrativa": diferença aprovada (AD-005) |

### `captures/produto.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| topo branco com linha embaixo: logo + "FAC LUB", "Produtos" em negrito, botão escuro "Agendar troca" | same | sacola do carrinho: diferença aprovada (AD-005) |
| trilha "Home / Produtos / Lubrax Top Turbo 15W-40" | same | |
| arrangement: galeria à esquerda (~686 px), informações à direita | same | |
| galeria: foto grande arredondada (~686×600) com selo amarelo "Oferta da semana" | same | imagem neutra de embalagem |
| galeria: 4 miniaturas numa linha, a primeira com borda escura | same | |
| informações: "Lubrax · Linha pesada" e título "Top Turbo 15W-40" | same | |
| descrição "Lubrificante para motores diesel de caminhões, ônibus e máquinas." | same | sem o marcador "[DESCRIÇÃO DO FABRICANTE]", em uma linha |
| preço grande e "à vista · balde 20L" ao lado | same | nota: "R$ 349,90" e o normal riscado "R$ 389,90" entre os dois (PDP-01 AC7) |
| "Embalagem" com chips "Frasco 1L", "Frasco 4L", "Balde 20L" (selecionado, escuro) | same | |
| quantidade numa pílula com "−", "1", "+" | same | |
| botão principal escuro ao lado da quantidade, "Pedir pelo WhatsApp" | same | "Adicionar ao carrinho": diferença aprovada (AD-004) |
| bloco bege do cupom: "FACLUB10" e "10% de desconto na troca feita na loja." | same | |
| ficha técnica: 6 linhas com divisórias, rótulo à esquerda e valor à direita: Viscosidade 15W-40, Tipo Mineral, Especificação API, Aplicação Motores diesel, Código, Disponibilidade Pronta entrega | same | "[API]" e "[SKU]" viram "API CI-4" e "LUB-TT-20" |
| "Combine com" título centralizado | same | |
| "Combine com": 4 cards numa linha com foto arredondada, marca, nome e preço, sem botão "+" | same | nota: os produtos vêm dos dados (Super 5W-30 Sintético, Filtro de óleo, Helix HX8 5W-30, Havoline 10W-40), 2 com selo "Oferta" e preço riscado; a seção fica ~20 px mais baixa |
| rodapé: linha divisória, "© 2026 FAC Lubrificantes · Parque Novo Mundo, São Paulo" à esquerda e "Área administrativa" à direita, inteiro na janela | same | rodada 2: o rodapé aparece inteiro, com linha divisória, "© 2026 FAC Lubrificantes · Parque Novo Mundo, São Paulo" à esquerda e "Política de privacidade" (aprovado, AD-005) e "Área administrativa" à direita; nota: a página tem 1673 px, só os últimos 7 px de espaço abaixo do texto ficam fora da janela |
