# Carrinho e pedido pelo WhatsApp Specification

**Approved**: 2026-10-28 - user: "ok para todas as recomendações, pode seguir"

## Problem Statement

Oficinas e clientes que compram lubrificante querem pedir vários itens de uma vez sem digitar a lista no WhatsApp. A loja, por sua vez, não tem registro do que chegou pelo site. Esta feature entrega o carrinho salvo no navegador, o envio do pedido já escrito para o WhatsApp da loja e a lista de pedidos no painel.

## Goals

- [ ] O comprador envia um pedido com vários itens em menos de 1 minuto depois de montar o carrinho
- [ ] Todo pedido enviado pelo site fica registrado no painel com itens, total e status

## Out of Scope

| Feature | Reason |
| --- | --- |
| Pagamento online e frete | PRD seção 4: V2 |
| Conta de cliente e histórico de pedidos | PRD seção 4: V2 |
| Baixa de estoque pelo pedido | PRD seção 4: V2 |
| Aplicar o FACLUB10 sobre produtos | O cupom vale só para serviços na loja (PRD, Decisões) |
| Avisar a loja por e-mail a cada pedido | Não pedido; o pedido já chega no WhatsApp |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Validade do carrinho | 7 dias contados da última alteração; depois disso o carrinho abre vazio | RF12 | y |
| Onde fica o carrinho | Página `/carrinho`; o "+" do card e o botão da página do produto adicionam sem sair da página | O PRD lista o Carrinho como página; o protótipo não desenha | y |
| Mesmo produto e embalagem adicionados de novo | Somam na quantidade do item existente, até 99 | Evita duas linhas iguais | y |
| "+" do card no catálogo | Adiciona 1 unidade da primeira embalagem | O card não tem seletor de embalagem | y |
| Preço do pedido | O servidor recalcula cada item com o preço atual do banco; o total da mensagem usa esse cálculo | Preço no navegador pode estar velho ou adulterado | y |
| Item que ficou oculto ou foi removido | O carrinho mostra "Indisponível" no item e o envio sai sem ele | Não pedir o que a loja não vende mais | y |
| Limite de envios contra spam | 5 pedidos por IP a cada 10 minutos | PRD seção 8 e Riscos: limite por IP | y |
| Número do pedido | Sequencial, mostrado na mensagem como "Pedido nº 1042" | Ajuda a loja a achar o pedido no painel | y |
| Formato da mensagem do WhatsApp | O texto de CART-04 critério 2 | US03 lista nome, embalagem, quantidade, preço de cada item e total | y |
| Q8: e se a gravação do pedido falhar? | Abre o WhatsApp mesmo assim, sem número de pedido (CART-04 AC 12) | user: "ok para todas as recomendações, pode seguir"; perder a venda custa mais que perder o registro | y |
| Q9: cupom no pedido | Caixa "Quero fazer a troca na loja com o cupom FACLUB10"; marcada, entra na mensagem e em `orders.coupon_code` (CART-04 AC 13 e 14) | user: "ok para todas as recomendações, pode seguir"; US07 lista o cupom no pedido | y |

**Open questions:** none - Q8 e Q9 respondidas em 2026-10-28 (user: "ok para todas as recomendações, pode seguir").

---

## User Stories

### P1: Montar o carrinho ⭐ MVP

**User Story**: Como comprador, quero adicionar vários produtos ao carrinho, mudar quantidades e remover itens.

**Why P1**: US03, RF11, RF12 (Must).

**Acceptance Criteria**:

1. WHEN o visitante adiciona um produto na página do produto THEN o carrinho SHALL ganhar a embalagem e a quantidade escolhidas e o sistema SHALL mostrar "Adicionado ao carrinho" com o link "Ver carrinho"
2. WHEN o visitante usa o "+" de um card THEN o carrinho SHALL ganhar 1 unidade da primeira embalagem do produto
3. WHEN o mesmo produto e embalagem já estão no carrinho THEN a nova adição SHALL somar na quantidade do item, até 99
4. The contador do topo SHALL mostrar a soma das quantidades do carrinho e SHALL sumir com o carrinho vazio
5. WHEN o visitante muda a quantidade de um item em `/carrinho` THEN o subtotal do item e o total estimado SHALL mudar na hora
6. WHEN o visitante usa "Remover" num item THEN o item SHALL sair do carrinho
7. WHEN o visitante fecha o navegador e volta em até 7 dias THEN o carrinho SHALL estar com os mesmos itens
8. WHEN o visitante volta depois de 7 dias sem alterar o carrinho THEN o carrinho SHALL abrir vazio
9. WHEN o carrinho está vazio THEN `/carrinho` SHALL mostrar "Seu carrinho está vazio." e o botão "Ver produtos"
10. IF o navegador bloquear o armazenamento local THEN o carrinho SHALL funcionar durante a visita e só não SHALL sobreviver ao fechamento
11. WHEN `/carrinho` abre THEN o sistema SHALL buscar o preço atual de cada item e marcar como "Indisponível" o que estiver oculto ou não existir mais

**Independent Test**: Adicionar dois produtos, fechar o navegador, voltar: os dois continuam lá, com o contador certo.

---

### P1: Enviar o pedido pelo WhatsApp ⭐ MVP

**User Story**: Como comprador, quero enviar tudo de uma vez pelo WhatsApp, com a lista já escrita.

**Why P1**: US03, RF13, RF14, RF15 (Must).

**Acceptance Criteria**:

1. The página `/carrinho` SHALL mostrar o aviso "Preço e disponibilidade são confirmados no atendimento pelo WhatsApp."
2. WHEN o visitante usa "Enviar pedido pelo WhatsApp" THEN o sistema SHALL abrir `https://wa.me/55<WhatsApp das configurações>` com o texto do "Modelo da mensagem" abaixo, uma linha por item
3. WHERE o visitante não informou nome ou veículo a mensagem SHALL sair sem a linha correspondente
4. WHEN o visitante usa "Enviar pedido pelo WhatsApp" THEN o servidor SHALL gravar em `orders` os itens (nome, embalagem, quantidade e preço de cada um), o total estimado, o nome, o veículo, o status "Novo" e a página de origem, antes de abrir o WhatsApp
5. The servidor SHALL calcular preços e total a partir do banco, usando o preço promocional só em produto com oferta ativa
6. IF o carrinho tiver itens indisponíveis THEN o pedido SHALL sair sem eles e o carrinho SHALL avisar "N item(ns) indisponível(is) ficou(aram) de fora."
7. IF o mesmo IP passar de 5 pedidos em 10 minutos THEN o servidor SHALL recusar com 429 e a página SHALL mostrar "Muitos pedidos seguidos. Espere alguns minutos ou fale direto no WhatsApp."
8. IF o nome passar de 80 caracteres ou o veículo de 40 THEN o sistema SHALL não enviar e mostrar "Use até 80 caracteres no nome e 40 no veículo."
9. IF o carrinho enviado tiver mais de 30 itens ou quantidade fora de 1 a 99 THEN o servidor SHALL recusar com 400
10. WHEN o pedido é enviado THEN o carrinho SHALL ficar vazio e a página SHALL mostrar "Pedido enviado! Termine a conversa no WhatsApp."
11. The pedido SHALL guardar só nome e veículo informados pelo cliente, sem telefone, e-mail ou IP
12. IF a gravação do pedido falhar ou demorar mais de 5 segundos THEN o sistema SHALL abrir o WhatsApp com a mesma mensagem, sem o trecho "(Pedido nº <número>)"
13. WHERE existe cupom ativo `/carrinho` SHALL mostrar a caixa "Quero fazer a troca na loja com o cupom <código>", desmarcada
14. WHEN a caixa do cupom está marcada no envio THEN a mensagem SHALL ganhar a linha "Cupom: <código> (troca na loja)" e o pedido SHALL gravar o código em `coupon_code`

**Modelo da mensagem** (valores em reais no formato "1.234,56"):

```
Olá! Quero fazer este pedido pelo site (Pedido nº <número>):

- <marca> <nome> · <embalagem> · <qtd> x R$ <preço> = R$ <subtotal>

Total estimado: R$ <total>
Nome: <nome>
Veículo: <placa ou modelo>
Cupom: <código> (troca na loja)
```

**Independent Test**: Com 2 itens no carrinho e o nome preenchido, o WhatsApp abre com as duas linhas, o total e o nome, e o pedido aparece no painel como "Novo".

---

### P1: Plano B sem cotação

**User Story**: Como comprador, quero que o pedido chegue à loja mesmo quando o site não consegue buscar os preços nem gravar o pedido.

**Why P1**: Achado do Verifier em 2026-10-28: com o Supabase fora do ar, o plano B de CART-04 AC 12 mandava a mensagem sem nenhum item.

**Acceptance Criteria**:

1. IF o plano B de CART-04 AC 12 não tiver o preço de um item THEN a mensagem SHALL listar o item como "- <marca> <nome> · <embalagem> · <qtd> x preço a confirmar" e o total como "Total estimado: a confirmar"

**Independent Test**: Com a cotação e a gravação fora do ar, enviar 2 itens: o WhatsApp abre com os dois itens e "preço a confirmar".

---

### P2: Ver os pedidos no painel

**User Story**: Como administrador, quero ver os pedidos enviados pelo site e marcar o andamento.

**Why P2**: US07, RF25 (Should).

**Acceptance Criteria**:

1. WHEN o administrador abre "Pedidos" THEN o sistema SHALL listar os pedidos do mais novo ao mais antigo com número, data e hora, itens, total estimado, nome, veículo, cupom e status
2. WHEN o administrador muda o status de um pedido para "Novo", "Atendido" ou "Cancelado" THEN o sistema SHALL gravar o novo status sem recarregar a página
3. WHEN o administrador filtra por status THEN a lista SHALL mostrar só os pedidos daquele status
4. The banco SHALL recusar a leitura de `orders` sem sessão de administrador
5. WHEN não há pedidos THEN a lista SHALL mostrar "Nenhum pedido ainda."

**Independent Test**: Enviar um pedido pelo site, marcar como "Atendido" no painel e filtrar por "Atendido".

---

## Edge Cases

- IF o preço de um item mudou desde que entrou no carrinho THEN `/carrinho` SHALL mostrar o preço novo
- IF o WhatsApp não abrir no computador THEN a página SHALL manter o botão "Abrir o WhatsApp de novo" com o mesmo link
- WHEN o visitante clica duas vezes seguidas em enviar THEN o sistema SHALL gravar um pedido só (o botão fica desativado até a resposta)

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| CART-01 | P1: Montar o carrinho (AC 1-11) | Design | Pending |
| CART-04 | P1: Enviar o pedido pelo WhatsApp (AC 1-14) | Design | Pending |
| CART-05 | P1: Plano B sem cotação (AC 1) | Execute | Pending |
| ORD-01 | P2: Ver os pedidos no painel (AC 1-5) | Design | Pending |

**Coverage:** 4 total; CART-05 entrou depois do Verifier (2026-10-28) e é provado por C31.

PRD coberto aqui: RF11 a RF15, RF25, US03, US07.

---

## Sources

- `docs/referencias/PRD.md` - US03, US07, RF11 a RF15, RF25, tabela orders, limite de envios
- Sem captura: o protótipo não desenha o carrinho nem a lista de pedidos; o card do catálogo (`site-publico/captures/catalogo.png`) desenha o botão "+"

---

## Success Criteria

- [ ] 100% dos pedidos enviados aparecem no painel (conferido contra as conversas no WhatsApp no 1º mês)
- [ ] O comprador envia o pedido em menos de 1 minuto depois de montar o carrinho
