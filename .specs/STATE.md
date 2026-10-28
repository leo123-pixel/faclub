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

## Handoff

- **Feature**: MVP inteiro (`.specs/features/*`)
- **Phase / Task**: Specify, aguardando respostas às perguntas Q1 a Q10 e a aprovação das specs
- **Completed**: none
- **In-progress** (file:line): none
- **Next step**: registrar as respostas nas specs (critério, Assumptions ou AD-NNN), rodar `validate_spec.py` em cada feature e pedir a aprovação de painel-catalogo
- **Blockers**: perguntas Q1 a Q10 em aberto
- **Uncommitted files**: none
- **Branch**: claude/festive-sagan-40ifio
