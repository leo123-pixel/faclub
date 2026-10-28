# STATE

## Decisions

### AD-001 · active
- **Decision**: O site é um Next.js (App Router, TypeScript) com Tailwind CSS, Supabase (Postgres, Auth, Storage) na conta do cliente e deploy na Vercel na conta da Onbind.
- **Reason**: Decisão do PRD (seção 8): mesma stack do projeto Cake 67, que a Onbind já opera; o plano gratuito do Supabase cobre o MVP.
- **Trade-off**: Fica preso ao Supabase para login, banco e imagens; o plano gratuito não tem backup diário, então o backup semanal é responsabilidade do projeto.
- **Scope**: todas as features
- **Date**: 2026-10-28
- **Status**: active

### AD-002 · active
- **Decision**: O MVP é entregue em cinco features, nesta ordem: painel-catalogo, painel-conteudo, site-publico, carrinho-pedidos, lancamento.
- **Reason**: O cronograma do PRD põe o painel antes do site para a loja cadastrar produtos enquanto as páginas públicas são montadas; cada feature termina com uma aprovação.
- **Trade-off**: O site público só aparece na terceira entrega; até lá a loja vê apenas o painel.
- **Scope**: planejamento do MVP
- **Date**: 2026-10-28
- **Status**: active

### AD-003 · active
- **Decision**: Cada embalagem de um produto é uma linha em `product_variants` com preço e preço promocional próprios; o cadastro mostra esses campos para cada embalagem marcada.
- **Reason**: Pergunta Q1 ("cada embalagem marcada no cadastro ganha preço e preço promocional próprios?"), opção escolhida: sim - user: "ok para todas as recomendações, pode seguir". A página do produto troca o preço ao trocar a embalagem.
- **Trade-off**: O formulário fica mais longo que o da captura, que tem uma só linha de preço.
- **Scope**: painel-catalogo, site-publico, carrinho-pedidos
- **Date**: 2026-10-28
- **Status**: active

### AD-004 · active
- **Decision**: O botão principal da página do produto é "Adicionar ao carrinho", no lugar do "Pedir pelo WhatsApp" da captura.
- **Reason**: Pergunta Q2 ("trocar 'Pedir pelo WhatsApp' por 'Adicionar ao carrinho'?"), opção escolhida: sim - user: "ok para todas as recomendações, pode seguir". O PRD (US03) manda montar o carrinho antes de enviar.
- **Trade-off**: Quem quer só um item dá um passo a mais até o WhatsApp.
- **Scope**: site-publico, carrinho-pedidos
- **Date**: 2026-10-28
- **Status**: active

### AD-005 · active
- **Decision**: O topo do site ganha o ícone de sacola com contador entre o menu e "Agendar troca", e o rodapé ganha o link "Política de privacidade".
- **Reason**: Pergunta Q3 ("adicionar um ícone de sacola com o número de itens no cabeçalho, mais o link 'Política de privacidade' no rodapé?"), opção escolhida: sim - user: "ok para todas as recomendações, pode seguir". RF11 e RF10.
- **Trade-off**: O topo e o rodapé têm um item a mais que a captura.
- **Scope**: site-publico, carrinho-pedidos
- **Date**: 2026-10-28
- **Status**: active

### AD-006 · active
- **Decision**: A coluna "Oferta" da lista de produtos do painel é um interruptor, não o selo da captura.
- **Reason**: Pergunta Q5 ("a coluna 'Oferta' vira interruptor em vez de selo?"), opção escolhida: sim - user: "ok para todas as recomendações, pode seguir". RF18 (Must).
- **Trade-off**: A coluna perde o selo amarelo "Em oferta" da captura.
- **Scope**: painel-catalogo
- **Date**: 2026-10-28
- **Status**: active

### AD-007 · active
- **Decision**: O menu lateral do painel ganha o item "Pedidos" logo abaixo de "Produtos".
- **Reason**: Pergunta Q6 ("incluir 'Pedidos' abaixo de 'Produtos'?"), opção escolhida: sim - user: "ok para todas as recomendações, pode seguir". RF25.
- **Trade-off**: Um item a mais no menu que a captura.
- **Scope**: painel-catalogo, carrinho-pedidos
- **Date**: 2026-10-28
- **Status**: active

### AD-008 · active
- **Decision**: O cartão "Cliques no WhatsApp · 30 dias" da lista do painel vira "Pedidos · 30 dias", contado da tabela `orders`; cliques ficam só no GA4.
- **Reason**: Pergunta Q7 ("trocar por 'Pedidos · 30 dias'?"), opção escolhida: sim - user: "ok para todas as recomendações, pode seguir". Contar cliques no banco exigiria uma tabela fora do modelo do PRD.
- **Trade-off**: O painel não mostra cliques; quem quiser vê no GA4.
- **Scope**: painel-catalogo
- **Date**: 2026-10-28
- **Status**: active

### AD-009 · active
- **Decision**: O preço mora só em `product_variants`; `products` não tem `price` nem `promo_price`, e todo produto tem ao menos uma embalagem.
- **Reason**: Com AD-003 cada embalagem tem preço; manter também o preço no produto criaria dois valores que podem divergir.
- **Trade-off**: Diverge do modelo de dados do PRD (seção 7); ordenar por preço exige olhar a primeira embalagem.
- **Scope**: banco, painel-catalogo, site-publico, carrinho-pedidos
- **Date**: 2026-10-28
- **Status**: active

### AD-010 · active
- **Decision**: Os testes rodam contra um Postgres 16 local com as migrações reais; o e2e usa um Supabase local montado com binários do PostgREST e do Supabase Auth (GoTrue) atrás de um gateway Node que também simula o Storage (`scripts/local-supabase/`).
- **Reason**: As imagens Docker do Supabase não baixam neste ambiente (ECR bloqueado, Docker Hub com 429); os binários e o Postgres local funcionam aqui e no CI.
- **Trade-off**: O Storage do e2e é simulado; as políticas do bucket são testadas direto no Postgres e conferidas à mão no Supabase real antes do lançamento.
- **Scope**: todas as features
- **Date**: 2026-10-28
- **Status**: active

### AD-011 · active
- **Decision**: Regras que mudam o que a pessoa vê (filtro, busca, ordenação, paginação, contagens, preço exibido) rodam em funções puras em `src/lib/domain`; regras de integridade (preço promocional, capa única, oferta exige preço promocional, slug único, exclusão bloqueada) rodam no Postgres; o RLS é a única barreira de acesso.
- **Reason**: Critical Rule 6 da skill: regra no navegador sai sem teste; o banco protege mesmo quando a interface falha.
- **Trade-off**: Algumas mensagens dependem de traduzir códigos de erro do Postgres nas Server Actions.
- **Scope**: todas as features
- **Date**: 2026-10-28
- **Status**: active

### AD-012 · active
- **Decision**: `cacheComponents` fica desligado no `next.config.ts`; as páginas públicas usam ISR com `revalidatePath` e o painel é dinâmico.
- **Reason**: O create-next-app 16.4 liga `cacheComponents` por padrão, que obriga toda leitura de sessão a ficar atrás de `<Suspense>` e troca o modelo de revalidação; o PRD e o design pedem ISR com revalidação sob demanda, que o Next 16 mantém ("caching-without-cache-components").
- **Trade-off**: Abre mão do shell estático parcial e do prefetch parcial do modelo novo.
- **Scope**: todas as features
- **Date**: 2026-10-28
- **Status**: active

### AD-013 · active
- **Decision**: Além dos chips Frasco 1L, Frasco 4L, Balde 20L e Tambor 200L da captura de cadastro, o formulário oferece "Unidade" e "Outra" (embalagem com nome livre).
- **Reason**: Premissa "Embalagens oferecidas no cadastro" da spec de painel-catalogo ("Frasco 1L, Frasco 4L, Balde 20L, Tambor 200L e 'Unidade'; a loja pode digitar outra"), confirmada com as demais - user: "ok para todas as recomendações, pode seguir". Filtros e graxas não cabem nas quatro embalagens.
- **Trade-off**: Dois chips a mais que a captura.
- **Scope**: painel-catalogo
- **Date**: 2026-10-28
- **Status**: active

### AD-014 · active
- **Decision**: O menu lateral do painel tem ícones nos itens e o bloco do usuário com "Sair" no rodapé em todas as telas, como na captura `admin-produtos.png`; a captura `admin-cadastro.png`, que não desenha os dois, não é seguida nesse ponto.
- **Reason**: Pergunta Q11 ("as duas capturas se contradizem no menu: manter ícones e bloco do usuário em todas as telas, ou tirar de todas?"), opção escolhida: manter - user: "ok, mantém ícones e bloco do usuário em todas as telas". Um shell só para o painel inteiro.
- **Trade-off**: A tela de cadastro difere da sua captura no menu lateral.
- **Scope**: painel-catalogo, painel-conteudo, carrinho-pedidos
- **Date**: 2026-10-28
- **Status**: active

## Handoff

- **Feature**: painel-catalogo (`.specs/features/painel-catalogo`)
- **Phase / Task**: Execute, validação: T1-T28 feitos; verifier e screens round 1 voltaram; achados do verifier fechados; check_proofs --mutations verde (60/61, 3 mutações mortas) no HEAD 794efb9
- **Completed**: T1-T28, fix pass (ca73dc9, 7a17eb0, 15d126a, 288a35d, 492f344)
- **In-progress** (file:line): none
- **Next step**: com a resposta da Q11, ajustar `## Differences from the source` (ou o shell), rodar o screens sub-agent round 2 só nas linhas `differs` de `screens.md`, depois `validate_verification.py painel-catalogo` e as lições
- **Blockers**: pergunta Q11 (ícones e bloco do usuário no menu: as duas capturas se contradizem)
- **Uncommitted files**: none
- **Branch**: claude/festive-sagan-40ifio
