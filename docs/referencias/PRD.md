# PRD · Novo site FAC LUB

Oct 27, 2026 · @Leonardo

## 1. Visão geral

O novo site da FAC LUB substitui o faclubrificantes.com.br por um site moderno com catálogo de produtos, carrinho que envia o pedido pelo WhatsApp e uma área administrativa para a loja cadastrar e atualizar produtos sozinha.

**Problema.** O site atual é um WordPress de 2016 com visual datado, sem catálogo e sem como a loja atualizar ofertas. Hoje as promoções vivem só no Instagram e no grupo de WhatsApp, e o site não ajuda a vender.

**Solução.** Um site em Next.js com Supabase, publicado na Vercel, com:

- Home com serviços, produtos em destaque e o cupom FACLUB10
- Catálogo com filtros por categoria e busca
- Página de produto com embalagens, quantidade e carrinho
- Pedido finalizado no WhatsApp com a lista de itens já escrita
- Painel admin para produtos, categorias, marcas, banners e cupons

**Referência visual:** protótipo aprovado no canvas [FAC LUB Novo Site](https://claude.ai/artifact/UfKmJxDi2n1q5wWqJjgVD4), linha Autohaus (godly.design): fundo claro, fotos grandes, títulos centralizados, cards arredondados.

## 2. Objetivos de negócio

O MVP entra no ar em até 30 dias e passa a gerar pedidos pelo WhatsApp a partir do catálogo. As metas numéricas abaixo são propostas e precisam da confirmação da loja.

| Objetivo | Meta | Prazo |
| --- | --- | --- |
| Lançar o MVP no domínio faclubrificantes.com.br | Site, catálogo, carrinho e admin no ar | 30 dias após o kickoff |
| Dar autonomia à loja | Produto novo publicado pela loja em menos de 5 minutos, sem a Onbind | No lançamento |
| Gerar pedidos pelo site | \[META\] pedidos por mês enviados pelo carrinho | 90 dias após o lançamento |
| Levar clientes para serviços na loja com o FACLUB10 | \[META\] usos do cupom vindos do site | 90 dias após o lançamento |
| Crescer o grupo de ofertas | \[META\] entradas no grupo vindas do site | 90 dias após o lançamento |

## 3. Público-alvo

Quatro perfis usam o site. Os três primeiros compram; o quarto opera o painel.

| Persona | Quem é | O que precisa no site | Como converte |
| --- | --- | --- | --- |
| Motorista do dia a dia | Roda muito na região (raio de 6 a 8 km), inclusive quem trabalha com aplicativo; decide pelo celular | Saber o horário, o endereço e agendar rápido; ver o cupom | Agenda a troca pelo WhatsApp e usa o FACLUB10 |
| Caminhoneiro e frotista | Dono ou gestor de caminhão e utilitário diesel | Ver se tem o óleo de linha pesada e o filtro certo | Pede balde de 20 L e troca na loja |
| Comprador de produto | Oficina, empresa ou cliente que só quer comprar o lubrificante | Catálogo com marca, viscosidade, embalagem e preço | Monta o carrinho e envia o pedido pelo WhatsApp |
| Administrador da loja | 1 ou 2 pessoas da FAC LUB, sem perfil técnico | Cadastrar produto, mudar preço, marcar oferta e ocultar item sem ajuda | Painel simples, funcionando no celular |

## 4. Escopo do MVP

O MVP cobre o site público, o carrinho com envio pelo WhatsApp e o painel de produtos. Pagamento online e conta de cliente ficam para a V2.

**Dentro do MVP**

- Home, Catálogo, Página do produto, Carrinho e páginas institucionais (Contato, Política de privacidade)
- Carrinho salvo no navegador, com envio do pedido pelo WhatsApp
- Painel admin: login, produtos, categorias, marcas, banners da Home, cupom e configurações da loja
- SEO básico, Google Analytics 4, Meta Pixel e redirecionamento das URLs antigas

**Fora do MVP (V2 ou depois)**

- Pagamento online (Pix e cartão) e cálculo de frete
- Conta de cliente, histórico de pedidos e lembrete automático da próxima troca
- Agendamento com horário marcado no site
- Controle de estoque automático com baixa por pedido
- Vários usuários com níveis de permissão no painel

## 5. User stories

As histórias marcadas como Must definem o que precisa estar pronto no lançamento.

**US01 · Agendar a troca (Must).** Como motorista, quero chamar a loja no WhatsApp em um toque para agendar a troca sem ligar.

- Botão "Agendar troca" fixo no topo e visível no celular sem rolar
- Abre o WhatsApp da loja com a mensagem "Olá! Quero agendar uma troca de óleo." já escrita

**US02 · Encontrar o produto (Must).** Como comprador, quero filtrar por categoria e buscar por marca ou viscosidade para achar o produto certo.

- Filtro por categoria muda a lista sem recarregar a página
- Busca encontra "15w40", "15W-40" e "lubrax" sem diferenciar maiúsculas, hífen ou acento
- Produto oculto no admin não aparece na lista nem na busca

**US03 · Montar o pedido (Must).** Como comprador, quero adicionar vários produtos ao carrinho e enviar tudo de uma vez pelo WhatsApp.

- Escolho embalagem e quantidade antes de adicionar
- O carrinho continua lá se eu fechar e voltar no mesmo navegador
- Ao enviar, o WhatsApp abre com nome, embalagem, quantidade e preço de cada item e o total estimado
- O pedido também fica registrado no painel

**US04 · Usar o cupom (Should).** Como cliente, quero copiar o FACLUB10 para ganhar 10% na troca feita na loja.

- Botão copia o código e confirma "Copiado"
- O texto deixa claro que o cupom vale só para serviços na loja, não para compra de produto

**US05 · Cadastrar produto (Must).** Como administrador, quero cadastrar um produto com fotos, preço e embalagens para ele aparecer no site.

- Campos obrigatórios: nome, marca, categoria, preço e ao menos uma foto
- Fotos enviadas do celular são reduzidas e convertidas automaticamente
- Ao salvar como visível, o produto aparece no site em até 1 minuto

**US06 · Atualizar oferta (Must).** Como administrador, quero mudar preço, marcar oferta e ocultar produto direto na lista.

- Interruptores de "Visível" e "Em oferta" na própria lista, sem abrir o produto
- Preço promocional aparece riscando o preço normal no site

**US07 · Ver pedidos (Should).** Como administrador, quero ver os pedidos enviados pelo site para acompanhar o que entrou.

- Lista com data, itens, total estimado e cupom
- Status manual: Novo, Atendido, Cancelado

**US08 · Trocar o banner (Should).** Como administrador, quero trocar a foto e o texto do topo da Home para divulgar a oferta da semana.

## 6. Requisitos funcionais

São 30 requisitos em 3 módulos; os 19 marcados Must entram no lançamento, 7 são Should e 4 são Could.

| ID | Módulo | Requisito | Prioridade |
| --- | --- | --- | --- |
| RF01 | Site | Home com banner editável, serviços, marcas, produtos em destaque, cupom e contato | Must |
| RF02 | Site | Catálogo com filtro por categoria, busca e ordenação (destaques, preço, A–Z) | Must |
| RF03 | Site | Busca tolerante a maiúsculas, acento e hífen (15W-40 = 15w40) | Must |
| RF04 | Site | Página do produto com galeria, embalagens, quantidade, ficha técnica e relacionados | Must |
| RF05 | Site | Selo "Oferta" e preço promocional riscando o normal | Must |
| RF06 | Site | Botão fixo de WhatsApp em todas as páginas com mensagem pré-escrita | Must |
| RF07 | Site | Copiar cupom com confirmação visual | Should |
| RF08 | Site | Link para o grupo de ofertas do WhatsApp | Should |
| RF09 | Site | Mapa do Google, endereço, horário e telefone vindos das configurações | Must |
| RF10 | Site | Página de Política de privacidade e aviso de cookies | Must |
| RF11 | Carrinho | Adicionar, alterar quantidade e remover itens; contador no topo | Must |
| RF12 | Carrinho | Carrinho salvo no navegador por 7 dias | Must |
| RF13 | Carrinho | Campos opcionais: nome, placa ou modelo do veículo | Should |
| RF14 | Carrinho | Enviar pedido: grava no banco e abre o WhatsApp com a lista formatada | Must |
| RF15 | Carrinho | Aviso de que preço e disponibilidade são confirmados no atendimento | Must |
| RF16 | Admin | Login por e-mail e senha, com recuperação de senha | Must |
| RF17 | Admin | Lista de produtos com busca, filtro por categoria e status | Must |
| RF18 | Admin | Interruptores de Visível e Em oferta direto na lista | Must |
| RF19 | Admin | Cadastro e edição de produto: nome, marca, categoria, descrição, fotos, preços, embalagens, ficha técnica, SKU | Must |
| RF20 | Admin | Upload de até 6 fotos com compressão e escolha da capa | Must |
| RF21 | Admin | Duplicar produto (para criar variações rápido) | Should |
| RF22 | Admin | Cadastro de categorias e marcas | Must |
| RF23 | Admin | Banner da Home: foto, título, texto e link | Should |
| RF24 | Admin | Cupom: código, percentual, texto e ativo ou inativo | Should |
| RF25 | Admin | Lista de pedidos com status manual | Should |
| RF26 | Admin | Configurações: WhatsApp, telefone, e-mail, endereço, horários, link do grupo, redes | Must |
| RF27 | Admin | Painel com produtos ativos, em oferta, pedidos do mês e cliques no WhatsApp | Could |
| RF28 | Admin | Estoque informativo com alerta de estoque baixo | Could |
| RF29 | Admin | Prévia do card do produto durante o cadastro | Could |
| RF30 | Admin | Importar produtos por planilha CSV | Could |

## 7. Modelo de dados

Nove tabelas no Supabase (Postgres) e um bucket de imagens cobrem o MVP.

| Tabela | Campos principais | Observação |
| --- | --- | --- |
| products | id, slug, name, brand\_id, category\_id, description, price, promo\_price, is\_visible, is\_promo, is\_featured, sku, specs (jsonb), stock, created\_at, updated\_at | specs guarda viscosidade, tipo, API e aplicação |
| product\_images | id, product\_id, path, position, is\_cover | Arquivos no bucket product-images |
| product\_variants | id, product\_id, label (Frasco 1L, Balde 20L), price, promo\_price | Opcional: sem variante, vale o preço do produto |
| categories | id, slug, name, position | Linha leve, Linha pesada, Filtros, Aditivos e graxas |
| brands | id, slug, name, logo\_path | Mobil, Shell, Texaco, Lubrax, Urania, Brutus |
| banners | id, image\_path, title, subtitle, link, is\_active, position | Topo da Home |
| coupons | id, code, percent, description, is\_active | FACLUB10 |
| orders | id, items (jsonb), total\_estimated, customer\_name, vehicle, status, source\_url, created\_at | Status: Novo, Atendido, Cancelado |
| settings | id único: whatsapp, phone, email, address, hours, group\_link, instagram | Uma linha só |

**Segurança por linha (RLS):** visitantes só leem produtos visíveis, categorias, marcas, banners ativos e configurações, e só inserem em orders. Leitura de pedidos e qualquer escrita exigem usuário autenticado com papel admin.

## 8. Requisitos não funcionais e stack

A stack é a mesma do projeto Cake 67: Next.js no App Router, Supabase para banco, login e imagens, e deploy na Vercel.

| Área | Requisito |
| --- | --- |
| Stack | Next.js (App Router, TypeScript), Tailwind CSS, Supabase (Postgres, Auth, Storage) na conta do cliente, Vercel na conta da Onbind |
| Renderização | Páginas públicas estáticas com revalidação sob demanda quando o admin salva (ISR) |
| Performance | Lighthouse mobile 90 ou mais; LCP abaixo de 2,5 s em 4G; imagens em WebP via next/image |
| Responsivo | Pensado primeiro para celular; testado de 360 px a 1440 px |
| Navegadores | Chrome, Safari, Edge e Samsung Internet nas duas últimas versões |
| Acessibilidade | WCAG 2.1 AA: contraste 4,5:1, navegação por teclado, alt nas fotos, alvos de toque de 44 px |
| SEO | Metatags e Open Graph por página, sitemap.xml, robots.txt, dados estruturados LocalBusiness e Product, redirecionamento 301 das URLs do WordPress |
| Segurança | RLS em todas as tabelas, chave service\_role só no servidor, painel em /admin protegido por middleware, limite de envios no pedido contra spam |
| LGPD | Política de privacidade, aviso de cookies antes de GA4 e Pixel, pedido guarda só nome e veículo informados pelo cliente |
| Medição | GA4 e Meta Pixel com eventos: view\_item, add\_to\_cart, send\_order\_whatsapp, click\_whatsapp, copy\_coupon, join\_group |
| Domínio | faclubrificantes.com.br apontado para a Vercel; e-mail contato@ mantido no provedor atual |
| Backup | Exportação semanal do banco e das imagens, já que o plano gratuito do Supabase não inclui backup diário |

## 9. Métricas de sucesso

As métricas saem do GA4 e da tabela orders, revisadas todo mês a partir do lançamento. O site atual não mede conversão, então o primeiro mês serve de base para as metas.

| KPI | Tipo | Como medir | Meta |
| --- | --- | --- | --- |
| Pedidos enviados pelo carrinho | Primário | Linhas em orders por mês | \[META\] após o 1º mês |
| Cliques no WhatsApp (agendar e pedir) | Primário | Evento click\_whatsapp + send\_order\_whatsapp | \[META\] após o 1º mês |
| Taxa de adição ao carrinho | Secundário | add\_to\_cart ÷ view\_item | \[META\] |
| Cópias do cupom | Secundário | Evento copy\_coupon | \[META\] |
| Entradas no grupo vindas do site | Secundário | Evento join\_group | \[META\] |
| Tempo para publicar um produto | Operacional | Teste com a pessoa da loja | Menos de 5 minutos |
| Performance mobile | Técnico | Lighthouse e Core Web Vitals | 90 ou mais; LCP abaixo de 2,5 s |

## 10. Cronograma

&#91;embedded content: cronograma do MVP · 4 semanas, 4 aprovações\]

Cada semana termina com uma aprovação; o painel vem antes do site para a loja já cadastrar produtos enquanto as páginas públicas são montadas. A data de início depende do kickoff.

## 11. Riscos e decisões

O maior risco ao prazo de 30 dias é o conteúdo: sem fotos reais e lista de produtos com preço, o site lança vazio.

| Risco | Severidade | Mitigação |
| --- | --- | --- |
| Fotos e lista de produtos não chegam a tempo | Alta | Marcar a sessão de fotos na semana 1; time da loja cadastra pelo painel na semana 2; fotos de banco onde faltar |
| Preços mudam com frequência e ficam desatualizados | Média | Aviso de confirmação no atendimento; interruptor de oferta e edição rápida no admin |
| Uso de logos e nomes das marcas de lubrificante | Média | Usar só nome em texto ou logos fornecidos pelo distribuidor |
| Pedido via WhatsApp não garante compra | Média | Registrar todo pedido em orders e acompanhar status no admin |
| Queda de posição no Google na troca de site | Média | Mapear URLs antigas e redirecionar com 301; enviar sitemap no Search Console |
| Acesso ao domínio e DNS | Baixa | Confirmar quem administra o registro.br na semana 1 |
| Spam no formulário de pedido | Baixa | Limite de envios por IP e validação no servidor |

**Decisões**

| Tema | Decisão |
| --- | --- |
| WhatsApp de pedidos e agendamentos | (11) 2954-5764 |
| Preços no site | Todos os produtos mostram preço |
| Cupom FACLUB10 | Vale só para serviços feitos na loja, não para compra de produto |
| Cadastro dos produtos | O próprio time da loja cadastra pelo painel |
| Fotos da loja e dos produtos | Haverá sessão de fotos |
| Acesso ao painel | contato@onbind.com.br |
| Hospedagem | Vercel na conta da Onbind; Supabase na conta do cliente, plano gratuito |
| Tempo médio da troca | Sem essa informação; o site não cita tempo de serviço |

**Ainda em aberto**

- [ ] Data da sessão de fotos (ainda sem data; até lá, fotos de banco)
